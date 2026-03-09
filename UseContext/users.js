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
    posts: [
      { id: 101, title: 'My first React post', body: 'React is great for building UIs.' },
      { id: 102, title: 'Context is awesome', body: 'useContext eliminates prop-drilling.' },
      { id: 103, title: 'Hooks deep dive', body: 'Custom hooks keep code DRY.' },
    ],
  },
  {
    id: 2,
    shortName: 'Sam',
    fullName: 'Samantha Lee',
    team: 'Backend',
    title: 'Staff Engineer',
    posts: [
      { id: 201, title: 'Node.js tips', body: 'Streams save memory on large payloads.' },
      { id: 202, title: 'Database indexing', body: 'Always index your foreign keys.' },
      { id: 203, title: 'REST vs GraphQL', body: 'Choose based on client needs.' },
    ],
  },
  {
    id: 3,
    shortName: 'Jamie',
    fullName: 'Jamie Rivera',
    team: 'Design',
    title: 'UX Lead',
    posts: [
      { id: 301, title: 'Design tokens 101', body: 'Tokens bridge design and code.' },
      { id: 302, title: 'Accessibility matters', body: 'A11y is not optional.' },
      { id: 303, title: 'Color contrast tips', body: 'WCAG AA requires 4.5:1 ratio.' },
    ],
  },
];

