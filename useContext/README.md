# useContext — Multi-User Dashboard

A comprehensive React `useContext` demo featuring **multiple nested contexts**, **per-user independent theming**, and **cross-boundary data access** from the innermost component to the outermost provider.

---

## Table of Contents

- [Overview](#overview)
- [Component Tree & Context Architecture](#component-tree--context-architecture)
- [Files](#files)
- [Contexts](#contexts)
  - [AppContext (outermost)](#1-appcontext-outermost)
  - [ThemeContext (per-user)](#2-themecontext-per-user)
  - [UserContext (per-user)](#3-usercontext-per-user)
- [Features](#features)
  - [Multi-User Display](#multi-user-display)
  - [Independent Per-User Theming](#independent-per-user-theming)
  - [User Posts with Author Short Name](#user-posts-with-author-short-name)
  - [Cross-Context Data Access (Inner → Outer)](#cross-context-data-access-inner--outer)
  - [Live Company Announcements](#live-company-announcements)
- [Key Technical Concepts](#key-technical-concepts)
  - [createContext + Custom Hook + Error Boundary Pattern](#1-createcontext--custom-hook--error-boundary-pattern)
  - [Multiple Instances of the Same Context](#2-multiple-instances-of-the-same-context)
  - [useMemo / useCallback for Context Value Stability](#3-usememo--usecallback-for-context-value-stability)
  - [Innermost Component Consuming Outermost Context](#4-innermost-component-consuming-outermost-context)
  - [Provider Composition (Nesting Order Matters)](#5-provider-composition-nesting-order-matters)
- [How to Run](#how-to-run)

---

## Overview

This project demonstrates how React's `useContext` hook solves **prop-drilling** across deeply nested component trees. Instead of passing data through every intermediate component as props, any component in the tree can directly access any ancestor context by calling the corresponding custom hook.

### What this demo covers

| Concept | Where demonstrated |
|---|---|
| `createContext` + Provider pattern | `UserContext.jsx` — three separate contexts |
| Custom hooks with error guard | `useApp()`, `useTheme()`, `useUser()` |
| Multiple context providers (nested) | `App.jsx` — `AppProvider > ThemeProvider > UserProvider` |
| Same context type, multiple instances | Each user card gets its **own** `ThemeProvider` |
| `useMemo` / `useCallback` for perf | `UserContext.jsx` — stabilised context values |
| Innermost → outermost data access | `PostItem` calls `useApp()` to read company data |
| Live state shared across tree | Announcements added at top level appear in every post |

---

## Component Tree & Context Architecture

```
<AppProvider>                          ← AppContext (company-wide)
│
├── <ThemeProvider>                    ← ThemeContext instance #1 (Alex's theme)
│   └── <UserProvider user={alex}>    ← UserContext (Alex's data)
│       └── <UserCard>
│           ├── <UserInfo />          uses useUser() + useApp()
│           ├── <ThemeButton />       uses useTheme()
│           └── <UserPosts>           uses useUser()
│               ├── <PostItem />      uses useUser() + useTheme() + useApp()  ★
│               ├── <PostItem />
│               └── <PostItem />
│
├── <ThemeProvider>                    ← ThemeContext instance #2 (Sam's theme)
│   └── <UserProvider user={sam}>
│       └── <UserCard>
│           ├── ...same structure...
│
├── <ThemeProvider>                    ← ThemeContext instance #3 (Jamie's theme)
│   └── <UserProvider user={jamie}>
│       └── <UserCard>
│           ├── ...same structure...
│
└── <AnnouncementManager />           uses useApp()
```

> ★ **PostItem** is the deepest leaf component. It demonstrates consuming **all three contexts** — accessing the outermost `AppContext` from the innermost position without any prop-drilling.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | HTML entry point with `<div id="root">` |
| `main.jsx` | React 18 `createRoot` bootstrap |
| `UserContext.jsx` | All three contexts, providers, custom hooks, user data, theme styles |
| `App.jsx` | Root component — wires providers together; `AnnouncementManager` |
| `UserCard.jsx` | Per-user card container — applies theme styling |
| `UserInfo.jsx` | Displays user details (full name, team, title, company) |
| `ThemeButton.jsx` | Three-button theme switcher (dark / light / grey) |
| `UserPosts.jsx` | Post list + `PostItem` (innermost component consuming all contexts) |

---

## Contexts

### 1. AppContext (outermost)

**Provider:** `<AppProvider>`  
**Hook:** `useApp()`

| Field | Type | Description |
|---|---|---|
| `companyName` | `string` | Organisation name displayed in user info & posts |
| `fiscalQuarter` | `string` | Current fiscal quarter shown on every post |
| `announcements` | `string[]` | Live list of company-wide announcements |
| `addAnnouncement` | `(msg: string) => void` | Append a new announcement |
| `removeAnnouncement` | `(index: number) => void` | Remove an announcement by index |

**Business purpose:** Organisation-level data that every component needs regardless of which user context it sits in. The `AnnouncementManager` at the top level and `PostItem` at the bottom both consume this same context — proving that context skips intermediate layers.

### 2. ThemeContext (per-user)

**Provider:** `<ThemeProvider>`  
**Hook:** `useTheme()`

| Field | Type | Description |
|---|---|---|
| `theme` | `'dark' \| 'light' \| 'grey'` | Current theme for this user's card |
| `cycleTheme` | `() => void` | Rotate to next theme |
| `setSpecificTheme` | `(t: string) => void` | Jump to a specific theme |

**Key design:** Each user card wraps its children in a **separate** `<ThemeProvider>` instance. Because React context resolution walks **up** the tree and stops at the nearest provider, each card's `useTheme()` resolves to its own provider — making themes fully independent.

### 3. UserContext (per-user)

**Provider:** `<UserProvider user={...}>`  
**Hook:** `useUser()`

Returns the user object directly:

| Field | Type | Description |
|---|---|---|
| `id` | `number` | Unique identifier |
| `shortName` | `string` | Display name used on posts |
| `fullName` | `string` | Full name shown in user info card |
| `team` | `string` | Department / team name |
| `title` | `string` | Job title |
| `posts` | `Array<{id, title, body}>` | User's blog posts |

---

## Features

### Multi-User Display

Three users are rendered side-by-side, each as an independent `UserCard`. User data is defined in the `USERS` array in `UserContext.jsx` and passed via `<UserProvider user={user}>`.

**Users:**

| Short Name | Full Name | Team | Title |
|---|---|---|---|
| Alex | Alex Johnson | Frontend | Senior Engineer |
| Sam | Samantha Lee | Backend | Staff Engineer |
| Jamie | Jamie Rivera | Design | UX Lead |

### Independent Per-User Theming

Each user card has **three theme buttons**: Dark, Light, Grey. Clicking a button changes **only that card's** background, text color, border, and post styling — other cards are unaffected.

This works because each card is wrapped in its own `<ThemeProvider>` instance. The `useTheme()` hook inside the card resolves to the **nearest** `ThemeProvider` ancestor, not a global one.

**Theme styles:**

| Theme | Background | Text | Border |
|---|---|---|---|
| Dark | `#1e1e1e` | `#e0e0e0` | `#444` |
| Light | `#ffffff` | `#1a1a1a` | `#ccc` |
| Grey | `#b0b0b0` | `#1a1a1a` | `#888` |

### User Posts with Author Short Name

Each user has 3 posts listed below their info. Every post displays:
- Post title and body
- Author's **short name** (e.g., "Alex") via `useUser()`
- Company name and fiscal quarter via `useApp()`

### Cross-Context Data Access (Inner → Outer)

**`PostItem`** is the most deeply nested component in the tree:

```
AppProvider → ThemeProvider → UserProvider → UserCard → UserPosts → PostItem
```

Yet it directly accesses the outermost `AppContext` by simply calling `useApp()`. No intermediate component needs to know about or forward company data. This is the core value proposition of `useContext`.

### Live Company Announcements

The `AnnouncementManager` at the bottom of the page lets you:
- **Add** new announcements (text input + Enter or button)
- **Remove** existing announcements (✕ button)

Every `PostItem` across all three user cards shows a **📌 pinned** banner with the first announcement. When you add or remove announcements, all posts update in real-time — demonstrating that context changes propagate to all consumers automatically.

---

## Key Technical Concepts

### 1. createContext + Custom Hook + Error Boundary Pattern

```jsx
const MyContext = createContext(undefined);     // undefined as sentinel

export function useMyContext() {
  const ctx = useContext(MyContext);
  if (ctx === undefined) {                       // guard: used outside provider?
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return ctx;                                    // type-safe, guaranteed non-null
}
```

**Why `undefined` as default?** It lets the custom hook distinguish between "no provider above me" (bug) vs "provider gave me a falsy value" (valid). This pattern is used for all three contexts: `useApp()`, `useTheme()`, `useUser()`.

### 2. Multiple Instances of the Same Context

```jsx
{USERS.map((user) => (
  <ThemeProvider key={user.id}>        {/* NEW ThemeProvider per user */}
    <UserProvider user={user}>
      <UserCard />
    </UserProvider>
  </ThemeProvider>
))}
```

React resolves `useContext(ThemeContext)` by walking **up** the component tree and returning the value from the **nearest** matching Provider. By wrapping each user card in its own `<ThemeProvider>`, each card gets independent theme state — even though they all use the same `ThemeContext` object.

### 3. useMemo / useCallback for Context Value Stability

```jsx
const addAnnouncement = useCallback(
  (msg) => setAnnouncements((prev) => [...prev, msg]),
  []                                              // stable reference
);

const value = useMemo(() => ({
  companyName: 'Acme Corp',
  announcements,
  addAnnouncement,
}), [announcements, addAnnouncement]);            // only re-creates when deps change
```

**Why this matters:** Without `useMemo`, the `value` object is a new reference on every render, causing **all consumers** to re-render even if nothing changed. `useCallback` stabilises function references so they don't invalidate the `useMemo` dependency array.

### 4. Innermost Component Consuming Outermost Context

`PostItem` sits 6 levels deep but calls `useApp()` to read `companyName`, `fiscalQuarter`, and `announcements` directly from the outermost `AppProvider`. No intermediate component (`UserCard`, `UserPosts`, `UserInfo`) needs to receive or forward this data.

**Practical business scenarios this pattern solves:**
- Showing **org-wide branding** (company name, logo URL) in leaf components
- Displaying **environment badges** ("STAGING" / "PROD") in every widget
- **Feature flags** checked deep inside form fields or table cells
- **Locale / i18n** strings accessed by the smallest UI atoms
- **Current user session / permissions** checked before rendering action buttons

### 5. Provider Composition (Nesting Order Matters)

```
<AppProvider>              ← available to everything
  <ThemeProvider>          ← available to UserProvider's children & below
    <UserProvider>         ← available to UserCard & below
      <UserCard />
```

Providers must be ordered from most-global to most-specific. A component can only `useContext()` a context whose Provider is an **ancestor** in the tree. If `ThemeProvider` were inside `UserCard`, the `UserCard` itself couldn't call `useTheme()` — only its children could.

---

## How to Run

```bash
# From the project root
npm install
npm run dev
```

Then open the browser and navigate to the useContext page (via the Vite multi-page setup or directly at `/useContext/index.html`).

