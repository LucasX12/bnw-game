// Loaded data shared by every module. Filled once at boot by main.js.
export const config = {
  characters: {},
  decks: {},
  tuning: {},
  credits: { lines: [] },
  graph: null,
  startScene: null,
  debug: new URLSearchParams(location.search).has('debug'),
};

// Club members in a fixed order: used for affinity, records and "highest".
export const CLUB = ['lenina', 'bernard', 'helmholtz', 'john'];
