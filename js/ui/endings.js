// Ending card, then a credits roll, then back to the title.
import { config } from '../config.js';
import { el, esc } from '../stage/stage.js';
import * as audio from '../audio/audio.js';

const NAMES = { stability: 'Stability', island: 'Island', unhappy: 'The Right to Be Unhappy', citizen: 'Perfect Citizen' };

export function show(id) {
  return new Promise((resolve) => {
    const ui = document.getElementById('ui');
    audio.stopMusic(1200);
    audio.sfx('ending_stinger', 'music');
    const card = el('div', 'ending', `<h2>${esc(NAMES[id] || id)}</h2><p>Ending reached</p><button class="btn primary" type="button">Continue</button>`);
    ui.appendChild(card);
    const btn = card.querySelector('button');
    setTimeout(() => btn.focus(), 50);
    btn.onclick = (ev) => { ev.stopPropagation(); card.remove(); credits(resolve); };
  });
}

function credits(done) {
  const ui = document.getElementById('ui');
  const lines = config.credits.lines || [];
  const c = el('div', 'credits', `<div class="roll">${lines.map((l, i) => `<p class="${i === 0 ? 'big' : ''}">${esc(l)}</p>`).join('')}</div>`);
  c.setAttribute('role', 'button');
  c.setAttribute('tabindex', '0');
  c.setAttribute('aria-label', 'Credits. Click to return to the title screen.');
  ui.appendChild(c);
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    c.remove();
    window.removeEventListener('keydown', onKey, true);
    done();
  };
  const onKey = (e) => { if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); finish(); } };
  window.addEventListener('keydown', onKey, true);
  c.onclick = (ev) => { ev.stopPropagation(); finish(); };
  c.querySelector('.roll').addEventListener('animationend', finish);
  c.focus();
}
