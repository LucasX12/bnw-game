// Backlog of the last 200 lines.
import { el, esc } from '../stage/stage.js';
import { openOverlay } from './overlay.js';

const entries = [];

export function pushLog(entry) {
  entries.push(entry);
  if (entries.length > 200) entries.shift();
}
export function clearLog() { entries.length = 0; }

export function openLog() {
  const p = el('div', 'panel log');
  p.innerHTML = `<h2>Log</h2><div class="entries">${entries.map((e) => `<div class="e">${e.name ? `<b>${esc(e.name)}</b>` : ''}<p>${esc(e.text)}</p></div>`).join('') || '<p>Nothing yet.</p>'}</div>
    <div class="row end"><button class="btn primary" type="button">Close</button></div>`;
  const close = openOverlay(p);
  p.querySelector('.btn').onclick = close;
  const list = p.querySelector('.entries');
  setTimeout(() => { list.scrollTop = list.scrollHeight; }, 0);
}
