// ?debug=1 panel. Toggle with the backquote key.
import { config } from './config.js';
import { store, saveGlobal, wipeAll } from './store.js';
import { emit, on } from './bus.js';
import { el, esc } from './stage/stage.js';
import { missing } from './assets.js';
import * as fx from './stage/fx.js';
import * as soma from './ui/soma.js';
import * as refresh from './meta/refresh.js';
import * as skipmash from './meta/skipmash.js';

let panel = null;
let graph = null;
const warnings = [];

export function mount(g) {
  graph = g;
  panel = el('div', 'debug');
  panel.hidden = false;
  document.getElementById('ui').appendChild(panel);
  on('script:warning', (m) => { warnings.push(m); draw(); });
  on('scene:start', draw);
  draw();
  window.__ehnDebug = { config, store, emit };
}

export function toggle() { if (!panel) return; panel.hidden = !panel.hidden; if (!panel.hidden) draw(); }

function draw() {
  if (!panel || panel.hidden) return;
  const targets = [...graph.order.map((s) => [s, `scene ${s}`]), ...Object.keys(graph.labels).map((l) => [l, `  label ${l}`])];
  const s = store.state;
  panel.innerHTML = `
    <h4>DEBUG · press \` to hide</h4>
    <div>[[TODO placeholders left: <b>${graph.todo}</b></div>
    <div>Scene: ${esc(s?.pos?.scene ?? '(title)')} · node ${s?.pos?.node ?? '-'} · act ${s?.act ?? '-'} · day ${s?.day ?? '-'}</div>
    <h4>JUMP</h4>
    <select class="tgt">${targets.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select>
    <button class="go">Go</button>
    <h4>STATE (stats, affinity, flags)</h4>
    <textarea class="json">${s ? esc(JSON.stringify({ stats: s.stats, affinity: s.affinity, flags: s.flags }, null, 1)) : ''}</textarea>
    <button class="apply">Apply</button>
    <h4>EFFECTS</h4>
    ${['shake', 'glitch', 'static', 'flash', 'haze'].map((k) => `<button data-fx="${k}">${k}</button>`).join('')}
    <h4>SOMA</h4>
    ${['hidden', 'on', 'auto', 'off', 'act3'].map((k) => `<button data-soma="${k}">${k}</button>`).join('')}
    <h4>META</h4>
    <button class="refresh">refresh interstitial</button><button class="mash">skip-mash toast</button>
    <h4>RECORDS</h4>
    ${['lenina', 'bernard', 'helmholtz', 'john'].map((id) => `<div>${id}: ${esc(store.global.records[id])} <button data-rec="${id}" data-v="active">active</button><button data-rec="${id}" data-v="transferred">transferred</button></div>`).join('')}
    <div>deletionCount: ${store.global.deletionCount || 0}</div>
    <h4>STORAGE</h4>
    <button class="wipe">Wipe all storage and reload</button>
    <h4>MISSING ASSETS (${missing.size})</h4>
    <div class="warn">${[...missing].slice(0, 40).map(esc).join('<br>') || 'none'}</div>
    <h4>SCRIPT WARNINGS (${graph.warnings.length + warnings.length})</h4>
    <div class="warn">${[...graph.warnings.map((w) => `${w.file}:${w.line} ${w.msg}`), ...warnings].slice(0, 40).map(esc).join('<br>') || 'none'}</div>`;
  panel.querySelector('.go').onclick = () => emit('debug:jump', panel.querySelector('.tgt').value);
  panel.querySelector('.apply').onclick = () => {
    if (!store.state) return;
    try { Object.assign(store.state, JSON.parse(panel.querySelector('.json').value)); draw(); } catch (e) { alert(e.message); }
  };
  panel.querySelectorAll('[data-fx]').forEach((b) => {
    b.onclick = () => ({ shake: () => fx.shake(400), glitch: () => fx.glitch(0.7, 900), static: () => fx.staticNoise(800), flash: () => fx.flash('#C23B3B', 200), haze: () => fx.haze(900) })[b.dataset.fx]();
  });
  panel.querySelectorAll('[data-soma]').forEach((b) => { b.onclick = () => { if (store.state) store.state.soma = b.dataset.soma; soma.setState(b.dataset.soma); }; });
  panel.querySelectorAll('[data-rec]').forEach((b) => {
    b.onclick = () => {
      const g = store.global;
      if (b.dataset.v === 'transferred' && g.records[b.dataset.rec] !== 'transferred') g.deletionCount = (g.deletionCount || 0) + 1;
      g.records[b.dataset.rec] = b.dataset.v;
      saveGlobal(); draw();
    };
  });
  panel.querySelector('.refresh').onclick = () => refresh.interstitial();
  panel.querySelector('.mash').onclick = () => skipmash.trigger();
  panel.querySelector('.wipe').onclick = () => { wipeAll(); location.reload(); };
}
