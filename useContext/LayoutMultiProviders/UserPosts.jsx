import { useUser } from '../UserContext.jsx';
import { usePosts } from './PostContext.jsx';
import ThemeButton from '../ThemeButton.jsx';

function UserPosts() {
  const { user } = useUser();
  const { posts, addPost, likePost } = usePosts();

  return (
    <div className={`layout ${user.theme}-mode`}>
      {/* Header Section */}
      <header className="layout-header">
        <h1>Welcome, {user.name}!</h1>
        <ThemeButton />
      </header>

      {/* Main Content Section */}
      <main className="layout-content">
        {/* User Info Section */}
        <section className="user-section">
          <h2>User Profile</h2>
          <div className="user-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Theme:</strong> {user.theme}</p>
            <p><strong>Total Posts:</strong> {posts.length}</p>
          </div>
        </section>

        {/* Posts Section */}
        <section className="posts-section">
          <h2>Your Posts ({posts.length})</h2>
          {posts.length > 0 ? (
            <ul className="posts-list">
              {posts.map(post => (
                <li key={post.id} className="post-item">
                  <div className="post-header">
                    <h3>{post.title}</h3>
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
      <footer className="layout-footer">
        <p>&copy; 2024 Multi-Context App. Using both UserContext and PostContext.</p>
      </footer>
    </div>
  );
}

export default UserPosts;
