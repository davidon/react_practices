refactor(UseContext): separate proverbs from posts; add delete; ephemeral proverbs

Proverbs are no longer persisted or counted as posts. They are ephemeral
placeholders — 2 randomly picked from 20 on every page refresh — shown
only on the detail page when a user has no real posts. The summary page
never shows proverbs.

PostContext.jsx:
- `posts` state now holds ONLY real user-created posts (never proverbs)
- New `proverbs` useMemo: 2 random proverbs generated per mount, never
  persisted to IndexedDB, re-randomised on every page refresh
- On load from IndexedDB, old proverb entries (isProverb: true) are
  stripped out so legacy data is cleaned up automatically
- Removed `hasUserPosts` flag (no longer needed — posts IS user posts)
- New `deletePost` callback: filters post by ID, auto-persisted via
  existing useEffect → IndexedDB sync
- Context value: { posts, proverbs, addPost, likePost, deletePost }

UserPosts.jsx:
- "My Proverbs" section shown ONLY when posts.length === 0 (no real posts)
  — plain text, no links, no like/delete buttons
  — subtitle: "Random proverbs — refreshed on every page load"
- "Your Posts (N)" section shown ONLY when posts.length > 0
  — each post has 👍 Like and 🗑️ Delete buttons
- "Total Posts" count reflects only real posts

PostDetail.jsx:
- Added 🗑️ Delete button next to Like button
- Delete navigates back to user's post list via useNavigate()

App.jsx (summary page):
- Removed createSeedPosts import — summary page never seeds proverbs
- Loaded posts filtered to strip out old proverbs (!p.isProverb)
- When user has no real posts: shows "No posts yet. Add one:" with
  quick-add input (no proverbs shown)

proverbs.js:
- sanitisePosts() enhanced: detects old proverb posts missing isProverb
  flag by matching title against PROVERB_TITLES set, auto-tags them
  so they can be filtered out during load

Files changed (5):
  M  UseContext/LayoutMultiProviders/PostContext.jsx — ephemeral proverbs, deletePost
  M  UseContext/LayoutMultiProviders/UserPosts.jsx   — split sections, delete buttons
  M  UseContext/LayoutMultiProviders/PostDetail.jsx  — delete button + navigate back
  M  UseContext/App.jsx                              — no proverbs on summary page
  M  UseContext/proverbs.js                          — sanitise tags old proverbs
