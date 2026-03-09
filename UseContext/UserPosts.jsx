import { useUser } from './UserContext.jsx';
import { useApp } from './AppContext.jsx';
import { useTheme, themeStyles } from './ThemeContext.jsx';

/**
 * PostItem — the MOST DEEPLY NESTED component in the tree.
 *
 * Component path:  AppProvider → ThemeProvider → UserProvider
 *                    → UserCard → UserPosts → PostItem
 *
 * KEY CONCEPT: Innermost component consuming outer contexts.
 *   PostItem reaches across context boundaries:
 *     • useUser()  → UserContext  (middle) — user's shortName
 *     • useTheme() → ThemeContext (middle) — per-card theme styling
 *
 *   No intermediate component (UserCard, UserPosts) needs to know about
 *   or forward these context values. This is the core value of useContext:
 *   it eliminates prop-drilling across arbitrarily deep component trees.
 *
 *   NOTE: companyName and fiscalQuarter are now displayed in a summary
 *   region above the posts (in UserPosts), not repeated on each post.
 */
function PostItem({ post }) {
  const user = useUser();           // → nearest UserProvider
  const { theme } = useTheme();     // → nearest ThemeProvider

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
        — {user.shortName}
      </small>
    </li>
  );
}

/**
 * UserPosts — lists all posts for the current user.
 *
 * Displays a summary region above the posts with app-level info
 * (companyName, fiscalQuarter, announcements) from AppContext,
 * so this info is shown once — not repeated on every post.
 */
export default function UserPosts() {
  const user = useUser();
  const { companyName, fiscalQuarter, announcements } = useApp();
  const { theme } = useTheme();

  return (
    <div>
      {/* ── Summary region: app-level info displayed ONCE above posts ── */}
      <div style={{
        padding: '6px 10px',
        marginBottom: 8,
        fontSize: 12,
        opacity: 0.7,
        borderBottom: '1px solid rgba(128,128,128,0.3)',
      }}>
        <span>{companyName} · {fiscalQuarter}</span>
        {/* Announcements from AppContext — when AnnouncementManager
             adds/removes at the top level, this region re-renders
             automatically. Context change → all useApp() consumers update. */}
        {announcements.length > 0 && (
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              padding: '2px 6px',
              background: theme === 'dark' ? '#444' : '#f0f0f0',
              borderRadius: 3,
              color: theme === 'dark' ? '#ffc' : '#333',
              display: 'inline-block',
              marginLeft: 8,
            }}
          >
            📌 {announcements[0]}
          </div>
        )}
      </div>

      <h4 style={{ margin: '12px 0 6px' }}>Posts ({(user.posts || []).length})</h4>
      <ul style={{ padding: 0 }}>
        {(user.posts || []).map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );
}
