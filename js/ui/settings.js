// Settings. The Conditioning slider is fixed at 100% and never explained.
import { store, saveGlobal } from '../store.js';
import { emit } from '../bus.js';
import { el } from '../stage/stage.js';
import { openOverlay } from './overlay.js';

export function open() {
  const s = store.global.settings;
  const p = el('div', 'panel settings');
  const range = (key, label, min, max, step, val, fmt) => `<div class="s"><label for="set-${key}">${label}</label><input id="set-${key}" data-k="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${val}"><span class="v" data-v="${key}">${fmt(val)}</span></div>`;
  const pct = (v) => `${Math.round(v)}%`;
  p.innerHTML = `<h2>Settings</h2>
    ${range('textSpeed', 'Text speed', 10, 100, 5, s.textSpeed, (v) => v)}
    ${range('music', 'Music', 0, 100, 5, s.music * 100, pct)}
    ${range('sfx', 'Sound effects', 0, 100, 5, s.sfx * 100, pct)}
    ${range('voice', 'Voices', 0, 100, 5, s.voice * 100, pct)}
    <div class="s"><label for="set-skip">Skip</label><select id="set-skip"><option value="read"${s.skipMode === 'read' ? ' selected' : ''}>Read lines only</option><option value="all"${s.skipMode === 'all' ? ' selected' : ''}>All lines</option></select><span></span></div>
    <div class="s"><label for="set-rm">Reduce flashing and shaking</label><input id="set-rm" type="checkbox"${s.reduceMotion ? ' checked' : ''}><span></span></div>
    <div class="s off"><label for="set-cond">Conditioning</label><input id="set-cond" type="range" min="0" max="100" value="100" disabled><span>100%</span></div>
    <div class="row end"><button class="btn primary" type="button">Done</button></div>`;
  const close = openOverlay(p);
  p.querySelectorAll('input[type=range][data-k]').forEach((inp) => {
    inp.oninput = () => {
      const k = inp.dataset.k;
      const v = Number(inp.value);
      s[k] = k === 'textSpeed' ? v : v / 100;
      p.querySelector(`[data-v="${k}"]`).textContent = k === 'textSpeed' ? v : pct(v);
      emit('settings:changed', { key: k, value: s[k] });
    };
    inp.onchange = saveGlobal;
  });
  p.querySelector('#set-skip').onchange = (e) => { s.skipMode = e.target.value; saveGlobal(); emit('settings:changed', { key: 'skipMode', value: s.skipMode }); };
  p.querySelector('#set-rm').onchange = (e) => { s.reduceMotion = e.target.checked; saveGlobal(); emit('settings:changed', { key: 'reduceMotion', value: s.reduceMotion }); };
  p.querySelector('.btn').onclick = () => { saveGlobal(); close(); };
}
