// Act 3: Mond drops the visual novel frame. Black screen, monospace, a stats panel.
import { el, esc, setStageClass } from '../stage/stage.js';

let root; let tlog; let stats;

export function mount(ui) {
  root = el('div', 'terminal', '<p class="head">MOND, Mustapha · Resident Controller for Western Europe</p><div class="tlog" aria-live="polite"></div><section class="term-stats" aria-label="Your file" hidden></section>');
  root.hidden = true;
  tlog = root.querySelector('.tlog');
  stats = root.querySelector('.term-stats');
  ui.appendChild(root);
}

export function enter() { root.hidden = false; setStageClass('terminal', true); tlog.innerHTML = ''; }
export function exit() { root.hidden = true; setStageClass('terminal', false); hideStats(); tlog.innerHTML = ''; }
export const active = () => root && !root.hidden;

export function newLine(speaker, name) {
  tlog.querySelectorAll('p').forEach((p) => p.classList.add('old'));
  tlog.querySelector('.cursor')?.remove();
  const p = el('p', null, speaker && speaker !== 'mond' && name ? `<span class="who">${esc(name)}</span>` : '');
  const span = el('span');
  p.append(span, el('span', 'cursor'));
  tlog.appendChild(p);
  while (tlog.children.length > 5) tlog.firstChild.remove();
  return { set: (t) => { span.textContent = t; } };
}

export function showStats(v) {
  const row = (k, val) => `<div class="r"><span>${esc(k)}</span><span>${esc(val)}</span></div>`;
  stats.innerHTML = `<h3>YOUR FILE</h3>${row('Soma presses', v.soma)}${row('Lines skipped', v.skips)}${row('Page refreshes', v.refreshes)}${row('Shock words avoided', v.shock)}${row('Truth', v.truth)}${row('Local time', v.time)}`;
  stats.hidden = false;
}
export function hideStats() { if (stats) stats.hidden = true; }
