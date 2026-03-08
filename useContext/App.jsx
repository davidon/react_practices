import { useState } from 'react';
import { AppProvider, useApp } from './AppContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import { UserProvider } from './UserContext.jsx';
import { USERS } from './users.js';
import UserCard from './UserCard.jsx';

/**
 * App — root component.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * HOW TO VERIFY PROVIDER ORDER IS CORRECT
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1. ERROR GUARD IN CUSTOM HOOKS (already in place)
 *    Each custom hook throws if called outside its provider:
 *      useApp()  → "useApp must be used within an AppProvider"
 *      useTheme() → "useTheme must be used within a ThemeProvider"
 *      useUser() → "useUser must be used within a UserProvider"
 *
 *    If you accidentally nest providers in the wrong order — e.g.,
 *    put <UserProvider> outside <AppProvider> — and a child calls
 *    useApp(), it will throw immediately with a clear message.
 *    This is your FIRST line of defense: the `undefined` sentinel
 *    pattern catches missing providers at render time.
 *
 * 2. RULE OF THUMB: outer providers must NOT depend on inner ones.
 *    Ask: "Does Provider A's VALUE need data from Provider B?"
 *      • If yes → Provider B must wrap Provider A (B is outer).
 *      • If no  → order doesn't matter between them.
 *
 *    In this app:
 *      AppProvider   → needs nothing         → outermost ✅
 *      ThemeProvider → calls useApp() to read defaultTheme
 *                    → AppProvider MUST be above it ✅ (and it is)
 *      UserProvider  → calls useTheme() to persist per-user theme to localStorage
 *                    → ThemeProvider MUST be above it ✅ (and it is)
 *
 *    Full dependency chain:
 *      AppProvider → ThemeProvider → UserProvider
 *      Each inner provider depends on the one above it.
 *
 *    Since ThemeProvider calls useApp() and UserProvider calls useTheme(),
 *    swapping any two would break the dependency and throw at render time.
 *
 * 3. CONSUMER TEST: the deepest component tells you the correct order.
 *    PostItem calls useApp() + useTheme() + useUser(). All three
 *    providers must be ANCESTORS of PostItem. If PostItem renders
 *    without errors, the order is correct.
 *
 * 4. DEV-ONLY RENDER LOGGING (optional):
 *    In development, you can add console.log inside each Provider
 *    to confirm mount order:
 *      AppProvider:   "AppProvider mounted"
 *      ThemeProvider: "ThemeProvider mounted"
 *      UserProvider:  "UserProvider mounted"
 *    React renders parent before children, so the log order
 *    confirms the nesting order.
 *
 * 5. REACT DEVTOOLS:
 *    Open Components tab → expand the tree → visually confirm:
 *      AppProvider > ThemeProvider > UserProvider > UserCard > ...
 * ═══════════════════════════════════════════════════════════════════════
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
            /* Each user gets its OWN ThemeProvider → independent themes
             * userId is passed so ThemeProvider can read/write localStorage
             * with a per-user key (e.g., "theme_user_1") */
            <ThemeProvider key={user.id} userId={user.id}>
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