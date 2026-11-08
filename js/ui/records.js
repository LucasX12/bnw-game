// Citizen Records: who is active, under review, or transferred.
import { store } from '../store.js';
import { config, CLUB } from '../config.js';
import { el, esc } from '../stage/stage.js';
import { openOverlay } from './overlay.js';

const STATUS = {
  active: ['Active', '#2F6B4F'],
  review: ['Under review', '#B7791F'],
  transferred: ['Transferred', null],
  visiting: ['Visiting', '#8A8D93'],
};

export function open() {
  const g = store.global;
  const p = el('div', 'panel records');
  const rows = [...CLUB, 'you'].map((id) => {
    const ch = config.characters[id] || {};
    const st = g.records[id] || 'active';
    const [label, color] = STATUS[st] || STATUS.active;
    const name = id === 'you' ? (store.state?.player?.name ? `YOU (${store.state.player.name})` : 'YOU') : (ch.record || ch.name || id);
    const dot = color ? `<span class="dot" style="background:${color}"></span>` : '<span class="dot" style="border:1.5px solid #6B6970"></span>';
    return `<div class="rec${st === 'transferred' ? ' gone' : ''}">${dot}<span class="nm">${esc(name)}</span><span class="st">${esc(ch.caste ? `${ch.caste} · ` : '')}${esc(label)}</span></div>`;
  }).join('');
  p.innerHTML = `<h2 style="font-family:var(--ui);font-size:18px;font-weight:700;letter-spacing:.2em;margin:0">CITIZEN RECORDS</h2>
    <p class="motto">COMMUNITY · IDENTITY · STABILITY</p>${rows}
    <div class="row end"><button class="btn primary" type="button">Close</button></div>`;
  const close = openOverlay(p);
  p.querySelector('.btn').onclick = close;
}
