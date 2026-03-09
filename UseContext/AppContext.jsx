import { createContext, useContext, useState, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// APP-LEVEL CONTEXT (outermost)
// ═══════════════════════════════════════════════════════════════════════
// PURPOSE: App-level data that ANY deeply-nested component can
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

// ─── Q: IF A COMPONENT ONLY RENDERS {children} WITH NO <Provider value={...}>, ──
// ──    SHOULD IT BE A NORMAL COMPONENT INSTEAD?                               ──
//
//   YES — if it does NOT render <SomeContext.Provider value={...}>,
//   it provides no context. It's just a layout/wrapper component:
//
//     // ❌ NOT a real provider — no <SomeContext.Provider> inside
//     function UserProvider({ children }) {
//       return <div className="wrapper">{children}</div>;
//       // Descendants CANNOT call useUser() — no context is provided.
//       // Rename to <UserWrapper> — drop the "Provider" suffix.
//     }
//
//   Quick test: does the component render <XxxContext.Provider value={...}>?
//     YES → real Provider (even if it has no internal state)
//     NO  → normal component — rename it, drop the "Provider" suffix
//
// ─── Q: MUST useMemo BE USED FOR CONTEXT VALUES? ────────────────────
//
//   It depends on whether the value is a NEW object reference each render.
//   React uses Object.is() to decide if consumers should re-render:
//
//   1. PRIMITIVE value (string, number, boolean):
//      → NO useMemo needed. Object.is('dark', 'dark') is true.
//        e.g., <MyContext.Provider value={count}>
//
//   2. STABLE REFERENCE from props or module constant:
//      → NO useMemo needed. Same reference every render.
//        e.g., <UserContext.Provider value={user}> where `user` is a
//        prop that doesn't change between renders.
//
//   3. OBJECT/ARRAY CREATED INSIDE the provider (this file ↓):
//      → YES, useMemo it. Without it, { a, b, c } creates a new object
//        every render → Object.is(old, new) is false → ALL consumers
//        re-render even if a, b, c didn't change.
//
//   4. FUNCTIONS (setState, handlers) included in the value:
//      → YES, wrap each function in useCallback FIRST, then include
//        them in useMemo's dependency array. setState itself (e.g.,
//        setAnnouncements) is already stable (React guarantees this),
//        but functions that CALL setState (e.g., addAnnouncement) are
//        recreated every render unless wrapped in useCallback.
//
//   This file demonstrates case 3 + 4: the value object contains
//   both state (announcements) and functions (addAnnouncement,
//   removeAnnouncement), so it uses useCallback + useMemo.
// ──────────────────────────────────────────────────────────────────────

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
    // App-level default theme — used by ThemeProvider to initialise each
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

