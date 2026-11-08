// Title screen, name entry, pause menu, save and load.
import { store, anySave, readSlot, saveSlot, isLocked } from '../store.js';
import { config } from '../config.js';
import { emit } from '../bus.js';
import { el, esc } from '../stage/stage.js';
import { openOverlay, closeAll } from './overlay.js';
import { bgSrc, phBg, charSrc, phChar, preload } from '../assets.js';
import * as records from './records.js';
import * as settings from './settings.js';

let titleEl = null;

export function showTitle() {
  hideTitle();
  const g = store.global;
  titleEl = el('div', 'title');
  titleEl.innerHTML = `<img class="bgimg" alt=""><div class="busts"></div>
    <div class="copy">
      <p class="kicker">THE COLLEGE OF EMOTIONAL ENGINEERING PRESENTS</p>
      <h1><span class="a">Everybody's</span><span class="b">Happy Now</span></h1>
      <p class="sub">A visual novel after Aldous Huxley's <em>Brave New World</em></p>
      ${g.resetSeen ? '<p class="reset-line">Everybody\'s happy now.</p>' : ''}
      <nav aria-label="Main menu"></nav>
    </div>
    <p class="motto">COMMUNITY · IDENTITY · STABILITY</p>`;
  document.getElementById('ui').appendChild(titleEl);

  const bgId = g.resetSeen ? 'title_reset' : 'title';
  preload(bgSrc(bgId), phBg(bgId)).then((u) => { if (titleEl) titleEl.querySelector('.bgimg').src = u; });

  // Club portraits on the right. Erased members are gone; after a reset only Lenina remains.
  const layout = [['helmholtz', 600, 430], ['bernard', 1000, 400], ['lenina', 770, 470]];
  const busts = titleEl.querySelector('.busts');
  for (const [id, left, h] of layout) {
    if (g.resetSeen && id !== 'lenina') continue;
    if (g.records[id] === 'transferred') continue;
    const img = new Image();
    img.alt = '';
    Object.assign(img.style, { left: `${left}px`, height: `${h}px`, width: `${h * (1024 / 1536)}px`, bottom: '0' });
    preload(charSrc(id, 'neutral'), phChar(id, 'neutral')).then((u) => { img.src = u; });
    busts.appendChild(img);
  }

  const nav = titleEl.querySelector('nav');
  const auto = readSlot('auto');
  const items = [
    ['New game', 'primary', () => newGame()],
    ['Continue', '', () => { if (auto) emit('game:load', auto); }, !auto || isLocked(auto)],
    ['Load', '', () => openSaveLoad('load'), !anySave()],
    ['Citizen records', '', () => records.open()],
    ['Settings', '', () => settings.open()],
  ];
  for (const [label, cls, fn, disabled] of items) {
    const b = el('button', cls, esc(label));
    b.type = 'button';
    if (disabled) b.disabled = true;
    b.onclick = (ev) => { ev.stopPropagation(); fn(); };
    nav.appendChild(b);
  }
  setTimeout(() => nav.querySelector('button')?.focus(), 50);
}

export function hideTitle() { titleEl?.remove(); titleEl = null; }
export const titleShown = () => !!titleEl;

async function newGame() {
  if (anySave()) {
    const ok = await confirmBox('Start a new game?', 'Your autosave will be replaced. Manual saves are kept.', 'Start');
    if (!ok) return;
  }
  const name = await nameEntry();
  if (name) emit('game:new', name);
}

export function confirmBox(title, body, yes = 'Yes', no = 'Back') {
  return new Promise((resolve) => {
    const p = el('div', 'panel', `<h2>${esc(title)}</h2><p>${esc(body)}</p><div class="row end"><button class="btn no" type="button">${esc(no)}</button><button class="btn primary yes" type="button">${esc(yes)}</button></div>`);
    let answered = false;
    const close = openOverlay(p, { onClose: () => { if (!answered) resolve(false); } });
    p.querySelector('.yes').onclick = () => { answered = true; close(); resolve(true); };
    p.querySelector('.no').onclick = () => { answered = true; close(); resolve(false); };
  });
}

