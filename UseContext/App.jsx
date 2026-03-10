import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext.jsx';
import { USERS } from './users.js';
import { loadPosts, savePosts } from './LayoutMultiProviders/postsDB.js';
import { sanitisePosts } from './proverbs.js';

/**
 * App — SUMMARY PAGE
 *
 * Displays all users and their post titles in a compact overview.
 * Posts are loaded from IndexedDB — the SAME data source as the detail page,
 * so post IDs are always consistent between summary and detail views.
 *
 * - User names are clickable → overlay popup with user details
 * - Post titles link to: LayoutMultiProviders/index.html#/user/:userId/post/:postId
 * - When a user has no posts → shows an input box to add a quick post
 *
 * NOTE: Proverbs are NOT shown on the summary page. They are ephemeral
 * placeholders only visible on the detail page when a user has no real posts.
 */
export default function App() {
  return (
    <AppProvider>
      <SummaryDashboard />
    </AppProvider>
  );
}

/**
 * SummaryDashboard — renders the summary page content.
 * Separated from App so it can call useApp() (must be inside AppProvider).
 */
function SummaryDashboard() {
  const { companyName } = useApp();

  // State: overlay popup for user details
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>useContext — Summary</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        {companyName} · All users and posts at a glance
      </p>

      {USERS.map((user) => (
        <UserSummaryCard
          key={user.id}
          user={user}
          onUserClick={() => setSelectedUser(user)}
        />
      ))}

      {/* Overlay popup for user details */}
      {selectedUser && (
        <UserDetailOverlay
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <AnnouncementManager />
    </div>
  );
}

/**
 * UserSummaryCard — shows one user's name (clickable) + posts loaded from IndexedDB.
 * If no posts exist, shows a quick-add input box instead of fake data.
 */
function UserSummaryCard({ user, onUserClick }) {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  const detailBase = 'LayoutMultiProviders/index.html#';

  // Load posts from IndexedDB — same DB the detail page uses.
  // Only real user-created posts are shown; proverbs are stripped out.
  useEffect(() => {
    loadPosts(user.id)
      .then(saved => {
        if (saved && saved.length > 0) {
          const sanitised = sanitisePosts(saved);
          setPosts(sanitised.filter(p => !p.isProverb));
        }
        // If no saved posts → posts stays [] (show quick-add input)
        setLoaded(true);
      })
      .catch(err => {
        console.error(`Failed to load posts for user ${user.id}:`, err);
        setLoaded(true);
      });
  }, [user.id, user.shortName]);

  const handleQuickAdd = () => {
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    const newPost = {
      id: Date.now(),
      title: trimmed,
      body: '',
      author: user.shortName,
      likes: 0,
    };
    const updated = [...posts, newPost];
    setPosts(updated);
    setQuickTitle('');
    // Persist to IndexedDB so the detail page sees it too
    savePosts(user.id, updated).catch(err => {
      console.error(`Failed to save quick post for user ${user.id}:`, err);
    });
  };

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 16,
        border: '1px solid #ccc',
        borderRadius: 8,
      }}
    >
      {/* User name — clickable to open overlay popup */}
      <h2
        style={{ margin: '0 0 4px', cursor: 'pointer', color: '#4a90d9' }}
        onClick={onUserClick}
        title="Click to view user details"
      >
        {user.fullName}
      </h2>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888' }}>
        {user.shortName} · {user.team} · {user.title}
      </p>

      {!loaded ? (
        <p style={{ fontSize: 13, color: '#999' }}>Loading posts…</p>
      ) : posts.length > 0 ? (
        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {posts.map((post) => (
            <li key={post.id} style={{ padding: '4px 0', fontSize: 14 }}>
              {post.title}
            </li>
          ))}
        </ul>
      ) : (
        /* No posts — show quick-add input instead of fake data */
        <div>
          <p style={{ fontSize: 13, color: '#999', margin: '0 0 8px' }}>
            No posts yet. Add one:
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Post title…"
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              style={{ flex: 1, padding: '4px 8px', fontSize: 13, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <button
              onClick={handleQuickAdd}
              style={{ padding: '4px 12px', fontSize: 13, borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer', background: '#4a90d9', color: '#fff' }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* ALL POSTS link — disabled when user has no posts */}
      <div style={{ marginTop: 12 }}>
        {posts.length > 0 ? (
          <a
            href={`${detailBase}/user/${user.id}`}
            style={{ color: '#4a90d9', textDecoration: 'none', fontSize: 13, fontWeight: 'bold' }}
          >
            ALL POSTS →
          </a>
        ) : (
          <span style={{ color: '#999', fontSize: 13, fontWeight: 'bold', cursor: 'default' }}>
            ALL POSTS →
          </span>
        )}
      </div>
    </section>
  );
}

/**
 * UserDetailOverlay — popup overlay showing full user details.
 * Clicking the backdrop or ✕ closes it.
 */
function UserDetailOverlay({ user, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', color: '#222',
          padding: 24, borderRadius: 12, minWidth: 320, maxWidth: 480,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 8, right: 12,
            border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#666',
          }}
        >
          ✕
        </button>
        <h2 style={{ margin: '0 0 16px' }}>{user.fullName}</h2>
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td style={{ padding: '6px 0', fontWeight: 'bold' }}>Short Name</td><td>{user.shortName}</td></tr>
            <tr><td style={{ padding: '6px 0', fontWeight: 'bold' }}>Team</td><td>{user.team}</td></tr>
            <tr><td style={{ padding: '6px 0', fontWeight: 'bold' }}>Title</td><td>{user.title}</td></tr>
            <tr><td style={{ padding: '6px 0', fontWeight: 'bold' }}>User ID</td><td>{user.id}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * AnnouncementManager — manages live announcements via AppContext.
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
      <h3>📢 Announcements (AppContext)</h3>
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