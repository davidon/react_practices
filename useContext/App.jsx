import { useState } from 'react';
import { AppProvider, USERS, ThemeProvider, UserProvider, useApp } from './UserContext.jsx';
import UserCard from './UserCard.jsx';

/**
 * App — root component.
 *
 * KEY CONCEPT: Provider nesting order matters.
 *   AppProvider (outermost) → available to EVERYTHING inside.
 *   ThemeProvider (per-user) → one instance per user card, so themes are independent.
 *   UserProvider  (per-user) → scopes user data to that card's subtree.
 *
 * Because React context resolves by walking UP to the NEAREST matching
 * Provider, each UserCard's useTheme() hits its own ThemeProvider while
 * useApp() keeps walking up to the single AppProvider at the top.
 */
export default function App() {
  return (
    <AppProvider>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center' }}>useContext — Multi-User Dashboard</h1>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Each user card has its own theme. Inner components access outer AppContext.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {USERS.map((user) => (
            /* Each user gets its OWN ThemeProvider → independent themes */
            <ThemeProvider key={user.id}>
              <UserProvider user={user}>
                <UserCard />
              </UserProvider>
            </ThemeProvider>
          ))}
        </div>

        {/* Announcement manager sits outside all user cards */}
        <AnnouncementManager />
      </div>
    </AppProvider>
  );
}


/**
 * AnnouncementManager — sits OUTSIDE all user cards but INSIDE AppProvider.
 *
 * KEY CONCEPT: Context changes propagate to ALL consumers automatically.
 *   When addAnnouncement() updates the announcements array in AppProvider,
 *   React re-renders every component that calls useApp() — including every
 *   PostItem deep inside every user card. This is how "live shared state"
 *   works with context: one mutation at the top, instant updates everywhere.
 */
function AnnouncementManager() {
  const { announcements, addAnnouncement, removeAnnouncement } = useApp();
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    if (draft.trim()) {
      addAnnouncement(draft.trim());
      setDraft('');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>📢 Company Announcements (AppContext)</h3>
      <ul>
        {announcements.map((a, i) => (
          <li key={`${a}-${i}`}>
            {a}{' '}
            <button onClick={() => removeAnnouncement(i)} style={{ marginLeft: 8, cursor: 'pointer' }}>✕</button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New announcement…"
          style={{ flex: 1, padding: 6 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}