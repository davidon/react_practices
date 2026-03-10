import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '../UserContext.jsx';
import { loadPosts, savePosts } from './postsDB.js';
import { cloudLoadPosts, cloudSavePosts } from './cloudDB.js';
import { createSeedPosts, sanitisePosts } from '../proverbs.js';
import { isSamePerson } from '../users.js';
import { fetchProverbs } from '../proverbsAPI.js';

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
//   Posts are stored in TWO places (dual-write):
//     1. IndexedDB (local) — fast, works offline, browser-scoped
//     2. JSONBlob.com (cloud) — free, no signup, shareable across devices
//
//   On load: try cloud first → fall back to IndexedDB → empty
//   On save: write to both IndexedDB and cloud in parallel
//
//   Each post stores a `likedBy` array of usernames (logged-in users
//   who clicked Like). The `likes` count is derived from likedBy.length.
//
// PROVERBS:
//   Proverbs are ephemeral — randomly picked from 20 pre-defined
//   proverbs on every mount (page refresh). They are NOT persisted
//   and NOT counted as posts. They only appear as a placeholder
//   when the user has no real posts.
//
// ═══════════════════════════════════════════════════════════════════════

const PostContext = createContext(undefined);

export function PostProvider({ children }) {
  // ── REAL INTER-PROVIDER DEPENDENCY: UserContext ────────────────────
  const user = useUser();

  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ── EPHEMERAL PROVERBS — fetched from ZenQuotes API on mount ──────
  // Falls back to hardcoded proverbs if the API is unavailable.
  // Never persisted — refreshed on every page load.
  const [proverbs, setProverbs] = useState([]);
  useEffect(() => {
    let cancelled = false;
    fetchProverbs(3).then(quotes => {
      if (!cancelled) {
        setProverbs(quotes.map((q, i) => ({
          id: -(i + 1), // negative IDs to distinguish from real posts
          title: q.title,
          body: q.body,
          author: user.shortName,
          likes: 0,
          isProverb: true,
        })));
      }
    });
    return () => { cancelled = true; };
  }, [user.shortName]);

  // ── LOAD: cloud first → IndexedDB fallback ─────────────────────────
  // Only real user-created posts are loaded. Proverbs with isProverb
  // flag from old data are stripped out during load.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Try cloud first
        const cloudPosts = await cloudLoadPosts(user.id);
        if (!cancelled && cloudPosts && cloudPosts.length > 0) {
          const sanitised = sanitisePosts(cloudPosts);
          setPosts(sanitised.filter(p => !p.isProverb));
          setLoaded(true);
          return;
        }
      } catch (err) {
        console.warn('Cloud load failed, trying IndexedDB:', err.message);
      }

      try {
        // Fall back to IndexedDB
        const saved = await loadPosts(user.id);
        if (!cancelled && saved && saved.length > 0) {
          const sanitised = sanitisePosts(saved);
          setPosts(sanitised.filter(p => !p.isProverb));
        }
      } catch (err) {
        console.error('IndexedDB load also failed:', err);
      }

      if (!cancelled) setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, [user.id, user.shortName]);

  // ── PERSIST: dual-write to IndexedDB + cloud on every change ───────
  useEffect(() => {
    if (loaded) {
      // Write to both in parallel — neither blocks the other
      savePosts(user.id, posts).catch(err => {
        console.error('Failed to save posts to IndexedDB:', err);
      });
      cloudSavePosts(user.id, posts).catch(err => {
        console.warn('Failed to save posts to cloud:', err.message);
      });
    }
  }, [loaded, user.id, posts]);

  // addPost takes `title` and optional `body` — author is auto-tagged from UserContext.
  const addPost = useCallback((title, body = '') => {
    setPosts(prev => [...prev, {
      id: Date.now(),
      title,
      body,
      author: user.shortName,
      likes: 0,
      likedBy: [],   // array of logged-in usernames who liked this post
    }]);
  }, [user.shortName]);

  // likePost records which logged-in user liked the post.
  // Each user can only like a post once (duplicate prevented).
  // Cannot like your own post (defense in depth — UI also prevents it).
  // Pass the logged-in username from the UI layer.
  const likePost = useCallback((postId, username) => {
    if (!username) return; // must be logged in
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        if (isSamePerson(username, post.author)) return post; // can't like own post
        const likedBy = post.likedBy || [];
        if (likedBy.includes(username)) return post; // already liked
        const newLikedBy = [...likedBy, username];
        return { ...post, likedBy: newLikedBy, likes: newLikedBy.length };
      })
    );
  }, []);

  const deletePost = useCallback((postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  const value = useMemo(
    () => ({ posts, proverbs, loaded, addPost, likePost, deletePost }),
    [posts, proverbs, loaded, addPost, likePost, deletePost]
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
