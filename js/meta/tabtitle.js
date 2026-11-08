// The tab title changes when the player looks away.
import { store } from '../store.js';

const DEFAULT = "Everybody's Happy Now";
let override = null;
let inGame = false;
let timer = null;

export function setInGame(v) { inGame = v; apply(); }
export function setTitle(text) { override = text || null; apply(); }

function apply() { document.title = (inGame && override) || DEFAULT; }

document.addEventListener('visibilitychange', () => {
  clearTimeout(timer);
  const st = store.state;
  if (!inGame || !st) return;
  if (document.hidden) {
    document.title = st.act === 3 ? st.player.name : 'COMMUNITY · IDENTITY · STABILITY';
  } else {
    timer = setTimeout(() => { document.title = st.act === 2 ? "Everybody's happy now?" : (override || DEFAULT); }, 1000);
  }
});
