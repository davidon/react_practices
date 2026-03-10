import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '../UserContext.jsx';
import { loadPosts, savePosts } from './postsDB.js';
import { createSeedPosts, sanitisePosts } from '../proverbs.js';
import { isSamePerson } from '../users.js';

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
//   Only real user-created posts are stored in IndexedDB (database:
//   "PostsDB", store: "posts", keyed by userId).
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

  // ── EPHEMERAL PROVERBS — random on every mount, never persisted ───
  // useMemo with [] deps means this runs once per mount (page refresh).
  // Each refresh picks 2 different random proverbs.
  const proverbs = useMemo(() => createSeedPosts(user.shortName), [user.shortName]);

  // ── LOAD from IndexedDB on mount ──────────────────────────────────
  // Only real user-created posts are loaded. Proverbs with isProverb
  // flag from old data are stripped out during load.
  useEffect(() => {
    let cancelled = false;

    loadPosts(user.id)
      .then(saved => {
        if (cancelled) return;
        if (saved && saved.length > 0) {
          // Sanitise corrupted data, then strip out old proverbs
          const sanitised = sanitisePosts(saved);
          setPosts(sanitised.filter(p => !p.isProverb));
        }
        // If no saved posts → posts stays [] (proverbs shown instead)
        setLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load posts from IndexedDB:', err);
        if (cancelled) return;
        // IndexedDB failed — posts stays empty, proverbs shown
        setLoaded(true);
      });

    return () => { cancelled = true; };
  }, [user.id, user.shortName]);

  // ── PERSIST to IndexedDB on every change (after initial load) ─────
  useEffect(() => {
    if (loaded) {
      savePosts(user.id, posts).catch(err => {
        console.error('Failed to save posts to IndexedDB:', err);
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
    () => ({ posts, proverbs, addPost, likePost, deletePost }),
    [posts, proverbs, addPost, likePost, deletePost]
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
