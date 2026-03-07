import { createContext, useContext } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// PER-USER DATA CONTEXT
// ═══════════════════════════════════════════════════════════════════════
// Wraps a single user object so child components (UserInfo, UserPosts,
// PostItem) can call useUser() instead of receiving user as a prop.
//
// BEST PRACTICE — SEPARATE FILE PER CONTEXT:
//   Previously this file held AppContext + ThemeContext + UserContext +
//   USERS data — 195 lines doing four unrelated things. Now each context
//   is in its own file:
//     • AppContext.jsx   → company-wide state & hooks
//     • ThemeContext.jsx  → per-user theme state, styles & hooks
//     • UserContext.jsx   → per-user data provider & hook (this file)
//     • users.js          → static data (no React dependency)
//
//   Benefits:
//     1. Single Responsibility — each file does exactly one thing
//     2. Smaller diffs — changing theme logic won't appear in AppContext's
//        git history
//     3. Easier testing — mock one context without touching others
//     4. Clear imports — `import { useTheme } from './ThemeContext.jsx'`
//        tells you exactly where the hook lives
//     5. Scalability — adding a 4th context means adding a file, not
//        growing an already-large file
//
// KEY: The value is the user object directly (not wrapped in {user}).
//   This keeps the consumer API clean:  const user = useUser();
// ═══════════════════════════════════════════════════════════════════════
const UserContext = createContext(undefined);

export function UserProvider({ user, children }) {
  return (
    <UserContext.Provider value={user}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (ctx === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════
// RE-EXPORTS  (backward compatibility)
// ═══════════════════════════════════════════════════════════════════════
// Existing consumer files import everything from './UserContext.jsx'.
// These re-exports let those imports keep working while each context
// now lives in its own file. New code should import directly from the
// specific context file (e.g., import { useTheme } from './ThemeContext.jsx').
// ═══════════════════════════════════════════════════════════════════════
export { AppProvider, useApp } from './AppContext.jsx';
export { ThemeProvider, useTheme, themeStyles } from './ThemeContext.jsx';
export { USERS } from './users.js';
