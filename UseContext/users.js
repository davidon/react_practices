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
];

