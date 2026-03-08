import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '../UserContext.jsx';
import { loadPosts, savePosts } from './postsDB.js';

// ═══════════════════════════════════════════════════════════════════════
// POST CONTEXT
// ═══════════════════════════════════════════════════════════════════════
//
// INTER-PROVIDER DEPENDENCY:
//   PostProvider calls useUser() to read the current user's shortName
//   and auto-tag every new post with the author. This means UserProvider
//   MUST be an ancestor of PostProvider — otherwise useUser() throws.
//
//   Full dependency chain:
//     AppProvider (outermost)  ← ThemeProvider calls useApp()
//       → ThemeProvider        ← UserProvider calls useTheme()
//         → UserProvider       ← PostProvider calls useUser()
//           → PostProvider
//
// PERSISTENCE:
//   Posts are stored in the browser's IndexedDB (database: "PostsDB",
//   store: "posts", keyed by userId). On mount, PostProvider loads saved
//   posts. If none exist, it randomly picks 2 proverbs from a list of 20
//   as seed posts. Every mutation (add, like) is persisted automatically.
//
// ═══════════════════════════════════════════════════════════════════════

// 20 proverbs, each ≤ 10 words — used as seed posts when IndexedDB is empty.
const PROVERBS = [
  'Actions speak louder than words.',
  'A penny saved is a penny earned.',
  'The early bird catches the worm.',
  'Where there is a will there is a way.',
  'Practice makes perfect.',
  'Better late than never.',
  'Two wrongs do not make a right.',
  'Knowledge is power.',
  'Fortune favors the bold.',
  'Honesty is the best policy.',
  'When in Rome do as Romans do.',
  'Necessity is the mother of invention.',
  'The pen is mightier than the sword.',
  'People in glass houses should not throw stones.',
  'A journey of a thousand miles begins with one step.',
  'Still waters run deep.',
  'Time is money.',
  'Rome was not built in a day.',
  'Well begun is half done.',
  'Hope for the best prepare for the worst.',
];

/** Pick `count` random unique items from an array. */
function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const PostContext = createContext(undefined);

export function PostProvider({ children }) {
  // ── REAL INTER-PROVIDER DEPENDENCY: UserContext ────────────────────
  // PostProvider calls useUser() to read the current user's shortName.
  // This REQUIRES UserProvider to be an ancestor in the tree.
  // If you move PostProvider outside UserProvider, this line throws:
  //   "useUser must be used within a UserProvider"
  //
  // The shortName is used to auto-tag every new post — callers of
  // addPost() only need to provide a title, not the author.
  // ──────────────────────────────────────────────────────────────────
  const user = useUser();

  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ── LOAD from IndexedDB on mount ──────────────────────────────────
  // If saved posts exist → restore them.
  // If not → seed with 2 random proverbs, auto-tagged with user.shortName.
  // ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    // CALLER ERROR HANDLING for Promises that can reject:
    //   loadPosts() can reject (via reject(request.error) in postsDB.js)
    //   — e.g., IndexedDB blocked, quota exceeded, or private browsing.
    //   The caller MUST handle the rejection. Two equivalent ways:
    //
    //   Option A: .catch() on the Promise chain  ← used here
    //     loadPosts(userId)
    //       .then(saved => { ... })
    //       .catch(err => console.error(err));
    //
    //   Option B: try/catch around await
    //     try {
    //       const saved = await loadPosts(userId);
    //       ...
    //     } catch (err) {
    //       console.error(err);
    //     }
    //
    //   Both do the same thing. We use Option A because useEffect
    //   callbacks cannot be async (React ignores the returned Promise),
    //   so `await` is not available directly inside useEffect.
    //   Without .catch(), a rejected Promise is silently swallowed —
    //   no error in the console, no feedback, just a broken UI.
    loadPosts(user.id)
      .then(saved => {
        if (cancelled) return;
        if (saved && saved.length > 0) {
          setPosts(saved);
        } else {
          // No saved posts — seed with 2 random proverbs
          const seeds = pickRandom(PROVERBS, 2).map((proverb, i) => ({
            id: i + 1,
            title: proverb,
            author: user.shortName,
            likes: 0,
          }));
          setPosts(seeds);
        }
        setLoaded(true);
      })
      .catch(err => {
        // IndexedDB failed — log and fall back to seed proverbs so the
        // UI still works (read-only, posts won't persist this session).
        console.error('Failed to load posts from IndexedDB:', err);
        if (cancelled) return;
        const seeds = pickRandom(PROVERBS, 2).map((proverb, i) => ({
          id: i + 1,
          title: proverb,
          author: user.shortName,
          likes: 0,
        }));
        setPosts(seeds);
        setLoaded(true);
      });

    return () => { cancelled = true; };
  }, [user.id, user.shortName]);

  // ── PERSIST to IndexedDB on every change (after initial load) ─────
  // Same pattern as loadPosts above: .catch() to handle rejection.
  useEffect(() => {
    if (loaded) {
      savePosts(user.id, posts).catch(err => {
        console.error('Failed to save posts to IndexedDB:', err);
      });
    }
  }, [loaded, user.id, posts]);

  // addPost only takes `title` — the author is auto-tagged from UserContext.
  const addPost = useCallback((title) => {
    setPosts(prev => [...prev, {
      id: Date.now(),   // unique id based on timestamp
      title,
      author: user.shortName,
      likes: 0,
    }]);
  }, [user.shortName]);

  const likePost = useCallback((postId) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  }, []);

  const value = useMemo(
    () => ({ posts, addPost, likePost }),
    [posts, addPost, likePost]
  );

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }

  return context;
}
