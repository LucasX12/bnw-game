// Character layer: show, hide, move, swap expressions, dim non-speakers, dissolve.
import { config } from '../config.js';
import { charSrc, phChar, preload } from '../assets.js';
import * as fx from './fx.js';

// Slots in left-to-right order. A slot names an order on stage, not a fixed spot:
// the actual x depends on how many slots are filled, so the wide anime sprites
// never pile onto each other.
const SLOTS = ['far-left', 'left', 'center', 'right', 'far-right'];
const ALONE = { 'far-left': 200, left: 360, center: 640, right: 920, 'far-right': 1080 };
const SPREAD = { 2: [400, 880], 3: [245, 640, 1035], 4: [200, 493, 787, 1080], 5: [170, 405, 640, 875, 1110] };
const sprites = new Map(); // id -> { img, expr, pos }

function size(id) {
  const h = 640 * (config.characters[id]?.scale || 1);
  return { h, w: h * (1024 / 1536) };
}

// Where each filled slot sits right now.
export function slotX() {
  const filled = SLOTS.filter((p) => [...sprites.values()].some((s) => s.pos === p));
  if (filled.length === 1) return { [filled[0]]: ALONE[filled[0]] };
  const xs = SPREAD[filled.length] || [];
  return Object.fromEntries(filled.map((p, i) => [p, xs[i]]));
}

function layout(ms = 600, skip = null) {
  const at = slotX();
  sprites.forEach((s, id) => {
    const left = `${at[s.pos] - size(id).w / 2}px`;
    if (s.img.style.left === left) return;
    if (id !== skip) s.img.style.transition = `opacity 300ms ease, transform 300ms ease, left ${ms}ms ease, filter 600ms ease`;
    s.img.style.left = left;
  });
}

// One character per slot: whoever already stands there steps off.
function clearSlot(pos, except) {
  const out = [...sprites].filter(([id, s]) => id !== except && s.pos === pos).map(([id]) => id);
  out.forEach((id) => hide(id, 'fade', false));
}

export function show(id, expr = 'neutral', pos) {
  const ch = config.characters[id];
  if (!ch || ch.sprite === false) return;
  if (pos && !SLOTS.includes(pos)) pos = 'center';
  let s = sprites.get(id);
  if (!s) {
    const { h, w } = size(id);
    const img = new Image();
    img.alt = '';
    img.dataset.char = id;
    Object.assign(img.style, { height: `${h}px`, width: `${w}px`, opacity: '0', transform: 'translateY(8px)' });
    document.getElementById('sprites').appendChild(img);
    s = { img, expr, pos: pos || 'center' };
    clearSlot(s.pos, id);
    sprites.set(id, s);
    layout(600, id);
    preload(charSrc(id, expr), phChar(id, expr)).then((url) => {
      img.src = url;
      requestAnimationFrame(() => { img.style.opacity = '1'; img.style.transform = 'none'; });
    });
    return;
  }
  if (pos && pos !== s.pos) move(id, pos);
  if (expr && expr !== s.expr) {
    s.expr = expr;
    preload(charSrc(id, expr), phChar(id, expr)).then((url) => { if (s.expr === expr) s.img.src = url; });
  }
}

export function hide(id, mode = 'fade', relayout = true) {
  const s = sprites.get(id);
  if (!s) return;
  sprites.delete(id);
  if (relayout) layout();
  if (mode === 'cut') { s.img.remove(); return; }
  s.img.style.opacity = '0';
  setTimeout(() => s.img.remove(), 320);
}

export function move(id, pos, ms = 600) {
  const s = sprites.get(id);
  if (!s || !SLOTS.includes(pos)) return;
  clearSlot(pos, id);
  s.pos = pos;
  layout(ms);
}

// The speaker is drawn in front and the others dim slightly.
export function focus(speaker) {
  const has = speaker && sprites.has(speaker);
  sprites.forEach((s, id) => {
    s.img.classList.toggle('dim', !!has && id !== speaker);
    s.img.style.zIndex = has && id === speaker ? '2' : '1';
  });
}

export async function drainAndDissolve(id) {
  const s = sprites.get(id);
  if (!s) return;
  sprites.delete(id);
  s.img.style.transition = 'filter 1000ms linear';
  s.img.style.filter = 'grayscale(1) contrast(.8)';
  await new Promise((r) => setTimeout(r, 1000));
  await fx.dissolve(s.img);
  s.img.remove();
  layout(900);
}

export function clear() { sprites.forEach((s) => s.img.remove()); sprites.clear(); }
export const isVisible = (id) => sprites.has(id);
export const list = () => [...sprites].map(([id, s]) => ({ id, expr: s.expr, pos: s.pos }));
export const images = () => [...sprites.values()].map((s) => s.img);
