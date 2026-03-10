import { useLogin } from './LoginContext.jsx';

/**
 * LoginBar — shared header component showing the logged-in user.
 *
 * Displays "Logged in as <name> [Logout]" when logged in,
 * or "Not logged in" when no session exists.
 *
 * The login form (username + password + Login button) is intentionally
 * NOT part of this component — it lives only on the summary page.
 * This component is a read-only status display + logout button.
 *
 * Used by both the summary page (App.jsx) and detail pages
 * (UserPosts.jsx, PostDetail.jsx) via layout.
 */
export default function LoginBar() {
  const { loggedInUser, logout } = useLogin();

  return (
    <div style={{
      padding: '6px 12px',
      background: 'rgba(74, 144, 217, 0.1)',
      borderRadius: 6,
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    }}>
      {loggedInUser ? (
        <>
          <span>🔓 Logged in as <strong>{loggedInUser}</strong></span>
          <button
            onClick={logout}
            style={{
              padding: '2px 8px', borderRadius: 4,
              border: '1px solid #999', cursor: 'pointer',
              fontSize: 12, background: 'transparent', color: 'inherit',
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <span style={{ opacity: 0.6 }}>🔒 Not logged in</span>
      )}
    </div>
  );
}

