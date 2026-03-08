// ═══════════════════════════════════════════════════════════════════════
// Indexed Database (IndexedDB) helper for post persistence
// ═══════════════════════════════════════════════════════════════════════
// Pure JS module — no React dependency. Wraps the IndexedDB API in
// simple Promise-based functions so PostContext can load/save posts.
//
// Database: "PostsDB"
// Object store: "posts" (one entry per userId, keyed by `userId`)
//   └── value: { userId: number, posts: Post[] }
//
// WHY IndexedDB over localStorage?
//   Both store data on disk in the browser. The difference is the API
//   design, not the storage medium:
//
//   localStorage API — synchronous by design
//     • getItem() / setItem() block the main thread until done.
//     • Values must be strings (need JSON.stringify / JSON.parse).
//     • Limited to ~5 MB per origin.
//
//   IndexedDB API — asynchronous by design
//     • Operations return IDBRequest objects; results arrive via
//       onsuccess / onerror callbacks (or can be wrapped in Promises).
//     • Supports structured data (objects, arrays) — no serialisation.
//     • Can store much larger datasets (hundreds of MB+).
//
//   NOTE: "sync vs async" is determined by the API interface the
//   browser spec authors chose, NOT by the underlying storage type.
//   Both ultimately write to disk; IndexedDB just exposes a non-blocking
//   interface so the main thread isn't frozen during I/O.
// ═══════════════════════════════════════════════════════════════════════

const DB_NAME = 'PostsDB';
// DB_VERSION is the developer-defined SCHEMA version of this database.
// It is NOT the browser version (e.g., Chrome 145) and NOT the version
// of the stored data. It tracks the STRUCTURE of the object stores
// (which stores exist, which indexes, which keyPaths).
//
// The browser compares the version you pass to indexedDB.open() against
// the version it has on disk:
//   • On-disk version < requested version → onupgradeneeded fires
//   • On-disk version === requested version → opens normally
//   • No database on disk (first visit) → treated as version 0,
//     so version 0 < 1 → onupgradeneeded fires
//
// WHAT REQUIRES A VERSION BUMP (change DB_VERSION in code):
//   ✅ Adding/removing an object store    → store.createObjectStore()
//   ✅ Adding/removing an index           → store.createIndex()
//   ✅ Changing a store's keyPath         → must delete & recreate store
//
// WHAT DOES NOT REQUIRE A VERSION BUMP:
//   ❌ Adding a new FIELD to stored objects — IndexedDB is schema-less
//      for data. You can store { userId, posts } today and store
//      { userId, posts, lastModified } tomorrow with the same version.
//      Fields are just properties of JS objects — no column definition.
//   ❌ Writing/reading/deleting data (put, get, delete)
//
// IS VERSION AUTO-BUMPED WHEN savePosts() IS CALLED?
//   No. Data operations never change the schema version.
//   The version only changes when YOU change DB_VERSION in code.
//
// INDEXES — CURRENTLY NONE:
//   Our store uses { keyPath: 'userId' } only. That means we can look
//   up records by userId (store.get(userId)), but we cannot efficiently
//   query by other fields without scanning all records.
//
//   To add an index, bump DB_VERSION and call store.createIndex()
//   inside onupgradeneeded. Example (single-field index):
//
//     // DB_VERSION = 2;
//     // inside onupgradeneeded:
//     const store = tx.objectStore('posts');
//     store.createIndex('byAuthor', 'author');
//     // now you can query: store.index('byAuthor').getAll('Alex');
//
// COMPOSITE KEYS AND INDEXES (like MySQL multi-column):
//   IndexedDB supports composite (multi-field) versions of BOTH:
//
//   1. Composite keyPath (PRIMARY KEY with multiple fields):
//      db.createObjectStore('posts', { keyPath: ['userId', 'postId'] });
//      // MySQL analogy: PRIMARY KEY (userId, postId)
//      // Each record is uniquely identified by the combination.
//      // Lookup: store.get([1, 101])  — must provide both fields.
//
//   2. Composite index (SECONDARY INDEX with multiple fields):
//      store.createIndex('byUserAndDate', ['userId', 'createdAt']);
//      // MySQL analogy: CREATE INDEX idx ON posts(userId, createdAt)
//      // Lookup: store.index('byUserAndDate').getAll([1, '2026-03-08'])
//      // Range:  store.index('byUserAndDate').getAll(
//      //           IDBKeyRange.bound([1, '2026-01-01'], [1, '2026-12-31'])
//      //         )
//
//   Both use array syntax for multiple fields. The leftmost prefix rule
//   applies (same as MySQL): you can query by [userId] alone, but not
//   by [createdAt] alone without a separate index.
const DB_VERSION = 1;
const STORE_NAME = 'posts';

