// Visual effects: shake, flash, haze (DOM) and glitch, static, dissolve (canvas).
// Every effect respects the "Reduce flashing and shaking" setting.
import { store } from '../store.js';
import { stageEl, el } from './stage.js';

let canvas; let c2; let raf = null;
const effects = [];
const reduce = () => !!store.global?.settings?.reduceMotion;

export function mount() {
  canvas = document.getElementById('fx');
  c2 = canvas.getContext('2d');
}

export function shake(ms = 400) {
  if (reduce()) return;
  const st = stageEl();
  st.classList.remove('shake');
  void st.offsetWidth;
  st.style.setProperty('--shake-ms', `${ms}ms`);
  st.classList.add('shake');
  setTimeout(() => st.classList.remove('shake'), ms);
}

export function flash(color = '#FFFFFF', ms = 200) {
  const f = document.getElementById('flash');
  f.style.background = color;
  f.style.opacity = reduce() ? '0.3' : '0.85';
  setTimeout(() => { f.style.opacity = '0'; }, ms);
}

export function haze(ms = 900) {
  const h = el('div', 'haze');
  h.style.setProperty('--haze-ms', `${ms}ms`);
  stageEl().appendChild(h);
  setTimeout(() => h.remove(), ms + 50);
}

export function glitch(intensity = 0.5, ms = 600) {
  const i = reduce() ? Math.min(intensity, 0.2) : intensity;
  effects.push({ type: 'glitch', i, until: performance.now() + ms, fps: reduce() ? 8 : 20, last: 0 });
  start();
}

export function staticNoise(ms = 600) {
  effects.push({ type: 'static', until: performance.now() + ms, last: 0, fps: reduce() ? 8 : 30 });
  start();
}

// Draws the sprite onto the canvas and erases it block by block.
export function dissolve(img, ms = 1600) {
  return new Promise((resolve) => {
    const rect = { x: img.offsetLeft, y: img.offsetTop, w: img.offsetWidth, h: img.offsetHeight };
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.round(rect.w)); off.height = Math.max(1, Math.round(rect.h));
    const o = off.getContext('2d');
    o.filter = 'grayscale(1)';
    try { o.drawImage(img, 0, 0, off.width, off.height); } catch { /* not loaded */ }
    img.style.visibility = 'hidden';
    const B = 12;
    const blocks = [];
    for (let y = 0; y < off.height; y += B) for (let x = 0; x < off.width; x += B) blocks.push([x, y]);
    for (let k = blocks.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [blocks[k], blocks[j]] = [blocks[j], blocks[k]]; }
    effects.push({ type: 'dissolve', off, o, rect, blocks, B, t0: performance.now(), ms, resolve, until: Infinity });
    start();
  });
}

function start() { if (!raf) raf = requestAnimationFrame(tick); }

function coverRect(img) {
  const iw = img.naturalWidth || 1280; const ih = img.naturalHeight || 720;
  const s = Math.max(1280 / iw, 720 / ih);
  return { s, ox: (1280 - iw * s) / 2, oy: (720 - ih * s) / 2 };
}

function drawGlitch(e, now) {
  if (now - e.last < 1000 / e.fps) return false;
  e.last = now;
  const bg = document.querySelector('#bg .bg-img.on');
  const slices = 4 + Math.round(e.i * 12);
  if (bg && bg.naturalWidth) {
    const { s, ox, oy } = coverRect(bg);
    for (let k = 0; k < slices; k++) {
      const y = Math.random() * 720; const h = 4 + Math.random() * 30; const dx = (Math.random() * 2 - 1) * e.i * 40;
      try { c2.drawImage(bg, (0 - ox) / s, (y - oy) / s, 1280 / s, h / s, dx, y, 1280, h); } catch { /* ignore */ }
    }
  }
  document.querySelectorAll('#sprites img').forEach((img) => {
    if (!img.naturalWidth || img.style.visibility === 'hidden') return;
    for (let k = 0; k < Math.ceil(slices / 3); k++) {
      const fy = Math.random(); const fh = 0.02 + Math.random() * 0.05;
      const dx = (Math.random() * 2 - 1) * e.i * 50;
      try {
        c2.drawImage(img, 0, fy * img.naturalHeight, img.naturalWidth, fh * img.naturalHeight,
          img.offsetLeft + dx, img.offsetTop + fy * img.offsetHeight, img.offsetWidth, fh * img.offsetHeight);
      } catch { /* ignore */ }
    }
  });
  const colors = ['rgba(224,122,95,.35)', 'rgba(140,199,174,.35)', 'rgba(43,42,51,.4)', 'rgba(201,162,74,.3)'];
  for (let k = 0; k < 2 + Math.round(e.i * 6); k++) {
    c2.fillStyle = colors[k % colors.length];
    c2.fillRect(Math.random() * 1280, Math.random() * 720, 40 + Math.random() * 400 * e.i, 3 + Math.random() * 12);
  }
  return true;
}

let noise = null;
function drawStatic(e, now) {
  if (now - e.last < 1000 / e.fps) return false;
  e.last = now;
  if (!noise) { noise = document.createElement('canvas'); noise.width = 320; noise.height = 180; }
  const n = noise.getContext('2d');
  const d = n.createImageData(320, 180);
  for (let p = 0; p < d.data.length; p += 4) { const v = Math.random() * 255; d.data[p] = v; d.data[p + 1] = v; d.data[p + 2] = v; d.data[p + 3] = 80; }
  n.putImageData(d, 0, 0);
  c2.imageSmoothingEnabled = false;
  c2.drawImage(noise, 0, 0, 1280, 720);
  c2.imageSmoothingEnabled = true;
  return true;
}

function drawDissolve(e, now) {
  const t = Math.min(1, (now - e.t0) / e.ms);
  const target = Math.floor(e.blocks.length * t);
  e.cleared = e.cleared || 0;
  while (e.cleared < target) {
    const [x, y] = e.blocks[e.cleared++];
    e.o.clearRect(x, y, e.B, e.B);
  }
  c2.drawImage(e.off, e.rect.x, e.rect.y, e.rect.w, e.rect.h);
  if (t >= 1) { e.done = true; e.resolve(); }
  return true;
}

function tick(now) {
  raf = null;
  // Glitch and static repaint on their own frame rate, so only clear when something will draw.
  const willDraw = effects.some((e) => e.type === 'dissolve' || now - (e.last || 0) >= 1000 / (e.fps || 60));
  if (willDraw) c2.clearRect(0, 0, 1280, 720);
  for (let k = effects.length - 1; k >= 0; k--) {
    const e = effects[k];
    if (e.type !== 'dissolve' && now > e.until) { effects.splice(k, 1); continue; }
    if (e.type === 'glitch') drawGlitch(e, now);
    else if (e.type === 'static') drawStatic(e, now);
    else if (e.type === 'dissolve') { drawDissolve(e, now); if (e.done) effects.splice(k, 1); }
  }
  if (effects.length) raf = requestAnimationFrame(tick);
  else c2.clearRect(0, 0, 1280, 720);
}
