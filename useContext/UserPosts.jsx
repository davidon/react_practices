import { useUser } from './UserContext.jsx';

function UserPosts() {
  // We grab 'user' from the top-level Provider
  const { user } = useUser();

  const mockPosts = [
    { id: 1, title: "My first React post" },
    { id: 2, title: "Context is awesome" }
  ];

  return (
    <div className="posts-container">
      <h3>Posts for {user.name}</h3>
      <ul>
        {mockPosts.map(post => (
          <li key={post.id}>
            {post.title} — <small>Viewing in {user.theme} mode</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserPosts;