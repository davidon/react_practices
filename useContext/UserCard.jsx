import { useTheme, themeStyles } from './UserContext.jsx';
import UserInfo from './UserInfo.jsx';
import UserPosts from './UserPosts.jsx';
import ThemeButton from './ThemeButton.jsx';

/**
 * UserCard — one card per user.
 *
 * KEY CONCEPT: This component reads from ThemeContext via useTheme().
 *   Because each UserCard is wrapped in its OWN <ThemeProvider> (see App.jsx),
 *   useTheme() resolves to the nearest ThemeProvider — giving each card
 *   independent theme state.
 *
 * COMPOSITION: UserCard doesn't pass theme or user data as props to its
 *   children. Instead, UserInfo, ThemeButton, and UserPosts each call
 *   their own useTheme() / useUser() / useApp() hooks directly.
 *   This eliminates prop-drilling entirely.
 */
export default function UserCard() {
  // KEY: useTheme() resolves to THIS card's ThemeProvider, not a global one.
  const { theme } = useTheme();

  // Spread operator merges theme colors into the card's inline styles.
  const styles = themeStyles[theme];

  return (
    <div
      style={{
        ...styles,
        borderRadius: 10,
        padding: 20,
        width: 320,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      <UserInfo />
      <ThemeButton />
      <UserPosts />
    </div>
  );
}

