import { useUser } from './UserContext.jsx';
import { useApp } from './AppContext.jsx';
import { useTheme, themeStyles } from './ThemeContext.jsx';

/**
 * PostItem — the MOST DEEPLY NESTED component in the tree.
 *
 * Component path:  AppProvider → ThemeProvider → UserProvider
 *                    → UserCard → UserPosts → PostItem
 *
 * KEY CONCEPT: Innermost component consuming the outermost context.
 *   PostItem reaches across ALL context boundaries:
 *     • useUser()  → UserContext  (middle) — user's shortName
 *     • useTheme() → ThemeContext (middle) — per-card theme styling
 *     • useApp()   → AppContext  (OUTER)  — company name, fiscal quarter,
 *                                           live announcements
 *
 *   No intermediate component (UserCard, UserPosts) needs to know about
 *   or forward AppContext data. This is the core value of useContext:
 *   it eliminates prop-drilling across arbitrarily deep component trees.
 *
 * PRACTICAL BUSINESS USE-CASES this pattern solves:
 *   1. Org-wide branding (company name / logo) shown in leaf components
 *   2. Fiscal/reporting period metadata on every data record
 *   3. Live announcements / system alerts displayed in-context
 *   4. Feature flags checked deep inside form fields or table cells
 *   5. Locale / i18n strings accessed by the smallest UI atoms
 *   6. Current user session / permissions gating action buttons
 */
function PostItem({ post }) {
  // Three separate useContext calls — each resolves independently
  // by walking up to the nearest matching Provider.
  const user = useUser();           // → nearest UserProvider
  const { theme } = useTheme();     // → nearest ThemeProvider
  const { companyName, fiscalQuarter, announcements } = useApp();  // → outermost AppProvider

  // Theme styles applied per-post, matching the card's current theme
  const styles = themeStyles[theme];

  return (
    <li
      style={{
        ...styles,
        borderRadius: 6,
        padding: '8px 10px',
        marginBottom: 6,
        listStyle: 'none',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      <strong>{post.title}</strong>
      <p style={{ margin: '4px 0 2px', fontSize: 13 }}>{post.body}</p>
      <small style={{ opacity: 0.65 }}>
        — {user.shortName} · {companyName} · {fiscalQuarter}
      </small>
      {/* KEY: announcements come from AppContext — when AnnouncementManager
           adds/removes at the top level, this PostItem (deepest leaf) re-renders
           automatically. React context change → all useApp() consumers update. */}
      {announcements.length > 0 && (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            padding: '2px 6px',
            background: theme === 'dark' ? '#444' : '#f0f0f0',
            borderRadius: 3,
            color: theme === 'dark' ? '#ffc' : '#333',
          }}
        >
          📌 {announcements[0]}
        </div>
      )}
    </li>
  );
}

/**
 * UserPosts — lists all posts for the current user.
 *
 * KEY: This component only needs useUser() (for the posts array).
 *   It does NOT need useApp() or useTheme() — those are consumed
 *   by PostItem directly. This is the benefit of context over props:
 *   intermediate components don't need to "pass through" data they
 *   don't use themselves.
 */
export default function UserPosts() {
  const user = useUser();

  return (
    <div>
      <h4 style={{ margin: '12px 0 6px' }}>Posts ({user.posts.length})</h4>
      <ul style={{ padding: 0 }}>
        {user.posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );
}
