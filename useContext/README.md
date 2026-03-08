# useContext — Multi-User Dashboard

A comprehensive React `useContext` demo featuring **multiple nested contexts**, **real inter-provider dependencies**, **per-user independent theming** with localStorage persistence, **IndexedDB post storage**, and **cross-boundary data access** from the innermost component to the outermost provider.

---

## Table of Contents

- [Overview](#overview)
- [Architecture — Separate File Per Context](#architecture--separate-file-per-context)
- [Component Tree & Context Architecture](#component-tree--context-architecture)
- [Inter-Provider Dependency Chain](#inter-provider-dependency-chain)
- [Files](#files)
- [Contexts](#contexts)
  - [AppContext (outermost)](#appcontext-outermost)
  - [ThemeContext (per-user)](#themecontext-per-user)
  - [UserContext (per-user)](#usercontext-per-user)
  - [PostContext (LayoutMultiProviders)](#postcontext-layoutmultiproviders)
- [Features](#features)
  - [Multi-User Display](#multi-user-display)
  - [Independent Per-User Theming](#independent-per-user-theming)
  - [Company-Wide Default Theme](#company-wide-default-theme)
  - [Per-User Theme Persistence (localStorage)](#per-user-theme-persistence-localstorage)
  - [User Context Enrichment](#user-context-enrichment)
  - [Post Auto-Tagging from UserContext](#post-auto-tagging-from-usercontext)
  - [IndexedDB Persistence for Posts](#indexeddb-persistence-for-posts)
  - [Random Proverb Seed Posts](#random-proverb-seed-posts)
  - [Create New Post UI](#create-new-post-ui)
  - [User Posts with Author Short Name](#user-posts-with-author-short-name)
  - [Cross-Context Data Access (Inner → Outer)](#cross-context-data-access-inner--outer)
  - [Live Company Announcements](#live-company-announcements)
- [Key Technical Concepts](#key-technical-concepts)
  - [How to Verify Provider Order Is Correct](#how-to-verify-provider-order-is-correct)
  - [Stateless Providers vs Normal Components](#stateless-providers-vs-normal-components)
  - [createContext + Custom Hook + Error Boundary Pattern](#createcontext--custom-hook--error-boundary-pattern)
  - [Multiple Instances of the Same Context](#multiple-instances-of-the-same-context)
  - [When to useMemo / useCallback for Context Values](#when-to-usememo--usecallback-for-context-values)
  - [Innermost Component Consuming Outermost Context](#innermost-component-consuming-outermost-context)
  - [Provider Composition (Nesting Order Matters)](#provider-composition-nesting-order-matters)
- [LayoutMultiProviders Page](#layoutmultiproviders-page)
- [How to Run](#how-to-run)

---

## Overview

This project demonstrates how React's `useContext` hook solves **prop-drilling** across deeply nested component trees. Instead of passing data through every intermediate component as props, any component in the tree can directly access any ancestor context by calling the corresponding custom hook.

### What this demo covers

| Concept | Where demonstrated |
|---|---|
| `createContext` + Provider pattern | `AppContext.jsx`, `ThemeContext.jsx`, `UserContext.jsx` — one file per context |
| Separate file per context | Each context has its own file with provider + hook + helpers |
| Real inter-provider dependencies | ThemeProvider → useApp(), UserProvider → useTheme(), PostProvider → useUser() |
| Custom hooks with error guard | `useApp()`, `useTheme()`, `useUser()`, `usePosts()` |
| Multiple context providers (nested) | `App.jsx` — `AppProvider > ThemeProvider > UserProvider` |
| Same context type, multiple instances | Each user card gets its **own** `ThemeProvider` |
| `useMemo` / `useCallback` for perf | All providers with internal state — stabilised context values |
| Innermost → outermost data access | `PostItem` calls `useApp()` to read company data |
| Live state shared across tree | Announcements added at top level appear in every post |
| Data separated from context | `users.js` — pure JS, no React dependency |
| localStorage persistence | Per-user theme preferences survive page refresh |
| IndexedDB persistence | Posts stored in Indexed Database, loaded/saved automatically |
| Post auto-tagging | `addPost(title)` auto-fills author from UserContext |
| Create new post UI | Text input + button, persisted to IndexedDB |

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

## Architecture — Separate File Per Context

Previously a single monolithic `UserContext.jsx` (195 lines) held 3 contexts + data. Now each concern is in its own file:

```
AppContext.jsx            ← company-wide context only
ThemeContext.jsx           ← theme context + themeStyles only
UserContext.jsx            ← user context only
users.js                   ← static data, zero React imports
```

| # | Benefit | Explanation |
|---|---|---|
| 1 | **Single Responsibility** | Each file does exactly one thing |
| 2 | **Clear dependency graph** | `import { useTheme } from './ThemeContext.jsx'` tells you exactly where the hook lives |
| 3 | **Smaller diffs** | Changing theme logic won't appear in AppContext's git history |
| 4 | **Independent testability** | Mock one context without pulling in others |
| 5 | **Tree-shaking** | Bundlers can drop unused context files entirely |
| 6 | **Scalability** | Adding a 4th context means adding a file, not growing an already-large file |
| 7 | **Data ≠ context** | `users.js` has zero React imports — usable in tests, CLI scripts, or SSR |

Each consumer imports directly from the file that owns the export (no barrel re-exports).

---

## Inter-Provider Dependency Chain

Every inner provider calls a hook from the provider above it, creating a real dependency chain:

```
AppProvider (outermost)         ← depends on nothing
  ↓ ThemeProvider calls useApp()   → reads defaultTheme from company config
    ↓ UserProvider calls useTheme() → reads current theme, persists to localStorage
      ↓ PostProvider calls useUser() → reads shortName, auto-tags new posts
```

Swapping any two providers crashes at render time with a clear error message (e.g., `"useApp must be used within an AppProvider"`).

| Provider | Calls | Reads | Purpose |
|---|---|---|---|
| `AppProvider` | nothing | — | Root — provides company config |
| `ThemeProvider` | `useApp()` | `defaultTheme` | Initialises theme from company config |
| `UserProvider` | `useTheme()` | `theme` | Persists theme to localStorage, enriches user with `currentTheme` |
| `PostProvider` | `useUser()` | `shortName` | Auto-tags new posts with the author |

---

## Files

| File | Purpose |
|---|---|
| `index.html` | HTML entry point with `<div id="root">` |
| `main.jsx` | React 18 `createRoot` bootstrap |
| `AppContext.jsx` | **AppContext** — company-wide provider, `useApp()` hook, `defaultTheme`, announcements state |
| `ThemeContext.jsx` | **ThemeContext** — per-user theme provider (calls `useApp()`), `useTheme()` hook, localStorage read, `themeStyles` map |
| `UserContext.jsx` | **UserContext** — per-user data provider (calls `useTheme()`), `useUser()` hook, localStorage write, enriches user with `currentTheme` |
| `users.js` | Static `USERS` data array — pure JS, no React dependency |
| `App.jsx` | Root component — wires providers together; `AnnouncementManager` |
| `UserCard.jsx` | Per-user card container — applies theme styling |
| `UserInfo.jsx` | Displays user details (full name, team, title, company) |
| `ThemeButton.jsx` | Three-button theme switcher (dark / light / grey) |
| `UserPosts.jsx` | Post list + `PostItem` (innermost component consuming all contexts) |
| `LayoutMultiProviders/App.jsx` | 4-layer provider nesting demo with annotated dependency chain |
| `LayoutMultiProviders/PostContext.jsx` | **PostContext** — post provider (calls `useUser()`), IndexedDB persistence, proverb seeds |
| `LayoutMultiProviders/UserPosts.jsx` | User profile + create-post form + post list (consumes all 4 contexts) |
| `LayoutMultiProviders/postsDB.js` | IndexedDB helper — `loadPosts()` / `savePosts()`, pure JS |
| `LayoutMultiProviders/index.html` | HTML entry point for multi-provider page |
| `LayoutMultiProviders/main.jsx` | React 18 bootstrap for multi-provider page |

---

## Contexts

### AppContext (outermost)

**Provider:** `<AppProvider>`  
**Hook:** `useApp()`

| Field | Type | Description |
|---|---|---|
| `companyName` | `string` | Organisation name displayed in user info & posts |
| `fiscalQuarter` | `string` | Current fiscal quarter shown on every post |
| `defaultTheme` | `'dark' \| 'light' \| 'grey'` | Company-wide default theme — read by ThemeProvider on init |
| `announcements` | `string[]` | Live list of company-wide announcements |
| `addAnnouncement` | `(msg: string) => void` | Append a new announcement |
| `removeAnnouncement` | `(index: number) => void` | Remove an announcement by index |

**Business purpose:** Organisation-level data that every component needs regardless of which user context it sits in. The `AnnouncementManager` at the top level and `PostItem` at the bottom both consume this same context — proving that context skips intermediate layers.

### ThemeContext (per-user)

**Provider:** `<ThemeProvider>`  
**Hook:** `useTheme()`

| Field | Type | Description |
|---|---|---|
| `theme` | `'dark' \| 'light' \| 'grey'` | Current theme for this user's card |
| `cycleTheme` | `() => void` | Rotate to next theme |
| `setSpecificTheme` | `(t: string) => void` | Jump to a specific theme |

**Key design:** Each user card wraps its children in a **separate** `<ThemeProvider>` instance. Because React context resolution walks **up** the tree and stops at the nearest provider, each card's `useTheme()` resolves to its own provider — making themes fully independent.

**Inter-provider dependency:** ThemeProvider calls `useApp()` to read `defaultTheme` from company config. It also reads saved theme from `localStorage` on mount (key: `theme_user_<userId>`), falling back to `defaultTheme` if nothing is saved.

### UserContext (per-user)

**Provider:** `<UserProvider user={...}>`  
**Hook:** `useUser()`

Returns the user object enriched with theme data:

| Field | Type | Description |
|---|---|---|
| `id` | `number` | Unique identifier |
| `shortName` | `string` | Display name used on posts |
| `fullName` | `string` | Full name shown in user info card |
| `team` | `string` | Department / team name |
| `title` | `string` | Job title |
| `posts` | `Array<{id, title, body}>` | User's blog posts |
| `currentTheme` | `'dark' \| 'light' \| 'grey'` | Current theme (enriched from ThemeContext) |

**Inter-provider dependency:** UserProvider calls `useTheme()` to read the current theme. It persists the user's theme preference to `localStorage` whenever it changes, and enriches the user object with `currentTheme` so consumers can read it via `useUser()` without also calling `useTheme()`.

### PostContext (LayoutMultiProviders)

**Provider:** `<PostProvider>`  
**Hook:** `usePosts()`

| Field | Type | Description |
|---|---|---|
| `posts` | `Array<{id, title, author, likes}>` | List of posts |
| `addPost` | `(title: string) => void` | Create a new post — author auto-tagged from UserContext |
| `likePost` | `(postId: number) => void` | Increment likes on a post |

**Inter-provider dependency:** PostProvider calls `useUser()` to read `shortName` and auto-tag every new post. Callers of `addPost()` only provide a title.

**Persistence:** Posts are stored in the browser's IndexedDB (`PostsDB` database, `posts` store, keyed by `userId`). On mount, loads saved posts; if none exist, seeds with 2 random proverbs from a list of 20.

---

## Features

### Multi-User Display

Three users are rendered side-by-side, each as an independent `UserCard`. User data is defined in the `USERS` array in `users.js` and passed via `<UserProvider user={user}>`.

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

### Company-Wide Default Theme

`AppContext` provides a `defaultTheme` field (currently `'dark'`). `ThemeProvider` calls `useApp()` to read it and uses it as the initial theme for all user cards — instead of a hardcoded value. To change the company default, update one field in `AppContext.jsx`.

### Per-User Theme Persistence (localStorage)

Theme preferences survive page refresh:
- **ThemeProvider** reads saved theme from `localStorage` on mount (key: `theme_user_<id>`)
- **UserProvider** writes theme to `localStorage` whenever the user changes it
- Falls back to `defaultTheme` from AppContext if no saved preference exists

### User Context Enrichment

`UserProvider` calls `useTheme()` and attaches `currentTheme` to the user object. Any consumer can read `user.currentTheme` via `useUser()` without also needing to call `useTheme()` separately.

### Post Auto-Tagging from UserContext

`PostProvider` calls `useUser()` to read the current user's `shortName`. The `addPost(title)` function only requires a title — the author field is filled in automatically. Callers no longer need to know or pass the user name.

### IndexedDB Persistence for Posts

Posts on the LayoutMultiProviders page are persisted to the browser's Indexed Database:
- **Database:** `PostsDB`, **Store:** `posts`, keyed by `userId`
- Posts load from IndexedDB on mount, persist on every change (add, like)
- Error handling: `.catch()` on both `loadPosts()` and `savePosts()` — falls back to seed data on failure
- Helper module: `postsDB.js` (pure JS, no React)

### Random Proverb Seed Posts

When no saved posts exist in IndexedDB, 2 random proverbs are picked from a list of 20 (each ≤ 10 words) as seed posts. Seed posts are auto-tagged with the current user's `shortName`.

### Create New Post UI

The LayoutMultiProviders page (`/useContext/LayoutMultiProviders/index.html`) includes a "Create a New Post" section:
- Text input + "Add Post" button (also supports Enter key)
- Shows hint: author will be auto-tagged as the current user's shortName
- New posts appear immediately in the list and persist to IndexedDB

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

### How to Verify Provider Order Is Correct

Providers must be ordered so that **outer providers don't depend on inner ones**. But how do you verify the order is right?

#### Method 1: Error guard in custom hooks (automatic, runtime)

Every custom hook already throws if called outside its Provider:

```jsx
export function useApp() {
  const ctx = useContext(AppContext);
  if (ctx === undefined) {
    throw new Error('useApp must be used within an AppProvider');
    //                ↑ fires IMMEDIATELY if AppProvider is missing above
  }
  return ctx;
}
```

If you accidentally put `<UserProvider>` outside `<AppProvider>` and a child calls `useApp()`, the error fires at render time with a clear message. **This is your first line of defense.**

#### Method 2: Dependency rule (design-time)

Ask: *"Does Provider A's VALUE need data from Provider B?"*

| If… | Then… |
|---|---|
| A's value needs B's data | B must be **outer** (wrap A) |
| Neither depends on the other | Order between them doesn't matter |

In this app:

| Provider | Depends on | Correct position |
|---|---|---|
| `AppProvider` | nothing | outermost ✅ |
| `ThemeProvider` | `useApp()` → `defaultTheme` | below AppProvider ✅ |
| `UserProvider` | `useTheme()` → `theme` | below ThemeProvider ✅ |
| `PostProvider` | `useUser()` → `shortName` | below UserProvider ✅ |

Every inner provider depends on the one above it. Swapping any two crashes at render time.

#### Method 3: Deepest consumer test

The deepest component tells you if all providers are correctly nested. In this app, `PostItem` calls `useApp()` + `useTheme()` + `useUser()`. If `PostItem` renders without errors, all three providers are correctly above it.

#### Method 4: React DevTools

Open the **Components** tab → expand the tree → visually confirm:
```
AppProvider > ThemeProvider > UserProvider > UserCard > …
```

### Stateless Providers vs Normal Components

> **Note:** `UserProvider` in this codebase is no longer stateless — it now calls `useTheme()` and uses `useMemo` to enrich the user object with `currentTheme`. But the general question remains relevant for any provider that passes a prop straight through.

**Q: Should this be a normal component instead?**

**A: No** — it is still a genuine Provider. The question is not *"does it have state?"* but *"does it provide context value to descendants?"*

#### When to keep as Provider ✅

| Reason | Explanation |
|---|---|
| **Scopes data** | Any descendant calls `useUser()` — no props needed. A normal component can't do that. |
| **Multiple instances** | `<UserProvider user={alex}>` and `<UserProvider user={sam}>` create independent context scopes. Each subtree's `useUser()` resolves to its own user. |
| **Decouples consumers** | `PostItem` (6 levels deep) calls `useUser()` directly. With a normal component, you'd drill `user` through UserCard → UserPosts → PostItem. |

#### When to convert to normal component ❌

| Situation | Why it's not a real Provider |
|---|---|
| It doesn't call `<SomeContext.Provider>` | It's just grouping children — that's a layout component. |
| Only ONE direct child needs the data | Props are simpler than context. |
| It wraps a third-party component that provides its own context | You're adding an unnecessary layer. |
| The "provider" never has different values | A module-level constant or plain import is simpler. |

### createContext + Custom Hook + Error Boundary Pattern

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

### 4. Multiple Instances of the Same Context

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

### When to useMemo / useCallback for Context Values

This is the most common question about context performance. Here is the decision tree:

#### Decision tree

```
Is the value a PRIMITIVE (string, number, boolean)?
  → NO useMemo needed. React compares primitives by value.
    e.g., <MyContext.Provider value={count}>

Is the value a STABLE EXTERNAL REFERENCE (prop or module constant)?
  → NO useMemo needed. The reference doesn't change between renders.
    e.g., UserProvider passes the `user` prop directly.

Is the value an OBJECT/ARRAY CREATED INSIDE this component?
  → YES, useMemo it. Without it, a new reference is created every
    render → Object.is() sees a "change" → ALL consumers re-render.

Does the value INCLUDE FUNCTIONS defined inside this component?
  → YES, wrap each function in useCallback FIRST, then include
    them in useMemo's dependency array.
```

#### Examples from this codebase

| Provider | Value type | useMemo? | Why |
|---|---|---|---|
| `AppProvider` | `{ companyName, announcements, addAnnouncement, … }` | ✅ Yes | Object with functions created inside the component |
| `ThemeProvider` | `{ theme, cycleTheme, setSpecificTheme }` | ✅ Yes | Object with functions created inside the component |
| `UserProvider` | `{ ...user, currentTheme }` (new object) | ✅ Yes | Creates new object by spreading user + theme |
| `PostProvider` | `{ posts, addPost, likePost }` | ✅ Yes | Object with functions created inside the component |

#### The pattern

```jsx
// Step 1: Stabilise function references
const addPost = useCallback((title) => {
  setPosts(prev => [...prev, { title }]);
}, []);                                      // empty deps → same fn forever

// Step 2: Memo the value object
const value = useMemo(
  () => ({ posts, addPost }),
  [posts, addPost]                           // only re-creates when deps change
);

// Step 3: Pass the memoised value
return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
```

**Without useMemo:**
```
Parent renders → Provider re-renders → new { posts, addPost } object →
Object.is(oldValue, newValue) is false → ALL consumers re-render
(even if `posts` didn't actually change)
```

**With useMemo:**
```
Parent renders → Provider re-renders → useMemo returns SAME object →
Object.is(oldValue, newValue) is true → consumers DO NOT re-render
(unless `posts` actually changed)
```

### Innermost Component Consuming Outermost Context

`PostItem` sits 6 levels deep but calls `useApp()` to read `companyName`, `fiscalQuarter`, and `announcements` directly from the outermost `AppProvider`. No intermediate component (`UserCard`, `UserPosts`, `UserInfo`) needs to receive or forward this data.

**Practical business scenarios this pattern solves:**
- Showing **org-wide branding** (company name, logo URL) in leaf components
- Displaying **environment badges** ("STAGING" / "PROD") in every widget
- **Feature flags** checked deep inside form fields or table cells
- **Locale / i18n** strings accessed by the smallest UI atoms
- **Current user session / permissions** checked before rendering action buttons

### Provider Composition (Nesting Order Matters)

```
<AppProvider>              ← available to everything
  <ThemeProvider>          ← available to UserProvider's children & below
    <UserProvider>         ← available to UserCard & below
      <UserCard />
```

Providers must be ordered from most-global to most-specific. A component can only `useContext()` a context whose Provider is an **ancestor** in the tree. If `ThemeProvider` were inside `UserCard`, the `UserCard` itself couldn't call `useTheme()` — only its children could.

---

## LayoutMultiProviders Page

A separate page at `/useContext/LayoutMultiProviders/index.html` that demonstrates all 4 providers nested together with a single user:

```
<AppProvider>                        ← Layer 1: company config
  <ThemeProvider userId={user.id}>   ← Layer 2: calls useApp() → defaultTheme
    <UserProvider user={user}>       ← Layer 3: calls useTheme() → localStorage
      <PostProvider>                 ← Layer 4: calls useUser() → auto-tag posts
        <UserPosts />                ← Consumer: calls all 4 hooks
      </PostProvider>
    </UserProvider>
  </ThemeProvider>
</AppProvider>
```

**What this page adds beyond the main dashboard:**

| Feature | Description |
|---|---|
| Create new post | Text input + button, Enter key support |
| Post auto-tagging | Author filled automatically from UserContext — only title needed |
| IndexedDB persistence | Posts survive page refresh, stored in Indexed Database |
| Proverb seeds | 2 random proverbs (from 20) as initial posts when IndexedDB is empty |
| 4-context consumer | `UserPosts` calls `useApp()` + `useTheme()` + `useUser()` + `usePosts()` |

---

## How to Run

```bash
# From the project root
npm install
npm run dev
```

Then open:
- **Main dashboard:** `/useContext/index.html` — 3 user cards with independent themes
- **Multi-provider demo:** `/useContext/LayoutMultiProviders/index.html` — 4-layer provider nesting with create-post UI and IndexedDB persistence

