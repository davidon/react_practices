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
       *   Uses outer providers: YES — calls useApp() to read `defaultTheme`
       *     from company config (AppContext). This is a REAL dependency:
       *     AppProvider MUST be an ancestor, otherwise useApp() throws.
       *     Moving <ThemeProvider> outside <AppProvider> would crash here.
       *   Provides: theme, cycleTheme, setSpecificTheme
       *   Consumers that use it: UserPosts (useTheme → theme, themeStyles),
       *                          ThemeButton (useTheme → setSpecificTheme) */}
      <ThemeProvider userId={user.id}>

        {/* LAYER 3 — UserProvider
         *   Uses outer providers: YES — calls useTheme() to read the current
         *     theme and persist per-user theme preference to localStorage.
         *     This is a REAL dependency: ThemeProvider MUST be an ancestor,
         *     otherwise useTheme() throws.
         *     It also enriches the user object with `currentTheme` so
         *     consumers can read user.currentTheme without calling useTheme().
         *   Provides: user object (fullName, shortName, team, title, posts, currentTheme)
         *   Consumers that use it: UserPosts (useUser → fullName, shortName, team, title) */}
        <UserProvider user={user}>
          <div className="app-container">

            {/* LAYER 4 — PostProvider (innermost)
             *   Uses outer providers: YES — calls useUser() to read the current
             *     user's shortName and auto-tag every new post with the author.
             *     This is a REAL dependency: UserProvider MUST be an ancestor,
             *     otherwise useUser() throws.
             *     Callers of addPost() only provide a title — the author is
             *     filled in automatically from UserContext.
             *   Provides: posts, addPost, likePost
             *   Consumers that use it: UserPosts (usePosts → posts, likePost) */}
            <PostProvider>

              {/* UserPosts is the CONSUMER — it calls ALL FOUR hooks:
               *   useApp()   → from AppProvider   (layer 1) — companyName
               *   useTheme() → from ThemeProvider  (layer 2) — theme, themeStyles
               *   useUser()  → from UserProvider   (layer 3) — fullName, shortName, team, title
               *   usePosts() → from PostProvider   (layer 4) — posts, likePost
               *
               * Because all four providers are ancestors of UserPosts,
               * every hook resolves successfully. Removing or reordering
               * any provider would cause the corresponding hook to throw. */}
              <UserPosts />

            </PostProvider>
          </div>
        </UserProvider>
      </ThemeProvider>
    </AppProvider>
  );
}