import { useState } from 'react';
import { Link } from 'react-router-dom';
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
 *   • useApp()   → app-level data  (AppContext)
 *   • usePosts() → post data       (PostContext — local to LayoutMultiProviders)
 *
 * Includes a "Create new post" form with title + body fields.
 * addPost(title, body) auto-tags the author from UserContext.
 * Each post title links to a detail page at /user/:userId/post/:postId.
 */
function UserPosts() {
  const user = useUser();
  const { theme } = useTheme();
  const { companyName } = useApp();
  const { posts, addPost, likePost, hasUserPosts } = usePosts();
  const styles = themeStyles[theme];

  // Local state for the "new post" form
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  const handleAddPost = () => {
    const trimmedTitle = draftTitle.trim();
    if (trimmedTitle) {
      addPost(trimmedTitle, draftBody.trim());
      setDraftTitle('');
      setDraftBody('');
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Post title…"
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px solid #999',
                fontSize: 14,
                background: 'transparent',
                color: 'inherit',
              }}
            />
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              placeholder="Post content (optional)…"
              rows={3}
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px solid #999',
                fontSize: 14,
                background: 'transparent',
                color: 'inherit',
                resize: 'vertical',
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
                alignSelf: 'flex-start',
              }}
            >
              Add Post
            </button>
          </div>
        </section>

        {/* Posts Section — "My Proverbs" when only seed proverbs,
             "Your Posts (N)" when user has created real posts */}
        <section className="posts-section">
          <h2>{hasUserPosts ? `Your Posts (${posts.filter(p => !p.isProverb).length})` : 'My Proverbs'}</h2>
          {posts.length > 0 ? (
            <ul className="posts-list" style={{ listStyle: 'none', padding: 0 }}>
              {posts.map(post => (
                <li key={post.id} className="post-item" style={{ padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.3)' }}>
                  <div className="post-header">
                    <h3 style={{ margin: '4px 0' }}>
                      {/* Link to detail page: /user/:userId/post/:postId */}
                      <Link
                        to={`/user/${user.id}/post/${post.id}`}
                        style={{ color: '#4a90d9', textDecoration: 'none' }}
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <span className="post-author">by {post.author}</span>
                  </div>
                  {post.body && (
                    <p style={{ margin: '4px 0', fontSize: 13, opacity: 0.8 }}>
                      {post.body.length > 80 ? post.body.slice(0, 80) + '…' : post.body}
                    </p>
                  )}
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
