import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../UserContext.jsx';
import { useTheme, themeStyles } from '../ThemeContext.jsx';
import { useApp } from '../AppContext.jsx';
import { usePosts } from './PostContext.jsx';
import { useLogin } from '../LoginContext.jsx';
import { isSamePerson } from '../users.js';
import LoginBar from '../LoginBar.jsx';
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
  const { loggedInUser } = useLogin();
  const styles = themeStyles[theme];

  // Local state for the "new post" form
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  // Can the logged-in user create posts for this viewed user?
  // loggedInUser is a fullName (e.g., "Alex Johnson"), compare against user.fullName.
  const isOwner = loggedInUser && loggedInUser === user.fullName;

  const handleAddPost = () => {
    if (!isOwner) return;
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

      {/* Logged-in user status — shared LoginBar component */}
      <LoginBar />

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

        {/* Create New Post Section — visible but disabled when not owner */}
        <section className="new-post-section" style={{ margin: '16px 0', opacity: isOwner ? 1 : 0.4 }}>
          <h2>Create a New Post</h2>
          <p style={{ fontSize: 12, opacity: 0.6, margin: '2px 0 8px' }}>
            {isOwner
              ? <>Author will be auto-tagged as <strong>{user.shortName}</strong> (from UserContext)</>
              : loggedInUser
              ? <>Login as <strong>{user.fullName}</strong> to create posts for this user</>
              : <>Login to create posts</>
            }
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Post title…"
              disabled={!isOwner}
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
              disabled={!isOwner}
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
              disabled={!isOwner}
              title={isOwner ? 'Add post' : loggedInUser ? `Login as ${user.fullName} to add` : 'Login to add posts'}
              style={{
                padding: '6px 14px',
                borderRadius: 4,
                border: '1px solid #999',
                cursor: isOwner ? 'pointer' : 'not-allowed',
                fontSize: 14,
                background: isOwner ? '#4a90d9' : '#999',
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
                  {(() => {
                    const isOwnPost = isSamePerson(loggedInUser, post.author);
                    const alreadyLiked = loggedInUser && (post.likedBy || []).includes(loggedInUser);
                    const canLike = loggedInUser && !isOwnPost && !alreadyLiked;
                    return (
                      <button
                        onClick={() => likePost(post.id, loggedInUser)}
                        disabled={!canLike}
                        title={
                          !loggedInUser ? 'Login to like'
                          : isOwnPost ? 'Cannot like your own post'
                          : alreadyLiked ? 'Already liked'
                          : `Like as ${loggedInUser}`
                        }
                        style={{
                          cursor: canLike ? 'pointer' : 'not-allowed',
                          opacity: canLike ? 1 : 0.5,
                        }}
                      >
                        👍 {alreadyLiked ? 'Liked' : 'Like'} ({(post.likedBy || []).length})
                      </button>
                    );
                  })()}
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
