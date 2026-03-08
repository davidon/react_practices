import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useApp } from './AppContext.jsx';

// ═══════════════════════════════════════════════════════════════════════
// PER-USER THEME CONTEXT
// ═══════════════════════════════════════════════════════════════════════
// KEY CONCEPT: Multiple instances of the SAME context.
//
//   React resolves useContext() by walking UP the component tree and
//   returning the value from the NEAREST matching Provider.
//
//   By wrapping each UserCard in its own <ThemeProvider>, each card's
//   useTheme() resolves to a DIFFERENT provider instance — giving each
//   card fully independent theme state, even though they share the same
//   ThemeContext object.
//
// INTER-PROVIDER DEPENDENCY:
//   ThemeProvider calls useApp() to read `defaultTheme` from company
//   config. This means AppProvider MUST be an ancestor of ThemeProvider
//   in the component tree — otherwise useApp() would throw.
//   This is a real example of one provider depending on another.
//
// This is how per-user / per-panel / per-widget scoped state works in
// production apps (e.g., multi-tab editors, dashboard panels).
// ═══════════════════════════════════════════════════════════════════════
const ThemeContext = createContext(undefined);

const THEMES = ['dark', 'light', 'grey'];

export function ThemeProvider({ userId, children }) {
  // ── REAL INTER-PROVIDER DEPENDENCY #1: AppContext ─────────────────
  // ThemeProvider calls useApp() to read the company-wide default theme.
  //
  // What happens at this line:
  //   1. useApp() calls useContext(AppContext)
  //   2. React walks UP from ThemeProvider looking for <AppContext.Provider>
  //   3. If AppProvider is an ancestor → returns { companyName, defaultTheme, … }
  //   4. If AppProvider is NOT an ancestor → useContext returns `undefined`
  //      (the default from createContext(undefined) in AppContext.jsx)
  //      → useApp()'s guard throws: "useApp must be used within an AppProvider"
  //
  // This is why provider ORDER matters: AppProvider must wrap ThemeProvider.
  // ──────────────────────────────────────────────────────────────────
  const { defaultTheme } = useApp();

  // ── localStorage READ (init only) ──────────────────────────────────
  // On mount, check if this user has a saved theme preference.
  // localStorage key format: "theme_user_<userId>" (e.g., "theme_user_1")
  // Falls back to company defaultTheme if nothing is saved.
  //
  // The `userId` prop is passed from App.jsx so each user card gets
  // its own localStorage slot. Without it, all cards would share one key.
  //
  // NOTE: ThemeProvider only READS from localStorage on init.
  //   The WRITE happens in UserProvider (see UserContext.jsx), which
  //   calls useTheme() to observe theme changes and persists them.
  //   This separation demonstrates inter-provider collaboration:
  //     ThemeProvider reads  → initialises state from saved preference
  //     UserProvider  writes → persists whenever user changes theme
  // ──────────────────────────────────────────────────────────────────
  const storageKey = userId != null ? `theme_user_${userId}` : null;

  const [theme, setTheme] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved && THEMES.includes(saved)) {
        return saved;          // restore user's saved preference
      }
    }
    return defaultTheme;       // fall back to company config
  });


  const cycleTheme = useCallback(
    () => setTheme((prev) => THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length]),
    []
  );

  const setSpecificTheme = useCallback((t) => setTheme(t), []);

  const value = useMemo(
    () => ({ theme, cycleTheme, setSpecificTheme }),
    [theme, cycleTheme, setSpecificTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════
// THEME STYLE HELPERS
// ═══════════════════════════════════════════════════════════════════════
// Plain object map from theme name → inline CSS.
// Co-located with ThemeContext because it is the only consumer of theme names.
// Used by UserCard (card container) and PostItem (individual posts)
// to apply consistent theming via the spread operator: { ...themeStyles[theme] }
// ═══════════════════════════════════════════════════════════════════════
export const themeStyles = {
  dark:  { background: '#1e1e1e', color: '#e0e0e0', border: '1px solid #444' },
  light: { background: '#ffffff', color: '#1a1a1a', border: '1px solid #ccc' },
  grey:  { background: '#b0b0b0', color: '#1a1a1a', border: '1px solid #888' },
};