/**
 * Open (or create) the database. Returns a Promise<IDBDatabase>.
 *
 * WHY NOT `async function openDB()`?
 *   `async` is syntactic sugar for functions that use `await` internally.
 *   This function doesn't use `await` — it manually constructs a Promise
 *   around the IndexedDB callback API (onupgradeneeded / onsuccess / onerror).
 *
 *   Adding `async` would still work — if an async function returns a
 *   Promise, JS passes it through directly (NOT double-wrapped).
 *   So `async function openDB() { return new Promise(...) }` returns
 *   the same Promise<IDBDatabase>, not Promise<Promise<IDBDatabase>>.
 *
 *   But `async` without `await` is misleading — it signals to the reader
 *   "this function uses await somewhere" when it doesn't. Best practice:
 *   only mark a function `async` if it uses `await` in its body.
 *   And the reverse is a LANGUAGE REQUIREMENT: if a function uses `await`,
 *   it MUST be `async` — otherwise `await` is a syntax error.
 *
 *   In this file:
 *     openDB()    — no `await` → not `async`  (constructs Promise manually)
 *     loadPosts() — uses `await openDB()` → must be `async`
 *     savePosts() — uses `await openDB()` → must be `async`
 *
 * `onupgradeneeded` is the ONLY callback for schema setup — there is no
 * separate `oncreated` or `onfirstvisit` callback. The name is misleading
 * because it sounds upgrade-only, but IndexedDB treats "database doesn't
 * exist yet" as "upgrading from version 0 to version 1." So:
 *   • First visit:  version 0 → 1  → onupgradeneeded fires
 *   • Version bump: version 1 → 2  → onupgradeneeded fires
 *   • Same version: version 1 → 1  → onupgradeneeded does NOT fire
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // keyPath vs INDEX:
        //
        // keyPath — the PRIMARY KEY of the store (like MySQL's PRIMARY KEY).
        //   • Every record MUST have this field; it MUST be unique.
        //   • Only ONE keyPath per store (just like one primary key per table).
        //   • Used for direct lookups: store.get(userId)
        //   • Set at store creation time; cannot be changed later.
        //   • Here: { keyPath: 'userId' } means each record is uniquely
        //     identified by its `userId` field. Two records with the same
        //     userId? The second overwrites the first (via store.put()).
        //
        // index — a SECONDARY lookup path (like MySQL's CREATE INDEX).
        //   • A store can have MANY indexes (zero or more).
        //   • An index does NOT have to be unique (unless you set { unique: true }).
        //   • Used for queries on non-primary fields:
        //       store.index('byAuthor').getAll('Alex')
        //   • Created via store.createIndex() inside onupgradeneeded.
        //   • Can be added/removed by bumping DB_VERSION.
        //
        // Analogy to MySQL:
        //   keyPath: 'userId'                     → PRIMARY KEY (userId)
        //   store.createIndex('byAuthor','author') → CREATE INDEX byAuthor ON posts(author)
        //
        // Currently this store has a keyPath only, no indexes.
        // To query by a non-key field (e.g., author), you'd need to add
        // an index — see the "INDEXES" comment block above DB_VERSION.
        db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load posts for a given userId.
 * Returns the posts array, or `null` if nothing is saved.
 *
 */
export async function loadPosts(userId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(userId);

    request.onsuccess = () => {
      // Optional chaining: request.result?.posts
      //   → if request.result is null/undefined, returns undefined
      //   → equivalent to: request.result ? request.result.posts : undefined
      //
      // We use `?? null` to normalise `undefined` to `null`, making the
      // return type explicitly "posts array or null" (not "or undefined").
      resolve(request.result?.posts ?? null);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save posts for a given userId.
 *
 * STORAGE STRATEGY — FULL OVERWRITE vs APPEND/PATCH:
 *   Currently we use store.put({ userId, posts }) which REPLACES the
 *   entire posts array for this userId. This is the simplest approach
 *   for our use case (small arrays, infrequent writes).
 *
 *   IndexedDB CAN do granular operations if each post were its own record:
 *
 *   Schema change needed (bump DB_VERSION to 2):
 *     store = db.createObjectStore('posts', { keyPath: 'id' });
 *     store.createIndex('byUser', 'userId');    // to query by user
 *
 *   Then you could:
 *     • APPEND only new posts:
 *         store.add({ id, title, author, userId, likes: 0 });
 *         // add() throws if `id` already exists — insert only
 *
 *     • UPDATE only changed posts:
 *         store.put({ id, title, author, userId, likes: 5 });
 *         // put() inserts if new, overwrites if `id` exists — upsert
 *
 *     • DELETE a single post:
 *         store.delete(postId);
 *
 *   Trade-offs:
 *     • Granular: more efficient for large datasets, but more complex
 *       code (need to diff old vs new, handle each operation).
 *     • Full overwrite: simpler code, fine for small arrays (<1000 items),
 *       but rewrites unchanged posts on every save.
 *
 *   We use full overwrite here because the posts array is small and
 *   simplicity matters more than write efficiency for this demo.
 *
 * WHY resolve() IS EMPTY (not resolve(request.result)):
 *   savePosts is a "fire and forget" write. The caller (PostContext.jsx)
 *   doesn't use the resolved value — it only needs to know the write
 *   succeeded (Promise resolved) or failed (Promise rejected).
 *   store.put() returns the key of the written record, but we already
 *   know the key (userId), so returning it would be redundant.
 */
export async function savePosts(userId, posts) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put({ userId, posts });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

