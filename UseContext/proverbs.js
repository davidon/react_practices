// ═══════════════════════════════════════════════════════════════════════
// PROVERBS DATA + SEED HELPERS
// ═══════════════════════════════════════════════════════════════════════
// Shared between the summary page (App.jsx) and the detail page
// (PostContext.jsx) so both pages seed the same proverbs when
// IndexedDB is empty for a user.
//
// Pure JS — no React dependency.
// ═══════════════════════════════════════════════════════════════════════

export const PROVERBS = [
  { title: 'Actions speak louder than words.', body: 'What you do matters more than what you say. Demonstrate your intentions through behavior, not promises.' },
  { title: 'A penny saved is a penny earned.', body: 'Saving money is just as valuable as earning it. Small savings compound over time into significant wealth.' },
  { title: 'The early bird catches the worm.', body: 'Those who act promptly and seize opportunities early gain advantages over those who wait.' },
  { title: 'Where there is a will there is a way.', body: 'Determination and persistence can overcome any obstacle. If you truly want something, you will find a path.' },
  { title: 'Practice makes perfect.', body: 'Repeated effort and consistent practice lead to mastery. No skill is acquired without dedication.' },
  { title: 'Better late than never.', body: 'It is preferable to do something late than to never do it at all. Taking action matters more than timing.' },
  { title: 'Two wrongs do not make a right.', body: 'Responding to wrongdoing with more wrongdoing does not fix anything. Choose the higher road.' },
  { title: 'Knowledge is power.', body: 'Understanding and education give you the ability to make better decisions and influence outcomes.' },
  { title: 'Fortune favors the bold.', body: 'Taking calculated risks often leads to greater rewards. Hesitation can mean missed opportunities.' },
  { title: 'Honesty is the best policy.', body: 'Being truthful builds trust and credibility over time, even when the truth is difficult to share.' },
  { title: 'When in Rome do as Romans do.', body: 'Adapt your behavior to match the customs and expectations of the environment you are in.' },
  { title: 'Necessity is the mother of invention.', body: 'When faced with urgent needs or constraints, people find creative and innovative solutions.' },
  { title: 'The pen is mightier than the sword.', body: 'Written words and ideas have more lasting impact than physical force or violence.' },
  { title: 'People in glass houses should not throw stones.', body: 'Do not criticize others for faults you yourself possess. Self-awareness prevents hypocrisy.' },
  { title: 'A journey of a thousand miles begins with one step.', body: 'Every great achievement starts with a single small action. Do not be overwhelmed by the scale of your goal.' },
  { title: 'Still waters run deep.', body: 'Quiet, calm people often have the deepest thoughts and strongest feelings beneath the surface.' },
  { title: 'Time is money.', body: 'Time is a valuable resource that should not be wasted. Efficient use of time leads to productivity.' },
  { title: 'Rome was not built in a day.', body: 'Great things take time to accomplish. Patience and sustained effort are essential for lasting results.' },
  { title: 'Well begun is half done.', body: 'A strong start sets the foundation for success. Good planning and preparation make completion easier.' },
  { title: 'Hope for the best prepare for the worst.', body: 'Maintain optimism but have contingency plans. Being prepared for setbacks reduces their impact.' },
];

/** Pick `count` random unique items from an array. */
export function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Create seed proverb posts for a user.
 * Used by both the summary page and PostContext when IndexedDB is empty.
 */
export function createSeedPosts(shortName, count = 2) {
  return pickRandom(PROVERBS, count).map((proverb, i) => ({
    id: i + 1,
    title: proverb.title,
    body: proverb.body,
    author: shortName,
    likes: 0,
    isProverb: true,
  }));
}

/** Set of known proverb titles for detecting untagged proverbs in old data. */
const PROVERB_TITLES = new Set(PROVERBS.map(p => p.title));

/**
 * Sanitise posts loaded from IndexedDB.
 *  1. Fixes corrupted data from an earlier bug where the whole proverb object
 *     was stored as the title field instead of proverb.title.
 *  2. Tags old proverb posts that were saved before the `isProverb` flag
 *     was introduced, so they correctly appear under "My Proverbs".
 *  3. Adds missing `likedBy` array for posts saved before per-user likes.
 */
export function sanitisePosts(posts) {
  return posts.map(p => {
    // Fix corrupted title (object instead of string)
    if (typeof p.title === 'object' && p.title !== null) {
      p = { ...p, title: p.title.title || '', body: p.title.body || p.body || '' };
    }
    // Tag old proverbs missing the isProverb flag
    if (!p.isProverb && PROVERB_TITLES.has(p.title)) {
      p = { ...p, isProverb: true };
    }
    // Add missing likedBy array for old posts
    if (!Array.isArray(p.likedBy)) {
      p = { ...p, likedBy: [], likes: 0 };
    }
    return p;
  });
}

