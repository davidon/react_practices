// ═══════════════════════════════════════════════════════════════════════
// PROVERBS API — fetches quotes from ZenQuotes.io
// ═══════════════════════════════════════════════════════════════════════
// Free, no API key required, no registration needed.
//
// API docs: https://zenquotes.io/
// Endpoint: https://zenquotes.io/api/quotes  → returns 50 random quotes
// Rate limit: 5 requests per 30 seconds (free tier)
//
// Response format:
//   [{ "q": "quote text", "a": "Author Name", "h": "..." }, ...]
//
// VARIETY STRATEGY:
//   1. Fetch 50 quotes from API once per session (cached in module var)
//   2. Merge with 20 hardcoded proverbs → 70 quote pool
//   3. Track which quotes have been shown this session (Set of titles)
//   4. Always pick from unseen quotes first; reset when pool exhausted
//   5. Use crypto.getRandomValues for better randomness than Math.random
//
// Falls back to the hardcoded PROVERBS array if the API is unreachable.
// ═══════════════════════════════════════════════════════════════════════

import { PROVERBS, pickRandom } from './proverbs.js';

const API_URL = 'https://zenquotes.io/api/quotes';

// Module-level cache — fetched once per session, shared across all calls
let cachedPool = null;
let fetchPromise = null;
const shownTitles = new Set();

/** Fetch and cache the full API quote pool, merged with hardcoded proverbs. */
async function getPool() {
  if (cachedPool) return cachedPool;

  // Deduplicate concurrent calls
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const hardcoded = PROVERBS.map(p => ({ title: p.title, body: p.body }));

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid response');

      const apiQuotes = data
        .filter(item => item.q && item.a && item.a !== 'zenquotes.io')
        .map(item => ({ title: item.q.trim(), body: `— ${item.a}` }));

      // Merge and deduplicate by title
      const seen = new Set();
      const merged = [];
      for (const q of [...apiQuotes, ...hardcoded]) {
        if (!seen.has(q.title)) {
          seen.add(q.title);
          merged.push(q);
        }
      }
      cachedPool = merged;
    } catch (err) {
      console.warn('ZenQuotes API failed, using hardcoded proverbs only:', err.message);
      cachedPool = hardcoded;
    }

    fetchPromise = null;
    return cachedPool;
  })();

  return fetchPromise;
}

/** Better shuffle using crypto for more randomness. */
function secureShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const rand = crypto.getRandomValues(new Uint32Array(1))[0];
    const j = rand % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fetch quotes, maximizing variety across calls.
 * Picks from unseen quotes first; resets the seen set when exhausted.
 *
 * @param {number} count - Number of quotes to return
 * @returns {Promise<Array<{title: string, body: string}>>}
 */
export async function fetchProverbs(count = 5) {
  const pool = await getPool();

  // Filter to unseen quotes
  let unseen = pool.filter(q => !shownTitles.has(q.title));

  // If not enough unseen, reset tracking and use full pool
  if (unseen.length < count) {
    shownTitles.clear();
    unseen = pool;
  }

  // Shuffle and pick
  const picked = secureShuffle(unseen).slice(0, count);

  // Mark as shown
  for (const q of picked) {
    shownTitles.add(q.title);
  }

  return picked;
}

