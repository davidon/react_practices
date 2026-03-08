import { createContext, useContext, useState, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// APP-LEVEL CONTEXT (outermost)
// ═══════════════════════════════════════════════════════════════════════
// PURPOSE: Company / org-wide data that ANY deeply-nested component can
//          reach via useApp(), no matter how many providers sit between.
//
// BEST PRACTICE — SEPARATE FILE PER CONTEXT:
//   Each context lives in its own file so that:
//     1. Consumers only import the hook they need → clear dependency graph
//     2. Each file is small, testable, and has a single responsibility
//     3. Changes to AppContext don't risk breaking ThemeContext or UserContext
//     4. Tree-shaking: bundlers can drop unused contexts in large apps
//     5. Code review: diffs are scoped to the context that actually changed
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
    // Company-wide default theme — used by ThemeProvider to initialise each
    // card's theme. This creates a REAL dependency: ThemeProvider calls
    // useApp() internally, so AppProvider MUST be an ancestor of ThemeProvider.
    defaultTheme: 'dark',
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
  // useContext(AppContext) resolution:
  //   1. React walks UP the component tree looking for <AppContext.Provider>
  //   2. If found → returns the Provider's `value` prop (the memoised object)
  //   3. If NOT found → returns the DEFAULT passed to createContext() on line 21,
  //      which is `undefined`
  //
  // That's why the guard below works: `undefined` means "no AppProvider above me".
  const ctx = useContext(AppContext);
  if (ctx === undefined) {
    // This fires when ThemeProvider (or any consumer) is rendered
    // OUTSIDE <AppProvider>. The error message tells the developer
    // exactly which provider is missing and where to add it.
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

