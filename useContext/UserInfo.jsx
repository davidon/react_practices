import { useUser, useApp } from './UserContext.jsx';

/**
 * UserInfo — displays detailed user information.
 *
 * KEY CONCEPT: A single component consuming MULTIPLE contexts.
 *   - useUser()  → UserContext  (per-user data: name, team, title)
 *   - useApp()   → AppContext   (org-wide data: company name)
 *
 * This component sits inside UserProvider → ThemeProvider → AppProvider,
 * but it skips ThemeContext entirely and reaches directly into both
 * UserContext (nearest) and AppContext (outermost). useContext() doesn't
 * care about intermediate providers — it walks up to the matching one.
 */
export default function UserInfo() {
  // Per-user data from the nearest UserProvider
  const user = useUser();
  // Org-wide data from the outermost AppProvider (skips ThemeProvider)
  const { companyName } = useApp();

  return (
    <div style={{ marginBottom: 12 }}>
      <h2 style={{ margin: '0 0 4px' }}>{user.fullName}</h2>
      <p style={{ margin: '2px 0', fontSize: 14 }}>
        <strong>Team:</strong> {user.team}
      </p>
      <p style={{ margin: '2px 0', fontSize: 14 }}>
        <strong>Title:</strong> {user.title}
      </p>
      <p style={{ margin: '2px 0', fontSize: 12, opacity: 0.7 }}>
        {companyName}
      </p>
    </div>
  );
}

