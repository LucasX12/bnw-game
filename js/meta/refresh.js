// Refreshing the page to escape a scene is noticed. "Ending is better than mending." (p. 49)
import { sessionGet } from '../store.js';
import { el, sleep } from '../stage/stage.js';

// Pure check, tested in tests.html: was this load a reload while a scene was running?
export function wasRefreshedMidScene(navType, session) {
  return navType === 'reload' && !!session && !!session.scene;
}

export function navType() {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) return nav.type;
  } catch { /* old browser */ }
  return performance.navigation?.type === 1 ? 'reload' : 'navigate';
}

export function detect() {
  const s = sessionGet();
  return wasRefreshedMidScene(navType(), s) ? s : null;
}

export async function interstitial(ms = 2500) {
  const box = el('div', 'interstitial', '<p>Ending is better than mending.</p>');
  document.getElementById('ui').appendChild(box);
  await sleep(ms);
  box.remove();
}
