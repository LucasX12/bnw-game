// The only module that touches localStorage and sessionStorage.
const KEYS = {
  global: 'ehn.global',
  auto: 'ehn.auto',
  slots: ['ehn.slot1', 'ehn.slot2', 'ehn.slot3'],
  session: 'ehn.session',
};

export const DEFAULT_SETTINGS = { textSpeed: 40, music: 0.7, sfx: 0.8, voice: 0.9, skipMode: 'read', reduceMotion: false };

export const store = { global: null, state: null, mendedPending: false };

function read(key) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch { return null; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { console.warn('[store] could not save', err); }
}

export function freshGlobal() {
  let reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
  return {
    v: 1,
    warningSeen: false,
    records: { lenina: 'active', bernard: 'active', helmholtz: 'active', john: 'visiting', you: 'active' },
    deletionDay: null,
    deletionCount: 0,
    endingsSeen: {},
    resetSeen: false,
    totalRefreshes: 0,
    settings: { ...DEFAULT_SETTINGS, reduceMotion: reduce },
    readLines: {},
  };
}

export function freshState(name) {
  return {
    v: 1,
    savedAt: null,
    delCount: 0,
    player: { name, caste: 'Beta-Plus' },
    pos: { scene: null, node: 0 },
    act: 1, day: 1, drain: 0,
    stage: { bg: null, bgMode: 'normal', sprites: [], music: null, detune: 0 },
    stats: { soma: 0, somaAct3: 0, somaAuto: 0, skips: 0, refreshes: 0, shockOffered: 0, shockUsed: 0, truth: 0, slogans: 0, catchinessTotal: 0 },
    affinity: { lenina: 0, bernard: 0, helmholtz: 0, john: 0 },
    flags: {},
    slogans: [],
    soma: 'hidden',
    somaskip: null,
    skipAllowed: true,
    mode: 'normal',
    interlude: null,
    sceneTags: [],
    title: null,
    termStats: false,
  };
}

export function loadGlobal() {
  const saved = read(KEYS.global);
  const g = Object.assign(freshGlobal(), saved || {});
  g.settings = { ...DEFAULT_SETTINGS, ...(saved?.settings || {}) };
  g.records = { ...freshGlobal().records, ...(saved?.records || {}) };
  store.global = g;
  // Saves exist but the global record is gone: someone cleared it. Mond can notice.
  store.mendedPending = !saved && anySave();
  return g;
}

let globalTimer = null;
export function saveGlobal() { clearTimeout(globalTimer); globalTimer = null; write(KEYS.global, store.global); }
export function saveGlobalSoon() { if (!globalTimer) globalTimer = setTimeout(saveGlobal, 1000); }

export function slotKey(slot) { return slot === 'auto' ? KEYS.auto : KEYS.slots[slot - 1]; }

export function saveSlot(slot) {
  if (!store.state) return null;
  const s = structuredClone(store.state);
  s.savedAt = new Date().toISOString();
  s.delCount = store.global.deletionCount || 0;
  write(slotKey(slot), s);
  return s;
}

export function readSlot(slot) { return read(slotKey(slot)); }
export function anySave() { return ['auto', 1, 2, 3].some((s) => readSlot(s)); }

// A save is locked if a club member was erased after it was made. History is bunk.
export function isLocked(save, global = store.global) {
  return !!save && (save.delCount || 0) < (global.deletionCount || 0);
}

export function sessionGet() { try { return JSON.parse(sessionStorage.getItem(KEYS.session)); } catch { return null; } }
export function sessionSet(value) {
  try { value ? sessionStorage.setItem(KEYS.session, JSON.stringify(value)) : sessionStorage.removeItem(KEYS.session); } catch { /* ignore */ }
}

export function wipeAll() {
  try {
    [KEYS.global, KEYS.auto, ...KEYS.slots].forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem(KEYS.session);
  } catch { /* ignore */ }
}
