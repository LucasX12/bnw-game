// Character layer: show, hide, move, swap expressions, dim non-speakers, dissolve.
import { config } from '../config.js';
import { charSrc, phChar, preload } from '../assets.js';
import * as fx from './fx.js';

const X = { 'far-left': 200, left: 360, center: 640, right: 920, 'far-right': 1080 };
const sprites = new Map(); // id -> { img, expr, pos }

function size(id) {
  const h = 640 * (config.characters[id]?.scale || 1);
  return { h, w: h * (1024 / 1536) };
}

export function show(id, expr = 'neutral', pos) {
  const ch = config.characters[id];
  if (!ch || ch.sprite === false) return;
  let s = sprites.get(id);
  if (!s) {
    const { h, w } = size(id);
    const img = new Image();
    img.alt = '';
    img.dataset.char = id;
    Object.assign(img.style, { height: `${h}px`, width: `${w}px`, left: `${(X[pos || 'center'] ?? 640) - w / 2}px`, opacity: '0', transform: 'translateY(8px)' });
    document.getElementById('sprites').appendChild(img);
    s = { img, expr, pos: pos || 'center' };
    sprites.set(id, s);
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

export function hide(id, mode = 'fade') {
  const s = sprites.get(id);
  if (!s) return;
  sprites.delete(id);
  if (mode === 'cut') { s.img.remove(); return; }
  s.img.style.opacity = '0';
  setTimeout(() => s.img.remove(), 320);
}

export function move(id, pos, ms = 600) {
  const s = sprites.get(id);
  if (!s || X[pos] == null) return;
  const { w } = size(id);
  s.img.style.transition = `opacity 300ms ease, transform 300ms ease, left ${ms}ms ease, filter 600ms ease`;
  s.img.style.left = `${X[pos] - w / 2}px`;
  s.pos = pos;
}

export function focus(speaker) {
  const has = speaker && sprites.has(speaker);
  sprites.forEach((s, id) => s.img.classList.toggle('dim', !!has && id !== speaker));
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
}

export function clear() { sprites.forEach((s) => s.img.remove()); sprites.clear(); }
export const isVisible = (id) => sprites.has(id);
export const list = () => [...sprites].map(([id, s]) => ({ id, expr: s.expr, pos: s.pos }));
export const images = () => [...sprites.values()].map((s) => s.img);
