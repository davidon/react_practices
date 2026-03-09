import { createContext, useContext, useEffect, useMemo } from 'react';
import { useTheme } from './ThemeContext.jsx';

// ═══════════════════════════════════════════════════════════════════════
// PER-USER DATA CONTEXT
// ═══════════════════════════════════════════════════════════════════════
//
// INTER-PROVIDER DEPENDENCY:
//   UserProvider calls useTheme() to read the current theme and persist
//   the user's theme preference to localStorage. This means ThemeProvider
//   MUST be an ancestor of UserProvider in the component tree — otherwise
//   useTheme() would throw.
//
//   Full dependency chain:
//     AppProvider (outermost)  ← ThemeProvider calls useApp()
//       → ThemeProvider        ← UserProvider calls useTheme()
//         → UserProvider
//
//   Each inner provider depends on the one above it. Swapping any two
//   would break the dependency and throw at render time.
//
// ═══════════════════════════════════════════════════════════════════════
const UserContext = createContext(undefined);

// UserProvider now enriches the user object with theme
// and persists theme preferences to localStorage.
//
// WHY useMemo IS NEEDED HERE:
//   Previously, UserProvider passed the `user` prop directly as the
//   context value — a stable reference, so no useMemo needed.
//   Now it creates a NEW object { ...user, currentTheme } each render,
//   so useMemo is required to avoid unnecessary consumer re-renders.
export function UserProvider({ user, children }) {
  // ── REAL INTER-PROVIDER DEPENDENCY: ThemeContext ───────────────────
  // UserProvider calls useTheme() to read the current user card's theme.
  // This REQUIRES ThemeProvider to be an ancestor in the tree.
  // If you move UserProvider outside ThemeProvider, this line throws:
  //   "useTheme must be used within a ThemeProvider"
  //
  // What happens at this line:
  //   1. useTheme() calls useContext(ThemeContext)
  //   2. React walks UP from UserProvider looking for <ThemeContext.Provider>
  //   3. If ThemeProvider is an ancestor → returns { theme, cycleTheme, … }
  //   4. If ThemeProvider is NOT an ancestor → useContext returns `undefined`
  //      → useTheme()'s guard throws
  // ──────────────────────────────────────────────────────────────────
  const { theme } = useTheme();

  // `theme` (read above) is used for TWO things:
  //
  //   1. PERSIST to localStorage — so the preference survives page refresh.
  //      On next load, ThemeProvider reads it back (see ThemeContext.jsx).
  useEffect(() => {
    localStorage.setItem(`theme_user_${user.id}`, theme);
  }, [user.id, theme]);

  //   2. ENRICH the user context value — attach `currentTheme` to the user
  //      object so any consumer can read user.currentTheme via useUser()
  //      without also needing to call useTheme() separately.
  const value = useMemo(
    () => ({ ...user, currentTheme: theme }),
    [user, theme]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (ctx === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}


