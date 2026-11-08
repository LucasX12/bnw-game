// The soma button: the design centrepiece. Never desaturated.
// States: hidden, on, auto (presses itself on sad lines unless you say No), off (gone), act3.
import { emit, on } from '../bus.js';
import { store } from '../store.js';
import { config } from '../config.js';
import { el } from '../stage/stage.js';

let wrap; let btn; let gap; let cap; let dose;
let state = 'hidden';
let blocked = false; // scene tag nosoma, interludes, menus
let uiVisible = false;
let countdown = null;

export function mount(ui) {
  wrap = el('div', 'soma-wrap');
  btn = el('button', 'soma', '<b>SOMA</b><span>½ gramme</span>');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Take soma and skip this scene');
  btn.onclick = (ev) => { ev.stopPropagation(); press(false); };
  gap = el('div', 'soma-gap');
  gap.setAttribute('aria-hidden', 'true');
  cap = el('p', 'soma-cap', 'still here');
  dose = el('div', 'dose');
  dose.hidden = true;
  wrap.append(btn, gap, cap, dose);
  ui.appendChild(wrap);
  on('line:typed', onTyped);
  on('mode:changed', (m) => { blocked = m === 'interlude' || m === 'terminal-off'; render(); });
  render();
}

function render() {
  if (!wrap) return;
  const show = uiVisible && !blocked && state !== 'hidden';
  wrap.hidden = !show;
  btn.hidden = state === 'off';
  gap.hidden = state !== 'off';
  cap.hidden = state !== 'act3';
  wrap.classList.toggle('act3', state === 'act3');
}

export function setState(s) { state = s; cancelDose(); render(); }
export function setBlocked(b) { blocked = b; if (b) cancelDose(); render(); }
export function setVisible(v) { uiVisible = v; if (!v) cancelDose(); render(); }
export const getState = () => state;
const pressable = () => uiVisible && !blocked && ['on', 'auto', 'act3'].includes(state);

function press(auto) {
  if (!pressable()) return;
  cancelDose();
  btn.classList.remove('glow');
  emit('soma:request', { auto });
}

export function glow(ms = 4000) {
  if (!pressable()) return;
  btn.classList.add('glow');
  setTimeout(() => btn.classList.remove('glow'), ms);
}

function onTyped({ tags }) {
  if (state !== 'auto' || !pressable() || countdown) return;
  const sad = tags?.sad || store.state?.sceneTags?.includes('sad');
  if (sad) startDose();
}

function startDose() {
  let n = Math.max(1, Math.round(config.tuning.autoDoseSeconds || 2));
  dose.innerHTML = '';
  const label = el('p', null, `AUTO-DOSE IN ${n}`);
  const no = el('button', null, 'No');
  no.type = 'button';
  no.onclick = (ev) => {
    ev.stopPropagation();
    store.state.flags.refusedDoses = (store.state.flags.refusedDoses || 0) + 1;
    cancelDose();
  };
  dose.append(label, no);
  dose.hidden = false;
  countdown = setInterval(() => {
    n -= 1;
    if (n <= 0) { cancelDose(); press(true); return; }
    label.textContent = `AUTO-DOSE IN ${n}`;
  }, 1000);
}

export function cancelDose() {
  clearInterval(countdown);
  countdown = null;
  if (dose) dose.hidden = true;
}
