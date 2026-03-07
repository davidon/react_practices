import { createContext, useContext, useState, useMemo, useCallback } from 'react';

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
// This is how per-user / per-panel / per-widget scoped state works in
// production apps (e.g., multi-tab editors, dashboard panels).
//
// BEST PRACTICE — SEPARATE FILE:
//   ThemeContext has its own state (theme), its own actions (cycleTheme,
//   setSpecificTheme), and its own style map (themeStyles). Keeping it
//   in a dedicated file means:
//     • The file reads like a self-contained "theme module"
//     • Components that only need theming don't import user or app logic
//     • You can swap the theme implementation without touching other contexts
// ═══════════════════════════════════════════════════════════════════════
const ThemeContext = createContext(undefined);

const THEMES = ['dark', 'light', 'grey'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

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

