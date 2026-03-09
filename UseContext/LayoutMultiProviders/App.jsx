import { Routes, Route, useParams } from 'react-router-dom';
import { AppProvider } from '../AppContext.jsx';
import { ThemeProvider } from '../ThemeContext.jsx';
import { UserProvider } from '../UserContext.jsx';
import { USERS } from '../users.js';
import { PostProvider } from './PostContext.jsx';
import UserPosts from './UserPosts.jsx';
import PostDetail from './PostDetail.jsx';

/**
 * LayoutMultiProviders App — demonstrates combining MULTIPLE context
 * providers (AppProvider, ThemeProvider, UserProvider, PostProvider)
 * so that any descendant can consume any of them via hooks.
 *
 * ROUTING:
 *   /                           → list view for default user (USERS[0])
 *   /user/:userId               → list view for a specific user
 *   /user/:userId/post/:postId  → detail view (PostDetail — single post)
 *
 *   The userId from the URL determines which user's data is loaded into
 *   the provider chain. This way the summary page can link to any user's
 *   posts and the correct data is loaded from IndexedDB.
 *
 *   HashRouter is used (set up in main.jsx) so routing works with
 *   static file serving (no server-side rewrite needed).
 *
 * KEY: Provider nesting order matters — outermost providers are
 * accessible from everywhere; inner providers scope data to subtrees.
 */
export default function App() {
  return (
    /* AppProvider wraps Routes — it doesn't depend on URL params.
     * Routes must be OUTSIDE the user-specific providers because
     * useParams() only works inside <Routes>, and the providers
     * need the userId to load the correct data. */
    <AppProvider>
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/user/:userId" element={<UserPage />} />
        <Route path="/user/:userId/post/:postId" element={<UserPage />} />
      </Routes>
    </AppProvider>
  );
}

/**
 * UserPage — reads :userId from URL and wraps the correct user in providers.
 *
 * WHY THIS COMPONENT EXISTS:
 *   useParams() can only be called inside <Routes>. But ThemeProvider,
 *   UserProvider, and PostProvider all need the user object (which depends
 *   on userId from the URL). So this component sits inside Routes, reads
 *   the param, finds the user, and renders the provider chain.
 */
function UserPage() {
  const { userId, postId } = useParams();

  // Find user by URL param, fall back to USERS[0] for the "/" route
  const user = userId
    ? USERS.find(u => String(u.id) === userId) || USERS[0]
    : USERS[0];

  /* ── PROVIDER NESTING & INTER-PROVIDER DEPENDENCIES ─────────────────
   *
   * Dependency chain (each inner depends on the one above):
   *   AppProvider → ThemeProvider (useApp) → UserProvider (useTheme)
   *                                          → PostProvider (useUser)
   * ─────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ↑ ThemeProvider calls useApp() → reads defaultTheme
       *   WHY THIS ORDER: ThemeProvider needs AppProvider's defaultTheme
       *   to initialise the user card's theme. If ThemeProvider were
       *   outside AppProvider, useApp() would throw. */}
      <ThemeProvider userId={user.id}>

        {/* ↑ UserProvider calls useTheme() → reads theme
         *   WHY THIS ORDER: UserProvider needs ThemeProvider's theme
         *   to persist it to localStorage and enrich the user object
         *   with currentTheme. If UserProvider were outside ThemeProvider,
         *   useTheme() would throw. */}
        <UserProvider user={user}>
          <div className="app-container">

            {/* ↑ PostProvider calls useUser() → reads shortName, id
             *   WHY THIS ORDER: PostProvider needs UserProvider's shortName
             *   to auto-tag new posts with the author, and id for the
             *   IndexedDB storage key. If PostProvider were outside
             *   UserProvider, useUser() would throw. */}
            <PostProvider>

              {/* Render list or detail based on whether postId is in URL */}
              {postId ? <PostDetail /> : <UserPosts />}

            </PostProvider>
          </div>
        </UserProvider>
      </ThemeProvider>
    </>
  );
}