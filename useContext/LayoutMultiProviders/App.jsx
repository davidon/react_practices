import { AppProvider, ThemeProvider, UserProvider, USERS } from '../UserContext.jsx';
import { PostProvider } from './PostContext.jsx';
import UserPosts from './UserPosts.jsx';

/**
 * LayoutMultiProviders App — demonstrates combining MULTIPLE context
 * providers (AppProvider, ThemeProvider, UserProvider, PostProvider)
 * so that any descendant can consume any of them via hooks.
 *
 * KEY: Provider nesting order matters — outermost providers are
 * accessible from everywhere; inner providers scope data to subtrees.
 */
export default function App() {
  // Pick the first user from the shared USERS dataset.
  const user = USERS[0];

  return (
    <AppProvider>
      <ThemeProvider>
        <UserProvider user={user}>
          <div className="app-container">
            <PostProvider>
              {/* Any component inside can use useApp(), useTheme(), useUser(), usePosts() */}
              <UserPosts />
            </PostProvider>
          </div>
        </UserProvider>
      </ThemeProvider>
    </AppProvider>
  );
}