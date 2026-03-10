// ═══════════════════════════════════════════════════════════════════════
// USERS DATA
// ═══════════════════════════════════════════════════════════════════════
// Static user dataset. In production this would come from an API.
// Each user has a shortName (for post bylines) and fullName (for profile).
//
// BEST PRACTICE — DATA SEPARATE FROM CONTEXT:
//   This file has zero React imports. It is a plain JS module exporting
//   an array. Separating data from context providers means:
//     • Data can be imported in tests, scripts, or SSR without React
//     • The shape is documented in one place
//     • Adding a user is a data change, not a provider change
// ═══════════════════════════════════════════════════════════════════════
export const USERS = [
  {
    id: 1,
    shortName: 'Alex',
    fullName: 'Alex Johnson',
    team: 'Frontend',
    title: 'Senior Engineer',
  },
  {
    id: 2,
    shortName: 'Sam',
    fullName: 'Samantha Lee',
    team: 'Backend',
    title: 'Staff Engineer',
  },
  {
    id: 3,
    shortName: 'Jamie',
    fullName: 'Jamie Rivera',
    team: 'Design',
    title: 'UX Lead',
  },
  {
    id: 4,
    shortName: 'Morgan',
    fullName: 'Morgan Chen',
    team: 'DevOps',
    title: 'Platform Engineer',
  },
  {
    id: 5,
    shortName: 'Taylor',
    fullName: 'Taylor Kim',
    team: 'Frontend',
    title: 'React Developer',
  },
  {
    id: 6,
    shortName: 'Jordan',
    fullName: 'Jordan Patel',
    team: 'Backend',
    title: 'API Architect',
  },
  {
    id: 7,
    shortName: 'Casey',
    fullName: 'Casey Brooks',
    team: 'QA',
    title: 'Test Engineer',
  },
  {
    id: 8,
    shortName: 'Riley',
    fullName: 'Riley Thompson',
    team: 'Data',
    title: 'Data Analyst',
  },
  {
    id: 9,
    shortName: 'Avery',
    fullName: 'Avery Nakamura',
    team: 'Design',
    title: 'Product Designer',
  },
];

// ── LOOKUP HELPERS ──────────────────────────────────────────────────
// Login stores fullName (e.g., "Alex Johnson").
// Posts store author as shortName (e.g., "Alex").
// These helpers bridge the gap for ownership and self-like checks.
// ────────────────────────────────────────────────────────────────────

/** Map fullName → shortName for quick lookup. */
const fullToShort = Object.fromEntries(USERS.map(u => [u.fullName, u.shortName]));

/** Map shortName → fullName for quick lookup. */
const shortToFull = Object.fromEntries(USERS.map(u => [u.shortName, u.fullName]));

/**
 * Check if a logged-in user (fullName) is the same person as an author (shortName).
 * Also handles cases where author might be a truncated name like "Ale J."
 * by checking if the fullName starts with the first 3 chars of the author.
 *
 * @param {string|null} loggedInFullName - e.g., "Alex Johnson"
 * @param {string} author - e.g., "Alex" or "Ale J." or "Alex Johnson"
 * @returns {boolean}
 */
export function isSamePerson(loggedInFullName, author) {
  if (!loggedInFullName || !author) return false;
  // Direct match (fullName === fullName)
  if (loggedInFullName === author) return true;
  // loggedInFullName's shortName matches author
  const short = fullToShort[loggedInFullName];
  if (short && short === author) return true;
  // author is a fullName and loggedIn is matched via shortName
  const authorFull = shortToFull[author];
  if (authorFull && authorFull === loggedInFullName) return true;
  return false;
}

/**
 * Get the shortName for a logged-in fullName.
 * Returns null if not a known user.
 */
export function getShortName(fullName) {
  return fullToShort[fullName] || null;
}

