import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext.jsx';
import { useTheme, themeStyles } from '../ThemeContext.jsx';
import { useApp } from '../AppContext.jsx';
import { usePosts } from './PostContext.jsx';
import { useLogin } from '../LoginContext.jsx';
import { isSamePerson } from '../users.js';
import LoginBar from '../LoginBar.jsx';
import ThemeButton from '../ThemeButton.jsx';

/**
 * PostDetail — displays a single post's full content.
 *
 * URL pattern: /user/:userId/post/:postId
 *   useParams() reads userId and postId from the URL.
 *   The post is looked up from PostContext by id.
 *
 * Consumes all 4 contexts:
 *   useApp()   → companyName (app-level header)
 *   useTheme() → theme styling
 *   useUser()  → author info
 *   usePosts() → post data + likePost
 */
/** Truncate: "Alex Johnson" → "Ale J." */
function truncateName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 3);
  const first = parts[0].slice(0, 3);
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${first} ${lastInitial}.`;
}

function formatLikedBy(likedBy) {
  if (!likedBy || likedBy.length === 0) return null;
  const MAX = 5;
  const shown = likedBy.slice(0, MAX).map(truncateName);
  const remaining = likedBy.length - MAX;
  return remaining > 0
    ? `${shown.join(', ')} +${remaining} more`
    : shown.join(', ');
}

function PostDetail() {
  const { postId } = useParams();
  const user = useUser();
  const { theme } = useTheme();
  const { companyName } = useApp();
  const { posts, likePost, deletePost } = usePosts();
  const { loggedInUser } = useLogin();
  const styles = themeStyles[theme];
  const navigate = useNavigate();

  const post = posts.find(p => String(p.id) === postId);

  // Back link goes to this user's list view, not the root "/"
  const backLink = `/user/${user.id}`;

  if (!post) {
    return (
      <div style={{ ...styles, padding: '2rem', textAlign: 'center' }}>
        <h2>Post not found</h2>
        <p>Post ID "{postId}" does not exist for user {user.fullName}.</p>
        <Link to={backLink} style={{ color: '#4a90d9' }}>← Back to {user.fullName}'s posts</Link>
      </div>
    );
  }

  return (
    <div style={{ ...styles, padding: '1.5rem', border: '2px solid currentColor', transition: 'background 0.3s, color 0.3s', maxWidth: 700 }}>
      <header style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
          <Link to="/" style={{ color: '#4a90d9', textDecoration: 'none' }}>← Summary</Link>
          <span style={{ opacity: 0.4 }}>|</span>
          <Link to={backLink} style={{ color: '#4a90d9', textDecoration: 'none' }}>← {user.fullName}'s posts</Link>
        </div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '8px 0 4px' }}>{companyName}</p>
        <ThemeButton />
      </header>

      {/* Logged-in user status — shared LoginBar component */}
      <LoginBar />

      <article>
        <h1 style={{ margin: '0 0 8px' }}>{post.title}</h1>
        <p style={{ fontSize: 13, opacity: 0.6, margin: '0 0 16px' }}>
          by <strong>{post.author}</strong> · {user.team} · {user.title}
        </p>

        <div style={{ fontSize: 15, lineHeight: 1.6, margin: '16px 0' }}>
          {post.body || <em style={{ opacity: 0.5 }}>No content.</em>}
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(128,128,128,0.3)', display: 'flex', gap: 8 }}>
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
                  fontSize: 14,
                  opacity: canLike ? 1 : 0.5,
                }}
              >
                👍 {alreadyLiked ? 'Liked' : 'Like'} ({(post.likedBy || []).length})
              </button>
            );
          })()}
          <button
            onClick={() => { deletePost(post.id); navigate(backLink); }}
            style={{ cursor: 'pointer', fontSize: 14, color: '#d9534f' }}
          >
            🗑️ Delete
          </button>
        </div>
        {/* Liked-by names */}
        {formatLikedBy(post.likedBy) && (
          <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.6 }}>
            ❤️ {formatLikedBy(post.likedBy)}
          </p>
        )}
      </article>

      <footer style={{ marginTop: '1.5rem', opacity: 0.5, fontSize: 12 }}>
        Post ID: {post.id} · User: {user.fullName} (ID: {user.id})
      </footer>
    </div>
  );
}

export default PostDetail;

