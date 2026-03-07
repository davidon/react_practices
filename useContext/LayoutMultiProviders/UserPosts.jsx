import { useUser, useTheme, useApp, themeStyles } from '../UserContext.jsx';
import { usePosts } from './PostContext.jsx';
import ThemeButton from '../ThemeButton.jsx';

/**
 * UserPosts (LayoutMultiProviders version)
 *
 * Demonstrates consuming FOUR different contexts in a single component:
 *   • useUser()  → per-user data   (UserContext)
 *   • useTheme() → per-user theme  (ThemeContext)
 *   • useApp()   → company-wide    (AppContext)
 *   • usePosts() → post data       (PostContext — local to LayoutMultiProviders)
 *
 * KEY: useUser() returns the user object directly (not wrapped in {user}).
 */
function UserPosts() {
  // useUser() returns the user object directly — no destructuring needed
  const user = useUser();
  const { theme } = useTheme();
  const { companyName } = useApp();
  const { posts, likePost } = usePosts();
  const styles = themeStyles[theme];

  return (
    <div style={{ ...styles, padding: '1rem', border: '2px solid currentColor', transition: 'background 0.3s, color 0.3s' }}>
      {/* Header Section */}
      <header className="layout-header">
        <h1>Welcome, {user.fullName}!</h1>
        <p style={{ fontSize: 12, opacity: 0.7 }}>{companyName}</p>
        <ThemeButton />
      </header>

      {/* Main Content Section */}
      <main className="layout-content">
        {/* User Info Section */}
        <section className="user-section">
          <h2>User Profile</h2>
          <div className="user-info">
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Short Name:</strong> {user.shortName}</p>
            <p><strong>Team:</strong> {user.team}</p>
            <p><strong>Title:</strong> {user.title}</p>
            <p><strong>Theme:</strong> {theme}</p>
            <p><strong>Total Posts:</strong> {posts.length}</p>
          </div>
        </section>

        {/* Posts Section */}
        <section className="posts-section">
          <h2>Your Posts ({posts.length})</h2>
          {posts.length > 0 ? (
            <ul className="posts-list" style={{ listStyle: 'none', padding: 0 }}>
              {posts.map(post => (
                <li key={post.id} className="post-item" style={{ padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.3)' }}>
                  <div className="post-header">
                    <h3 style={{ margin: '4px 0' }}>{post.title}</h3>
                    <span className="post-author">by {post.author}</span>
                  </div>
                  <div className="post-actions">
                    <button onClick={() => likePost(post.id)}>
                      👍 Like ({post.likes})
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-posts">No posts yet. Create your first post!</p>
          )}
        </section>
      </main>

      {/* Footer Section */}
      <footer className="layout-footer" style={{ marginTop: '1rem', opacity: 0.6, fontSize: 13 }}>
        <p>&copy; 2024 Multi-Context App. Using AppContext, ThemeContext, UserContext, and PostContext.</p>
      </footer>
    </div>
  );
}

export default UserPosts;
