import { createContext, useContext, useState, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// LOGIN CONTEXT
// ═══════════════════════════════════════════════════════════════════════
//
// Manages the currently logged-in user for the LayoutMultiProviders page.
//
// AUTHENTICATION:
//   This is a DEMO login — any username is accepted, password is not
//   checked. The purpose is to practise Context + sessionStorage, not
//   to implement real authentication.
//
// PERSISTENCE — sessionStorage (not localStorage):
//   sessionStorage is cleared when the browser tab is closed, which is
//   the correct lifetime for a login session. localStorage would keep
//   the user "logged in" forever across tabs and browser restarts.
//
//   sessionStorage vs localStorage:
//     ┌────────────────────┬──────────────────┬──────────────────┐
//     │                    │  sessionStorage   │  localStorage    │
//     ├────────────────────┼──────────────────┼──────────────────┤
//     │ Lifetime           │ Current tab only  │ Forever (manual) │
//     │ Shared across tabs │ No — per tab      │ Yes — all tabs   │
//     │ Cleared on close   │ Yes (tab close)   │ No               │
//     │ API                │ Same as localStorage                 │
//     │ Storage limit      │ ~5 MB per origin  │ ~5 MB per origin │
//     └────────────────────┴──────────────────┴──────────────────┘
//
//   For login state, sessionStorage is the better fit: closing the tab
//   logs out the user automatically, and each tab can have its own
//   independent login session.
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
  // Initialise from sessionStorage — survives page refresh within same tab
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

