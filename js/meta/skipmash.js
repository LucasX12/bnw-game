// Mashing or holding skip gets a warning. "A gramme is better than a damn." (p. 55)
import { on } from '../bus.js';
import { config } from '../config.js';
import { el } from '../stage/stage.js';
import * as soma from '../ui/soma.js';

let times = [];
let last = -Infinity;
let holdTimer = null;
let active = false;

export function setActive(v) { active = v; }

const cfg = () => ({ advances: 8, windowMs: 2000, holdMs: 10000, cooldownMs: 30000, ...(config.tuning.skipMash || {}) });

export function mount() {
  on('input:advance', () => {
    if (!active) return;
    const now = performance.now();
    const c = cfg();
    times.push(now);
    times = times.filter((t) => now - t <= c.windowMs);
    if (times.length >= c.advances) { times = []; trigger(); }
  });
  const onHold = (held) => {
    clearTimeout(holdTimer);
    if (held && active) holdTimer = setTimeout(trigger, cfg().holdMs);
  };
  on('skip:held', onHold);
  on('dialogue:modes', ({ skipping }) => onHold(skipping));
}

export function trigger() {
  const now = performance.now();
  if (now - last < cfg().cooldownMs) return;
  last = now;
  toast('A gramme is better than a damn.');
  soma.glow(4000);
}

export function toast(text) {
  const t = el('div', 'toast');
  t.textContent = text;
  t.setAttribute('role', 'status');
  document.getElementById('stage').appendChild(t);
  setTimeout(() => t.remove(), 3300);
}
