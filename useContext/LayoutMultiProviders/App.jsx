import { UserProvider } from '../UserContext.jsx';
import { PostProvider } from './PostContext.jsx';
import UserPosts from './UserPosts.jsx';

export default function App() {
  return (
    <UserProvider>
      <div className="app-container">
        <PostProvider>
          {/* Now any component inside UserPosts can use BOTH useUser() and usePosts() */}
          <UserPosts />
        </PostProvider>
      </div>
    </UserProvider>
  );
}