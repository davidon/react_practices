refactor(useContext): real inter-provider dependencies, localStorage/IndexedDB persistence, create-post UI

BREAKING: Provider nesting order is now enforced — each inner provider
calls a hook from the outer one. Swapping any two crashes at render time.

Features:
- Create new post UI: input + button + Enter key, immediate list update
- Posts persisted to IndexedDB (postsDB.js helper, loadPosts/savePosts)
- Seed posts: 2 random proverbs from 20 when IndexedDB is empty
- Per-user theme persisted to localStorage (ThemeProvider reads, UserProvider writes)
- AppContext provides defaultTheme; ThemeProvider reads it as initial theme
- PostProvider auto-tags new posts with user.shortName from UserContext
- UserProvider enriches user object with currentTheme from ThemeContext

Refactor:
- Split monolithic UserContext.jsx into AppContext, ThemeContext, UserContext, users.js
- Real dependency chain: AppProvider → ThemeProvider (useApp) → UserProvider (useTheme) → PostProvider (useUser)
- Removed unused barrel re-exports from UserContext.jsx
- useMemo/useCallback applied consistently across all providers
- Error handling: .catch() on IndexedDB calls, fallback to seed data

Docs:
- README merged with full architecture docs, inter-provider chain, persistence details

