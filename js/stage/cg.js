// Full-screen event illustrations (CGs). They sit above the characters and below the interface.
import { cgSrc, phBg, preload } from '../assets.js';

let layer; let img; let current = null; let token = 0;

export function mount() {
  layer = document.getElementById('cg');
  img = layer.querySelector('.cg-img');
}

export function show(id, ms = 700) {
  current = id;
  const my = ++token;
  preload(cgSrc(id), phBg(id)).then((url) => {
    if (my !== token) return;
    layer.style.setProperty('--cg-ms', `${ms}ms`);
    if (layer.classList.contains('on')) {
      // Crossfade between two CGs: dip, swap, return.
      layer.classList.remove('on');
      setTimeout(() => { if (my === token) { img.src = url; layer.classList.add('on'); } }, Math.min(ms, 400));
    } else {
      img.src = url;
      requestAnimationFrame(() => layer.classList.add('on'));
    }
  });
}

export function hide(ms = 700) {
  token++;
  current = null;
  layer.style.setProperty('--cg-ms', `${ms}ms`);
  layer.classList.remove('on');
}

export function clear() { hide(0); }
export const currentId = () => current;
