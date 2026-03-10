import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../UserContext.jsx';
import { useTheme, themeStyles } from '../ThemeContext.jsx';
import { useApp } from '../AppContext.jsx';
import { usePosts } from './PostContext.jsx';
import { useLogin } from '../LoginContext.jsx';
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
/**
 * Truncate a full name for the "liked by" display.
 * "Alex Johnson" → "Ale J."   (first 3 letters of first name + first letter of surname)
 * "Sam"          → "Sam"      (single-word name stays as-is)
 */
function truncateName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 3);
  const first = parts[0].slice(0, 3);
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${first} ${lastInitial}.`;
}

/**
 * Format the likedBy array for display.
 * Shows the first 5 truncated names, plus "+N more" if there are more.
 */
function formatLikedBy(likedBy) {
  if (!likedBy || likedBy.length === 0) return null;
  const MAX = 5;
  const shown = likedBy.slice(0, MAX).map(truncateName);
  const remaining = likedBy.length - MAX;
  return remaining > 0
    ? `${shown.join(', ')} +${remaining} more`
    : shown.join(', ');
}

function UserPosts() {
  const user = useUser();
  const { theme } = useTheme();
  const { companyName } = useApp();
  const { posts, proverbs, addPost, likePost, deletePost } = usePosts();
  const { loggedInUser, login, logout } = useLogin();
  const styles = themeStyles[theme];

  // Local state for the "new post" form
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  // Local state for the login form
  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');

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

      {/* Login Bar — sessionStorage-backed */}
      <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.3)', marginBottom: 12 }}>
        {loggedInUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Logged in as <strong>{loggedInUser}</strong></span>
            <button
              onClick={logout}
              style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #999', cursor: 'pointer', fontSize: 13 }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="Username"
              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #999', fontSize: 13, background: 'transparent', color: 'inherit', width: 120 }}
            />
            <input
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              placeholder="Password"
              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #999', fontSize: 13, background: 'transparent', color: 'inherit', width: 120 }}
            />
            <button
              onClick={() => { if (loginName.trim()) { login(loginName); setLoginName(''); setLoginPass(''); } }}
              style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #999', cursor: 'pointer', fontSize: 13, background: '#4a90d9', color: '#fff' }}
            >
              Login
            </button>
          </div>
        )}
      </div>

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

        {/* My Proverbs — shown ONLY when there are no real posts.
            Ephemeral: randomly picked on every page refresh, never persisted. */}
        {posts.length === 0 && (
        <section className="posts-section">
          <h2>My Proverbs</h2>
          <p style={{ fontSize: 12, opacity: 0.5, margin: '2px 0 8px' }}>
            Random proverbs — refreshed on every page load. Create a post to replace them!
          </p>
          <ul className="posts-list" style={{ listStyle: 'none', padding: 0 }}>
            {proverbs.map(proverb => (
              <li key={proverb.id} className="post-item" style={{ padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.3)' }}>
                <h3 style={{ margin: '4px 0' }}>{proverb.title}</h3>
                {proverb.body && (
                  <p style={{ margin: '4px 0', fontSize: 13, opacity: 0.8 }}>
                    {proverb.body.length > 80 ? proverb.body.slice(0, 80) + '…' : proverb.body}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
        )}

        {/* Your Posts — only real user-created posts */}
        {posts.length > 0 && (
        <section className="posts-section">
          <h2>Your Posts ({posts.length})</h2>
          <ul className="posts-list" style={{ listStyle: 'none', padding: 0 }}>
            {posts.map(post => (
              <li key={post.id} className="post-item" style={{ padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.3)' }}>
                <div className="post-header">
                  <h3 style={{ margin: '4px 0' }}>
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
                <div className="post-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => likePost(post.id, loggedInUser)}
                    disabled={!loggedInUser}
                    title={loggedInUser ? `Like as ${loggedInUser}` : 'Login to like'}
                    style={{ cursor: loggedInUser ? 'pointer' : 'not-allowed', opacity: loggedInUser ? 1 : 0.5 }}
                  >
                    👍 Like ({(post.likedBy || []).length})
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    style={{ color: '#d9534f', cursor: 'pointer' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
                {/* Liked-by names: first 5, truncated */}
                {formatLikedBy(post.likedBy) && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.6 }}>
                    ❤️ {formatLikedBy(post.likedBy)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
        )}
      </main>

      {/* Footer Section */}
      <footer className="layout-footer" style={{ marginTop: '1rem', opacity: 0.6, fontSize: 13 }}>
        <p>&copy; 2024 Multi-Context App. Posts persisted to IndexedDB.</p>
      </footer>
    </div>
  );
}

export default UserPosts;
