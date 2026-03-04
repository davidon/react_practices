import { UserProvider } from '../UserContext.jsx';
import { PostProvider } from '../PostContext.jsx';
import Layout from './Layout.jsx';
import ThemeButton from '../ThemeButton.jsx';

export default function App() {
  return (
    <UserProvider>
      <div className="app-container">
        <h1>Welcome to the App</h1>
        <PostProvider>
          {/* Now any component inside Layout can use BOTH useUser() and usePosts() */}
          <Layout />
        </PostProvider>
      </div>
    </UserProvider>
  );
}