export function nameEntry() {
  return new Promise((resolve) => {
    const castes = ['Alpha-Plus', 'Alpha', 'Beta-Plus', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    const p = el('div', 'panel form');
    p.innerHTML = `<h2>Confirm your name and caste.</h2>
      <label class="f" for="pname">NAME</label><input id="pname" type="text" maxlength="16" autocomplete="off" spellcheck="false" autofocus>
      <p class="f" style="font-size:13px;font-weight:600;letter-spacing:.2em;color:var(--ink-2);margin:18px 0 8px">CASTE</p>
      <div class="castes" role="radiogroup" aria-label="Caste">${castes.map((c) => `<label class="${c === 'Beta-Plus' ? '' : 'off'}"><input type="radio" name="caste" value="${c}" ${c === 'Beta-Plus' ? 'checked' : 'disabled'}> ${c}</label>`).join('')}</div>
      <p class="err" aria-live="polite"></p>
      <div class="row end"><button class="btn back" type="button">Back</button><button class="btn primary go" type="button">Confirm</button></div>`;
    let done = false;
    const close = openOverlay(p, { onClose: () => { if (!done) resolve(null); } });
    const input = p.querySelector('#pname');
    const err = p.querySelector('.err');
    const go = () => {
      const v = input.value.trim().replace(/\s+/g, ' ');
      if (!/^[A-Za-z][A-Za-z '\-]{0,15}$/.test(v)) { err.textContent = 'Letters, spaces and hyphens only, 1 to 16 characters.'; input.focus(); return; }
      done = true; close(); resolve(v);
    };
    p.querySelector('.go').onclick = go;
    p.querySelector('.back').onclick = () => close();
    input.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); go(); } if (e.key === 'Escape') close(); });
  });
}

export function pauseMenu(handlers) {
  const p = el('div', 'panel stack');
  p.style.minWidth = '360px';
  p.innerHTML = '<h2>Paused</h2>';
  for (const [label, fn] of [['Resume', null], ['Save', () => openSaveLoad('save')], ['Load', () => openSaveLoad('load')], ['Citizen records', () => records.open()], ['Settings', () => settings.open()], ['Title screen', handlers.title]]) {
    const b = el('button', label === 'Resume' ? 'btn primary' : 'btn', esc(label));
    b.type = 'button';
    b.onclick = () => { close(); fn?.(); };
    p.appendChild(b);
  }
  const close = openOverlay(p);
}

export function openSaveLoad(mode) {
  const p = el('div', 'panel', `<h2>${mode === 'save' ? 'Save' : 'Load'}</h2><div class="slots-list"></div><div class="row end"><button class="btn primary" type="button">Close</button></div>`);
  const close = openOverlay(p);
  p.querySelector('.row .btn').onclick = close;
  const list = p.querySelector('.slots-list');
  const draw = () => {
    list.innerHTML = '';
    for (const slot of (mode === 'save' ? [1, 2, 3] : ['auto', 1, 2, 3])) {
      const s = readSlot(slot);
      const locked = mode === 'load' && isLocked(s);
      const b = el('button', 'slot');
      b.type = 'button';
      const when = s?.savedAt ? new Date(s.savedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';
      b.innerHTML = `<img alt=""><span class="meta"><b>${slot === 'auto' ? 'Autosave' : `Slot ${slot}`}</b><span>${s ? `Act ${s.act} · Day ${s.day} · ${esc(when)}` : 'Empty'}</span>${locked ? '<span class="locked">History is bunk.</span>' : ''}</span>`;
      if (s?.stage?.bg) preload(bgSrc(s.stage.bg), phBg(s.stage.bg)).then((u) => { b.querySelector('img').src = u; });
      if (mode === 'load' && (!s || locked)) b.disabled = true;
      b.onclick = () => {
        if (mode === 'save') { saveSlot(slot); draw(); return; }
        closeAll();
        emit('game:load', s);
      };
      list.appendChild(b);
    }
  };
  draw();
}

export const hasControllerMode = () => !!config.controllerMode;
