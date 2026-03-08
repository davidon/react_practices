import { useState } from 'react';
import { useUser } from '../UserContext.jsx';
import { useTheme, themeStyles } from '../ThemeContext.jsx';
import { useApp } from '../AppContext.jsx';
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
 * Includes a "Create new post" form. addPost(title) only needs the title —
 * the author is auto-tagged by PostProvider from UserContext (user.shortName).
 * Posts are persisted to IndexedDB automatically by PostProvider.
 */
function UserPosts() {
  const user = useUser();
  const { theme } = useTheme();
  const { companyName } = useApp();
  // addPost is now used — it auto-tags the author from UserContext
  const { posts, addPost, likePost } = usePosts();
  const styles = themeStyles[theme];

  // Local state for the "new post" input
  const [draft, setDraft] = useState('');

  const handleAddPost = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      addPost(trimmed);   // only title needed — author auto-tagged by PostProvider
      setDraft('');
    }
  };

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

        {/* Create New Post Section */}
        <section className="new-post-section" style={{ margin: '16px 0' }}>
          <h2>Create a New Post</h2>
          <p style={{ fontSize: 12, opacity: 0.6, margin: '2px 0 8px' }}>
            Author will be auto-tagged as <strong>{user.shortName}</strong> (from UserContext)
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Post title…"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPost()}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px solid #999',
                fontSize: 14,
                background: 'transparent',
                color: 'inherit',
              }}
            />
            <button
              onClick={handleAddPost}
              style={{
                padding: '6px 14px',
                borderRadius: 4,
                border: '1px solid #999',
                cursor: 'pointer',
                fontSize: 14,
                background: '#4a90d9',
                color: '#fff',
              }}
            >
              Add Post
            </button>
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
        <p>&copy; 2024 Multi-Context App. Posts persisted to IndexedDB.</p>
      </footer>
    </div>
  );
}

export default UserPosts;
