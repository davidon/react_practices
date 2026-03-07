import { createContext, useContext, useState, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// 1. APP-LEVEL CONTEXT (outermost)
// ═══════════════════════════════════════════════════════════════════════
// PURPOSE: Company / org-wide data that ANY deeply-nested component can
//          reach via useApp(), no matter how many providers sit between.
//
// KEY PATTERN: createContext(undefined) — using `undefined` as the default
//   lets the custom hook distinguish "used outside a Provider" (a bug)
//   from "Provider gave a valid falsy value" (intentional).
// ═══════════════════════════════════════════════════════════════════════
const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [announcements, setAnnouncements] = useState([
    'Q1 All-Hands meeting on March 15',
    'New PTO policy effective April 1',
  ]);

  // KEY: useCallback stabilises function identity across renders.
  //   Without it, a new function reference is created every render,
  //   which would bust the useMemo dependency array below and force
  //   ALL context consumers to re-render unnecessarily.
  const addAnnouncement = useCallback(
    (msg) => setAnnouncements((prev) => [...prev, msg]),
    []
  );

  const removeAnnouncement = useCallback(
    (index) => setAnnouncements((prev) => prev.filter((_, i) => i !== index)),
    []
  );

  // KEY: useMemo prevents creating a new object reference every render.
  //   Context uses Object.is() to compare old vs new value — if the
  //   reference changes, EVERY consumer re-renders. useMemo ensures
  //   the object only changes when its dependencies actually change.
  const value = useMemo(() => ({
    companyName: 'Acme Corp',
    fiscalQuarter: 'Q1 2026',
    announcements,
    addAnnouncement,
    removeAnnouncement,
  }), [announcements, addAnnouncement, removeAnnouncement]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// KEY PATTERN: Custom hook with error guard.
//   - Encapsulates useContext(AppContext) so consumers never import the
//     raw context object (single source of truth).
//   - The undefined check gives a clear error message during development
//     if a component is rendered outside the required Provider.
export function useApp() {
  const ctx = useContext(AppContext);
  if (ctx === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════
// 2. USERS DATA
// ═══════════════════════════════════════════════════════════════════════
// Static user dataset. In production this would come from an API.
// Each user has a shortName (for post bylines) and fullName (for profile).
// ═══════════════════════════════════════════════════════════════════════
export const USERS = [
  {
    id: 1,
    shortName: 'Alex',
    fullName: 'Alex Johnson',
    team: 'Frontend',
    title: 'Senior Engineer',
    posts: [
      { id: 101, title: 'My first React post', body: 'React is great for building UIs.' },
      { id: 102, title: 'Context is awesome', body: 'useContext eliminates prop-drilling.' },
      { id: 103, title: 'Hooks deep dive', body: 'Custom hooks keep code DRY.' },
    ],
  },
  {
    id: 2,
    shortName: 'Sam',
    fullName: 'Samantha Lee',
    team: 'Backend',
    title: 'Staff Engineer',
    posts: [
      { id: 201, title: 'Node.js tips', body: 'Streams save memory on large payloads.' },
      { id: 202, title: 'Database indexing', body: 'Always index your foreign keys.' },
      { id: 203, title: 'REST vs GraphQL', body: 'Choose based on client needs.' },
    ],
  },
  {
    id: 3,
    shortName: 'Jamie',
    fullName: 'Jamie Rivera',
    team: 'Design',
    title: 'UX Lead',
    posts: [
      { id: 301, title: 'Design tokens 101', body: 'Tokens bridge design and code.' },
      { id: 302, title: 'Accessibility matters', body: 'A11y is not optional.' },
      { id: 303, title: 'Color contrast tips', body: 'WCAG AA requires 4.5:1 ratio.' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// 3. PER-USER THEME CONTEXT
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
// 4. PER-USER DATA CONTEXT
// ═══════════════════════════════════════════════════════════════════════
// Wraps a single user object so child components (UserInfo, UserPosts,
// PostItem) can call useUser() instead of receiving user as a prop.
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
// 5. THEME STYLE HELPERS
// ═══════════════════════════════════════════════════════════════════════
// Plain object map from theme name → inline CSS.
// Used by UserCard (card container) and PostItem (individual posts)
// to apply consistent theming via the spread operator: { ...themeStyles[theme] }
// ═══════════════════════════════════════════════════════════════════════
export const themeStyles = {
  dark: { background: '#1e1e1e', color: '#e0e0e0', border: '1px solid #444' },
  light: { background: '#ffffff', color: '#1a1a1a', border: '1px solid #ccc' },
  grey: { background: '#b0b0b0', color: '#1a1a1a', border: '1px solid #888' },
};
