import { createContext, useContext, useState, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// LOGIN CONTEXT
// ═══════════════════════════════════════════════════════════════════════
//
// Manages the currently logged-in user.
//
// AUTHENTICATION:
//   This is a DEMO login — any username is accepted, password is not
//   checked. The purpose is to practise Context + sessionStorage, not
//   to implement real authentication.
//
// PERSISTENCE — sessionStorage:
//   Now that the app is a SINGLE PAGE APPLICATION (one index.html with
//   HashRouter), sessionStorage is the correct choice:
//
//     ┌────────────────────┬──────────────────┬──────────────────┐
//     │                    │  sessionStorage   │  localStorage    │
//     ├────────────────────┼──────────────────┼──────────────────┤
//     │ Lifetime           │ Current tab only  │ Forever (manual) │
//     │ Shared across tabs │ No — per tab      │ Yes — all tabs   │
//     │ Cleared on close   │ Yes (tab close)   │ No               │
//     │ SPA route changes  │ Survives ✅       │ Survives ✅      │
//     │ Cross-page nav     │ ❌ lost on new tab│ ✅ shared        │
//     └────────────────────┴──────────────────┴──────────────────┘
//
//   Previously localStorage was used because the summary page and detail
//   page were separate HTML files (separate page loads). Now that they
//   are SPA routes within a single index.html, sessionStorage works:
//     - SPA route changes do NOT lose sessionStorage (same page)
//     - Tab close = automatic logout (desired behaviour)
//     - Each tab has its own independent login (isolation)
//
// PROVIDER PLACEMENT:
//   LoginProvider is placed OUTSIDE the user-specific provider chain
//   (AppProvider → ThemeProvider → UserProvider → PostProvider) because
//   the logged-in user is independent of the "viewed" user (the one
//   whose posts you are looking at). You might be logged in as "Alice"
//   while viewing Jamie's posts.
//
// ═══════════════════════════════════════════════════════════════════════

const SESSION_KEY = 'loggedInUser';

const LoginContext = createContext(undefined);

export function LoginProvider({ children }) {
  // Initialise from sessionStorage — survives SPA route changes,
  // clears when the tab closes.
  const [loggedInUser, setLoggedInUser] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) || null;
  });

  const login = useCallback((username) => {
    const trimmed = username.trim();
    if (trimmed) {
      sessionStorage.setItem(SESSION_KEY, trimmed);
      setLoggedInUser(trimmed);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setLoggedInUser(null);
  }, []);

  const value = useMemo(
    () => ({ loggedInUser, login, logout }),
    [loggedInUser, login, logout]
  );

  return (
    <LoginContext.Provider value={value}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLogin() {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
}

