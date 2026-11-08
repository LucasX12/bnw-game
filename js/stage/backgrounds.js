// Background layer: two stacked images for crossfades.
import { bgSrc, hasBg, phBg, preload } from '../assets.js';

let imgs = [];
let front = 0;
let current = null;
let token = 0;

export function mount() { imgs = [...document.querySelectorAll('#bg .bg-img')]; }

export function set(id, { mode = 'fade', ms } = {}) {
  if (!id) return;
  let realId = id;
  if (mode === 'drain' && hasBg(`${id}_drained`)) realId = `${id}_drained`;
  const dur = mode === 'cut' ? 0 : (ms || (mode === 'drain' ? 1400 : 500));
  current = realId;
  const my = ++token;
  preload(bgSrc(realId), phBg(realId)).then((url) => {
    if (my !== token) return;
    const back = imgs[1 - front]; const fr = imgs[front];
    document.getElementById('bg').style.setProperty('--fade-ms', `${dur}ms`);
    back.src = url;
    requestAnimationFrame(() => {
      back.classList.add('on');
      fr.classList.remove('on');
      front = 1 - front;
    });
  });
}

export function clear() {
  token++;
  current = null;
  imgs.forEach((i) => { i.classList.remove('on'); i.removeAttribute('src'); });
}

export const currentImg = () => imgs[front];
export const currentId = () => current;
