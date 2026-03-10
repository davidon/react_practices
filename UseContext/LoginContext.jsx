import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// LOGIN CONTEXT
// ═══════════════════════════════════════════════════════════════════════
//
// Manages the currently logged-in user.
//
// AUTHENTICATION:
//   This is a DEMO login — any username is accepted, password is not
//   checked. The purpose is to practise Context + storage, not
//   to implement real authentication.
//
// PERSISTENCE — localStorage:
//   localStorage is used so that the login state is shared across ALL
//   tabs and survives page navigations between separate HTML files
//   (summary page → detail page are different .html entry points).
//
//   sessionStorage would NOT work here because:
//     1. It is per-tab — opening a link in a new tab loses the session
//     2. In some browsers, navigating between separate HTML files
//        (not SPA routing) can lose sessionStorage
//
//   The trade-off: localStorage persists after closing the browser.
//   For a demo app this is acceptable. In production you'd use
//   HTTP-only cookies or tokens with server-side expiry.
//
//   CROSS-TAB SYNC:
//   When the user logs in/out in one tab, the 'storage' event fires
//   in all OTHER tabs on the same origin. We listen for this to keep
//   the UI in sync across tabs.
//
// PROVIDER PLACEMENT:
//   LoginProvider is placed OUTSIDE the user-specific provider chain
//   (AppProvider → ThemeProvider → UserProvider → PostProvider) because
//   the logged-in user is independent of the "viewed" user (the one
//   whose posts you are looking at). You might be logged in as "Alice"
//   while viewing Jamie's posts.
//
// ═══════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'loggedInUser';

const LoginContext = createContext(undefined);

export function LoginProvider({ children }) {
  // Initialise from localStorage — shared across tabs and page navigations
  const [loggedInUser, setLoggedInUser] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  // ── CROSS-TAB SYNC ────────────────────────────────────────────────
  // When another tab changes localStorage, the 'storage' event fires
  // in THIS tab. Update our React state to stay in sync.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setLoggedInUser(e.newValue || null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback((username) => {
    const trimmed = username.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setLoggedInUser(trimmed);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
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

