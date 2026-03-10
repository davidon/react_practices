# Web Storage Comparison

## sessionStorage vs localStorage for Login State

### Why sessionStorage is the right choice (for a SPA)

When the app is a **single page application** (one `index.html` with HashRouter), `sessionStorage` is the correct choice for login state:

| | `sessionStorage` | `localStorage` |
|---|---|---|
| **Lifetime** | Current tab only | Forever (until manual clear) |
| **Shared across tabs** | ❌ No — per tab | ✅ Yes — all tabs |
| **Cleared on tab close** | ✅ Yes (automatic logout) | ❌ No |
| **SPA route changes** | ✅ Survives (same page) | ✅ Survives |
| **Cross-page nav (separate .html)** | ❌ Lost on new tab | ✅ Shared |

**Key insight:** SPA route changes (`#/` → `#/user/1` → `#/user/1/post/42`) do NOT lose `sessionStorage` because they all happen within the same HTML page. The browser never unloads the page.

### History of this decision in the UseContext project

1. **Initially used `sessionStorage`** — correct for a login session (clears on tab close)
2. **Switched to `localStorage`** — because the summary page and detail page were **separate HTML files** (`UseContext/index.html` and `LayoutMultiProviders/index.html`). Navigating between them (especially via new tab) lost `sessionStorage`
3. **Switched back to `sessionStorage`** — after converting to SPA routing (HashRouter), all pages are served from one `index.html`. The cross-page problem no longer exists

### When to use which

| Use case | Storage |
|---|---|
| Login session (tab-scoped) | `sessionStorage` |
| User preferences (theme, language) | `localStorage` |
| Form drafts (survives refresh, not close) | `sessionStorage` |
| Offline data cache | `Cache Storage` (Service Worker) |
| Cross-site analytics | `Shared Storage` (Privacy Sandbox) |

---

## Cache Storage vs localStorage vs Shared Storage

| Feature | `localStorage` | `Cache Storage` | `Shared Storage` |
|---|---|---|---|
| **Purpose** | Key-value persistence | HTTP response caching | Cross-site data (Privacy Sandbox) |
| **API** | `getItem`/`setItem` (sync) | `caches.open()` / `cache.put()` (async) | `sharedStorage.set()` (async) |
| **Data type** | Strings only | Request/Response pairs | Strings only |
| **Size limit** | ~5–10 MB | Large (quota-managed, 100s of MB) | ~5 entries per origin |
| **Scope** | Same origin, all tabs | Same origin (via Service Worker) | Cross-origin (write anywhere, read via worklet only) |
| **Lifetime** | Until cleared | Until cleared / evicted | Browser-managed (~30 days) |
| **Typical use** | User prefs, tokens, small state | Offline-first PWAs, asset caching | Cross-site A/B testing, frequency capping, ads measurement |
| **Readable from JS** | ✅ Yes | ✅ Yes (async) | ❌ No — worklet only (opaque output) |

### Key distinctions

- **`localStorage`** — simple persistent KV store (settings, tokens, small state)
- **`sessionStorage`** — same API but dies when the tab closes (temp auth, form drafts)
- **`Cache Storage`** — for caching network responses (PWAs, offline support). Not for app state. You work with `Request`/`Response` objects, not arbitrary strings.
- **`Shared Storage`** — Chrome-only Privacy Sandbox API for **cross-site** use cases where third-party cookies may be restricted. You almost never need this for normal apps. See [worklets-vs-main-thread.md](./worklets-vs-main-thread.md) for why it uses a worklet.

