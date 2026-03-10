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
// Falls back to the hardcoded PROVERBS array in proverbs.js if the
// API is unreachable, rate-limited, or returns invalid data.
// ═══════════════════════════════════════════════════════════════════════

import { PROVERBS, pickRandom } from './proverbs.js';

const API_URL = 'https://zenquotes.io/api/quotes';

/**
 * Fetch quotes from ZenQuotes API.
 * Returns an array of { title, body } objects matching the proverbs shape.
 *
 * @param {number} count - Number of quotes to return (max 50 per API call)
 * @returns {Promise<Array<{title: string, body: string}>>}
 */
export async function fetchProverbs(count = 5) {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Validate response shape
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid API response');
    }

    // Filter out the "Too many requests" placeholder
    const valid = data.filter(
      item => item.q && item.a && item.a !== 'zenquotes.io'
    );

    if (valid.length === 0) throw new Error('No valid quotes returned');

    // Shuffle and take `count` items, map to our { title, body } shape
    const shuffled = [...valid].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(item => ({
      title: item.q.trim(),
      body: `— ${item.a}`,
    }));
  } catch (err) {
    console.warn('ZenQuotes API failed, using hardcoded proverbs:', err.message);
    // Fallback to hardcoded proverbs
    return pickRandom(PROVERBS, count);
  }
}

