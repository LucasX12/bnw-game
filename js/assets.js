// Asset manifest, image loading with fallbacks, and placeholder art.
// The game must look intentional before the real art arrives.
import { config } from './config.js';

let manifest = { characters: {}, backgrounds: {}, cg: {}, music: {}, sfx: {}, voice: {}, ui: {} };
export const missing = new Set();

export async function loadManifest() {
  try {
    const r = await fetch('assets/manifest.json');
    if (r.ok) manifest = { ...manifest, ...(await r.json()) };
  } catch { /* placeholders everywhere */ }
  return manifest;
}
export const getManifest = () => manifest;

const path = (p) => (p ? `assets/${p}` : null);
export const charSrc = (id, expr) => path(manifest.characters?.[id]?.[expr]);
export const bgSrc = (id) => path(manifest.backgrounds?.[id]);
export const hasBg = (id) => !!manifest.backgrounds?.[id];
export const cgSrc = (id) => path(manifest.cg?.[id]);
export const audioSrc = (kind, id) => path(manifest[kind]?.[id]);

// Loads src into img, falling back to placeholder if it fails. Resolves when something is showing.
export function loadInto(img, src, placeholder) {
  return new Promise((resolve) => {
    const done = () => { img.onload = null; img.onerror = null; resolve(); };
    img.onload = done;
    img.onerror = () => {
      if (src && img.getAttribute('src') !== placeholder) {
        missing.add(src);
        img.src = placeholder;
      } else done();
    };
    if (!src) missing.add('(not in manifest)');
    img.src = src || placeholder;
  });
}

// Preloads an image URL; resolves to the URL that worked.
export function preload(src, placeholder) {
  return new Promise((resolve) => {
    if (!src) { resolve(placeholder); return; }
    const im = new Image();
    im.onload = () => resolve(src);
    im.onerror = () => { missing.add(src); resolve(placeholder); };
    im.src = src;
  });
}

const svg = (w, h, body) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`,
)}`;

const MOUTHS = {
  neutral: '<path d="M462 520 L562 520" stroke="#2B2A33" stroke-width="10" stroke-linecap="round"/>',
  happy: '<path d="M447 505 Q512 565 577 505" stroke="#2B2A33" stroke-width="10" fill="none" stroke-linecap="round"/>',
  worried: '<path d="M457 525 Q482 505 512 525 Q542 545 567 525" stroke="#2B2A33" stroke-width="10" fill="none" stroke-linecap="round"/>',
  upset: '<path d="M457 535 Q512 490 567 535" stroke="#2B2A33" stroke-width="10" fill="none" stroke-linecap="round"/>',
  special: '<path d="M422 500 Q512 600 602 500" stroke="#2B2A33" stroke-width="10" fill="#FBF7EE" stroke-linecap="round"/>',
  smile: '<path d="M462 515 Q512 545 562 515" stroke="#2B2A33" stroke-width="10" fill="none" stroke-linecap="round"/>',
  cold: '<path d="M467 525 L557 525" stroke="#2B2A33" stroke-width="6" stroke-linecap="round"/>',
};

export function phChar(id, expr) {
  const ch = config.characters[id] || {};
  const tag = ch.tag || '#7E8189';
  const name = (ch.name || id).toUpperCase();
  if (id === 'helmholtz' && expr === 'special') {
    return svg(1024, 1536, `<g fill="none" stroke="#8E9096" stroke-width="8" stroke-dasharray="26 22"><ellipse cx="512" cy="430" rx="190" ry="235"/><path d="M60 1536 C60 1180 260 1060 512 1060 C764 1060 964 1180 964 1536"/></g>`);
  }
  return svg(1024, 1536, `
    <path d="M90 1536 C90 1170 290 1050 512 1050 C734 1050 934 1170 934 1536 Z" fill="${tag}"/>
    <path d="M412 1050 L512 1180 L612 1050 Z" fill="#FBF7EE"/>
    <rect x="452" y="820" width="120" height="250" rx="40" fill="#E3BC9A"/>
    <ellipse cx="512" cy="430" rx="190" ry="235" fill="#EFCFB2"/>
    <path d="M322 400 C322 230 410 180 512 180 C620 180 702 230 702 390 C640 300 560 280 512 280 C440 280 370 320 322 400 Z" fill="#4A3C35"/>
    <circle cx="440" cy="440" r="16" fill="#2B2A33"/><circle cx="584" cy="440" r="16" fill="#2B2A33"/>
    ${MOUTHS[expr] || MOUTHS.neutral}
    <text x="512" y="1400" text-anchor="middle" font-family="Josefin Sans, sans-serif" font-size="58" font-weight="700" letter-spacing="12" fill="#FFFFFF">${name}</text>
    <text x="512" y="1470" text-anchor="middle" font-family="Josefin Sans, sans-serif" font-size="38" letter-spacing="8" fill="#FFFFFF" opacity=".8">${expr.toUpperCase()}</text>`);
}

const BG_LOOKS = {
  title: ['#F4EDDC', '#CFE6D8'],
  title_reset: ['#E4E6E2', '#C9D5CF'],
  classroom_bright: ['#CFE6D8', '#E9DCC2'],
  classroom_drained: ['#D8D9D4', '#DCD6CA'],
  hallway: ['#F4EDDC', '#E9DCC2'],
  roof: ['#F6D6C2', '#C9CDD6'],
  dorm_night: ['#1B2340', '#141A30'],
  mond_office: ['#2E2B2B', '#1E1C1C'],
  island_shore: ['#DCE6EA', '#6F8A86'],
  lighthouse: ['#DADDE2', '#8E8A6B'],
};

export function phBg(id) {
  const base = id.replace(/_drained$/, '');
  const [top, floor] = BG_LOOKS[id] || BG_LOOKS[base] || ['#E9E4D8', '#D6CFBE'];
  const dark = ['dorm_night', 'mond_office'].includes(base);
  const label = dark ? '#8C8C94' : '#8A7E62';
  let extra = '';
  if (base === 'lighthouse') extra = '<path d="M740 760 L800 300 L860 300 L920 760 Z" fill="#F4F2EE"/><rect x="790" y="250" width="80" height="60" fill="#3A393F"/>';
  if (base === 'island_shore') extra = '<rect x="0" y="560" width="1536" height="160" fill="#8FA7A2"/>';
  if (base.startsWith('classroom')) extra = '<path d="M180 620 L180 280 A110 110 0 0 1 400 280 L400 620 Z" fill="#EAF3F6" stroke="#C9A24A" stroke-width="8"/><path d="M1136 620 L1136 280 A110 110 0 0 1 1356 280 L1356 620 Z" fill="#EAF3F6" stroke="#C9A24A" stroke-width="8"/>';
  return svg(1536, 1024, `
    <rect width="1536" height="1024" fill="${top}"/>
    <rect y="720" width="1536" height="304" fill="${floor}"/>
    <rect y="704" width="1536" height="16" fill="#C9A24A" opacity="${dark ? 0.35 : 0.8}"/>
    ${extra}
    <g stroke="#C9A24A" stroke-width="3" opacity="${dark ? 0.25 : 0.5}">
      <line x1="768" y1="80" x2="768" y2="150"/><line x1="700" y1="115" x2="836" y2="115"/>
    </g>
    <text x="768" y="980" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="30" fill="${label}">${id}</text>`);
}
