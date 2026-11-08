// The slogan builder (the poem minigame). Catchiness is scored live.
import { config, CLUB } from '../config.js';
import { store } from '../store.js';
import { el, esc } from '../stage/stage.js';
import { charSrc, phChar, preload } from '../assets.js';
import * as fx from '../stage/fx.js';
import * as audio from '../audio/audio.js';

const DEFAULT_T = { rhythmTarget: [6, 10], rhythmMax: 40, rhymePair: 30, rhymeMax: 60, repeat: 10, comfort: 5, truth: -15, shock: -40 };

// Pure scoring, tested in tests.html. words: tile objects { w, syl, rhyme, tags, shock }.
export function scoreSlogan(words, tuning = {}) {
  const t = { ...DEFAULT_T, ...tuning };
  if (!words.length) return { total: 0, rhythm: 0, rhyme: 0, syl: 0, pairs: 0, shockCount: 0, truthCount: 0, unmeasurable: false };
  const syl = words.reduce((s, w) => s + (w.syl || 1), 0);
  const [lo, hi] = t.rhythmTarget;
  const rhythm = syl >= lo && syl <= hi ? t.rhythmMax : Math.max(0, t.rhythmMax - (syl < lo ? lo - syl : syl - hi) * 8);
  const groups = {};
  for (const w of words) if (w.rhyme) (groups[w.rhyme] ||= new Set()).add(w.w.toLowerCase());
  let pairs = 0;
  for (const g of Object.values(groups)) if (g.size >= 2) pairs += g.size - 1;
  const rhyme = Math.min(t.rhymeMax, pairs * t.rhymePair);
  const counts = {};
  for (const w of words) { const k = w.w.toLowerCase(); counts[k] = (counts[k] || 0) + 1; }
  const rep = Object.values(counts).filter((c) => c >= 2).length * t.repeat;
  let tagScore = 0; let shock = 0;
  for (const w of words) {
    if (w.tags?.includes('comfort')) tagScore += t.comfort;
    if (w.tags?.includes('truth')) tagScore += t.truth;
    if (w.shock) shock += t.shock;
  }
  const unmeasurable = words.some((w) => w.tags?.includes('shakespeare'));
  const total = unmeasurable ? 0 : Math.max(0, Math.min(100, Math.round(rhythm + rhyme + rep + tagScore + shock)));
  return { total, rhythm, rhyme, syl, pairs, shockCount: words.filter((w) => w.shock).length, truthCount: words.filter((w) => w.tags?.includes('truth')).length, unmeasurable };
}

let root = null;

export function open(deck, { present = [] } = {}) {
  return new Promise((resolve) => {
    close();
    const tiles = deck.tiles.map((t, i) => ({ ...t, i }));
    const placed = [];
    const minW = deck.minWords || 3; const maxW = deck.maxWords || 7;
    let shockedOnce = false;

    root = el('div', 'slogan');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Slogan session');
    root.innerHTML = `
      <div class="main">
        <p class="kicker">SLOGAN SESSION · DAY ${esc(store.state?.day ?? 1)}</p>
        <h2>${esc(deck.prompt || '')}</h2>
        <div class="box">
          <div class="slotrow" aria-label="Your slogan"></div>
          <div class="meter"><div class="lbl"><span>CATCHINESS</span><span class="num">0</span></div><div class="bar"><div class="fill" style="width:0%"></div></div><p class="detail"></p></div>
        </div>
        <p class="tray-lbl">YOUR WORDS</p>
        <div class="tray"></div>
      </div>
      <div class="side"><p class="kicker" style="color:var(--ink-2)">THE CIRCLE REACTS</p></div>
      <div class="foot">${deck.tip ? `<p class="tip">${esc(deck.tip)}</p>` : '<span></span>'}<div class="row"><button class="btn clear" type="button">Clear</button><button class="btn primary submit" type="button">Submit slogan</button></div></div>`;
    document.getElementById('ui').appendChild(root);

    const row = root.querySelector('.slotrow');
    const tray = root.querySelector('.tray');
    const side = root.querySelector('.side');
    const submit = root.querySelector('.submit');

    for (const id of present) {
      const ch = config.characters[id] || {};
      const r = el('div', 'react', `<img alt=""><p style="color:${esc(ch.tag || '#4A4852')}">${esc((ch.name || id).toUpperCase())}</p>`);
      preload(charSrc(id, 'neutral'), phChar(id, 'neutral')).then((u) => { r.querySelector('img').src = u; });
      side.appendChild(r);
    }

    const trayBtns = tiles.map((t) => {
      const b = el('button', 'tile', esc(t.w));
      b.type = 'button';
      b.onclick = (ev) => { ev.stopPropagation(); place(t); };
      tray.appendChild(b);
      return b;
    });

    function place(t) {
      if (placed.includes(t) || placed.length >= maxW) return;
      placed.push(t);
      if (t.shock) {
        shockedOnce = true;
        fx.shake(250); fx.flash('#C23B3B', 180); audio.sfx('shock');
        root.classList.add('shocked');
        setTimeout(() => root?.classList.remove('shocked'), 600);
      } else audio.sfx('advance');
      draw();
    }
    function unplace(t) { placed.splice(placed.indexOf(t), 1); draw(); }

    function draw() {
      row.innerHTML = '';
      for (const t of placed) {
        const b = el('button', `tile placed${t.shock ? ' shock' : ''}`, esc(t.w));
        b.type = 'button';
        b.onclick = (ev) => { ev.stopPropagation(); unplace(t); };
        row.appendChild(b);
      }
      for (let k = placed.length; k < Math.max(minW, Math.min(maxW, placed.length + 1)); k++) row.appendChild(el('span', 'slot-empty'));
      trayBtns.forEach((b, k) => b.classList.toggle('used', placed.includes(tiles[k])));
      const s = scoreSlogan(placed, config.tuning.catchiness);
      root.querySelector('.fill').style.width = `${s.total}%`;
      root.querySelector('.num').textContent = s.unmeasurable ? '?' : String(s.total);
      root.querySelector('.detail').textContent = placed.length
        ? (s.unmeasurable ? 'Rhythm: unmeasurable · Rhyme: unmeasurable' : `Rhythm: ${s.syl} beats · Rhyme: ${s.pairs ? `${s.pairs} found` : 'none yet'}`)
        : '';
      submit.disabled = placed.length < minW || placed.length > maxW;
    }

    root.querySelector('.clear').onclick = (ev) => { ev.stopPropagation(); placed.length = 0; draw(); };
    submit.onclick = (ev) => {
      ev.stopPropagation();
      const s = scoreSlogan(placed, config.tuning.catchiness);
      const tags = [...new Set(placed.flatMap((t) => t.tags || []))];
      const result = {
        words: placed.map((t) => t.w), tiles: placed.slice(), catchiness: s.total, tags,
        shockUsed: s.shockCount, hasTruth: s.truthCount > 0, truthCount: s.truthCount,
        shockOffered: tiles.filter((t) => t.shock).length, shockedOnce,
      };
      audio.sfx(s.total >= 60 ? 'chime' : 'choice');
      close();
      resolve(result);
    };
    root._cancel = () => resolve(null);
    draw();
  });
}

export function close() {
  if (!root) return;
  const r = root;
  root = null;
  r.remove();
}
export function cancel() { if (root) { const c = root._cancel; close(); c?.(); } }
export const active = () => !!root;
export const presentMembers = () => CLUB;
