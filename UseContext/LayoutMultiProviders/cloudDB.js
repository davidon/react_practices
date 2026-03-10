// ═══════════════════════════════════════════════════════════════════════
// CLOUD DB — JSONBlob.com storage for posts
// ═══════════════════════════════════════════════════════════════════════
// Free cloud JSON storage — no API key, no registration, no signup.
//
// API: https://jsonblob.com/api/jsonBlob
//   POST   /api/jsonBlob          → create new blob (returns ID in Location header)
//   GET    /api/jsonBlob/:id      → read blob
//   PUT    /api/jsonBlob/:id      → update blob (full replace)
//
// Data shape stored in the blob:
//   { "posts": { "<userId>": [ ...posts ], "<userId>": [ ...posts ] } }
//
// Each user's posts array is keyed by userId (as string).
// The entire blob is read/written atomically — no partial updates.
//
// BLOB ID PERSISTENCE:
//   The blob ID is saved in localStorage so it survives page refreshes.
//   On first visit (no blob ID in localStorage), a new blob is created.
//
// FALLBACK:
//   If JSONBlob is unreachable, operations fail silently and the app
//   falls back to IndexedDB (local storage) via postsDB.js.
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = 'https://jsonblob.com/api/jsonBlob';
const BLOB_ID_KEY = 'cloudDB_blobId';

/** Get or create the blob ID. */
async function getBlobId() {
  let blobId = localStorage.getItem(BLOB_ID_KEY);
  if (blobId) return blobId;

  // Create a new blob
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ posts: {} }),
  });

  if (!res.ok) throw new Error(`Failed to create blob: HTTP ${res.status}`);

  // Blob ID is in the Location header or X-JsonBlob-Id header
  blobId = res.headers.get('x-jsonblob-id');
  if (!blobId) {
    const location = res.headers.get('location');
    if (location) blobId = location.split('/').pop();
  }

  if (!blobId) throw new Error('No blob ID in response headers');

  localStorage.setItem(BLOB_ID_KEY, blobId);
  console.log('Cloud DB: created new blob', blobId);
  return blobId;
}

/** Read the full blob data. */
async function readBlob() {
  const blobId = await getBlobId();
  const res = await fetch(`${API_BASE}/${blobId}`);
  if (!res.ok) throw new Error(`Failed to read blob: HTTP ${res.status}`);
  return res.json();
}

/** Write the full blob data (replaces entire content). */
async function writeBlob(data) {
  const blobId = await getBlobId();
  const res = await fetch(`${API_BASE}/${blobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to write blob: HTTP ${res.status}`);
  return res.json();
}

/**
 * Load posts for a specific user from cloud storage.
 * @param {number} userId
 * @returns {Promise<Array|null>} posts array, or null if not found
 */
export async function cloudLoadPosts(userId) {
  try {
    const data = await readBlob();
    const posts = data.posts?.[String(userId)];
    return posts || null;
  } catch (err) {
    console.warn('Cloud DB load failed:', err.message);
    return null;
  }
}

/**
 * Save posts for a specific user to cloud storage.
 * Reads the current blob, updates the user's posts, writes back.
 * @param {number} userId
 * @param {Array} posts
 */
export async function cloudSavePosts(userId, posts) {
  try {
    const data = await readBlob();
    data.posts = data.posts || {};
    data.posts[String(userId)] = posts;
    await writeBlob(data);
  } catch (err) {
    console.warn('Cloud DB save failed:', err.message);
  }
}

/**
 * Get the current blob ID (for display/debugging).
 * @returns {string|null}
 */
export function getCloudBlobId() {
  return localStorage.getItem(BLOB_ID_KEY);
}

