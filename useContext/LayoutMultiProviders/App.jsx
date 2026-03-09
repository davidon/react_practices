import { AppProvider } from '../AppContext.jsx';
import { ThemeProvider } from '../ThemeContext.jsx';
import { UserProvider } from '../UserContext.jsx';
import { USERS } from '../users.js';
import { PostProvider } from './PostContext.jsx';
import UserPosts from './UserPosts.jsx';

/**
 * LayoutMultiProviders App — demonstrates combining MULTIPLE context
 * providers (AppProvider, ThemeProvider, UserProvider, PostProvider)
 * so that any descendant can consume any of them via hooks.
 *
 * KEY: Provider nesting order matters — outermost providers are
 * accessible from everywhere; inner providers scope data to subtrees.
 */
export default function App() {
  // Pick the first user from the shared USERS dataset.
  const user = USERS[0];

  /* ── PROVIDER NESTING & INTER-PROVIDER DEPENDENCIES ─────────────────
   *
   * Each provider is listed with:
   *   • which outer providers IT calls internally
   *   • which outer providers its CONSUMERS can access
   *
   * Dependency chain (each inner depends on the one above):
   *   AppProvider → ThemeProvider (useApp) → UserProvider (useTheme)
   *                                          → PostProvider (useUser)
   * ─────────────────────────────────────────────────────────────────── */
  return (
    /* LAYER 1 — AppProvider (outermost)
     *   Uses outer providers: NONE — it is the root, depends on nothing.
     *   Provides: companyName, fiscalQuarter, announcements, addAnnouncement, removeAnnouncement
     *   Consumers that use it: UserPosts (useApp → companyName) */
    <AppProvider>

      {/* LAYER 2 — ThemeProvider
       *   Provides: theme, cycleTheme, setSpecificTheme
       *   Consumers: UserPosts (useTheme → theme), ThemeButton (useTheme → setSpecificTheme) */}
      {/* ↑ ThemeProvider calls useApp() → reads defaultTheme
       *   WHY THIS ORDER: ThemeProvider needs AppProvider's defaultTheme
       *   to initialise the user card's theme. If ThemeProvider were
       *   outside AppProvider, useApp() would throw. */}
      <ThemeProvider userId={user.id}>

        {/* LAYER 3 — UserProvider
         *   Provides: user object (fullName, shortName, team, title, posts, currentTheme)
         *   Consumers: UserPosts (useUser → fullName, shortName, team, title) */}
        {/* ↑ UserProvider calls useTheme() → reads theme
         *   WHY THIS ORDER: UserProvider needs ThemeProvider's theme
         *   to persist it to localStorage and enrich the user object
         *   with currentTheme. If UserProvider were outside ThemeProvider,
         *   useTheme() would throw. */}
        <UserProvider user={user}>
          <div className="app-container">

            {/* LAYER 4 — PostProvider (innermost)
             *   Provides: posts, addPost, likePost
             *   Consumers: UserPosts (usePosts → posts, addPost, likePost) */}
            {/* ↑ PostProvider calls useUser() → reads shortName, id
             *   WHY THIS ORDER: PostProvider needs UserProvider's shortName
             *   to auto-tag new posts with the author, and id for the
             *   IndexedDB storage key. If PostProvider were outside
             *   UserProvider, useUser() would throw. */}
            <PostProvider>

              {/* UserPosts is the CONSUMER — it calls ALL FOUR hooks:
               *   useApp()   → from AppProvider   (layer 1) — companyName
               *   useTheme() → from ThemeProvider  (layer 2) — theme, themeStyles
               *   useUser()  → from UserProvider   (layer 3) — fullName, shortName, team, title
               *   usePosts() → from PostProvider   (layer 4) — posts, likePost
               *
               * Because all four providers are ancestors of UserPosts,
               * every hook resolves successfully. Removing or reordering
               * any provider would cause the corresponding hook to throw.
               *
               * UserPosts is RENDERED here, not "called".
               *   <UserPosts /> is JSX syntax that tells React to render
               *   the component. "Call" implies UserPosts() which bypasses
               *   React's reconciliation. Always say "render" for JSX. */}
              <UserPosts />

            </PostProvider>
          </div>
        </UserProvider>
      </ThemeProvider>
    </AppProvider>
  );
}