// Text box, whispers and terminal lines: typewriter, advance, auto, skip.
import { store } from '../store.js';
import { emit } from '../bus.js';
import { el, esc } from '../stage/stage.js';
import { pushLog } from './log.js';
import * as terminal from './terminal.js';
import * as audio from '../audio/audio.js';

let box; let tagEl; let lineEl; let whisperEl; let whisperText;
let cur = null;
let auto = false; let skipping = false; let ctrlHeld = false; let skipAllowed = true; let sceneNoSkip = false;
const BLOCKS = '█▓▒░';

export function mount(ui) {
  box = el('div', 'textbox hidden', '<p class="nametag none"></p><p class="line" aria-live="polite"></p><span class="more" aria-hidden="true"></span>');
  tagEl = box.querySelector('.nametag');
  lineEl = box.querySelector('.line');
  whisperEl = el('div', 'whisper', '<p aria-live="polite"></p>');
  whisperEl.hidden = true;
  whisperText = whisperEl.querySelector('p');
  ui.append(whisperEl, box);
}

export function hideBox() { box.classList.add('hidden'); whisperEl.hidden = true; }

const settings = () => store.global.settings;

function canSkip() {
  if (!cur) return false;
  const t = cur.opts.tags || {};
  return skipAllowed && !sceneNoSkip && !t.noskip && (cur.opts.read || settings().skipMode === 'all');
}
const wantsSkip = () => (skipping || ctrlHeld) && canSkip();

function render(text) {
  if (!cur) return;
  if (cur.target === 'box') lineEl.textContent = text;
  else if (cur.target === 'whisper') whisperText.textContent = text;
  else cur.tline.set(text);
}

export function say(opts) {
  return new Promise((resolve) => {
    if (cur) resolveCur({ cancelled: true });
    const target = opts.mode === 'terminal' ? 'terminal' : (opts.speaker === 'voice' ? 'whisper' : 'box');
    cur = { resolve, opts, full: opts.text, target, typing: true, i: 0, timer: null, autoTimer: null };
    pushLog({ name: opts.name || '', text: opts.text });

    if (target === 'box') {
      whisperEl.hidden = true;
      box.classList.remove('hidden', 'done');
      box.style.setProperty('--tag', opts.tag || 'var(--ink-2)');
      if (opts.name) { tagEl.className = 'nametag'; tagEl.innerHTML = `${esc(opts.name)}${opts.caste ? ` <small>${esc(opts.caste)}</small>` : ''}`; } else tagEl.className = 'nametag none';
    } else if (target === 'whisper') {
      box.classList.add('hidden'); whisperEl.hidden = false;
    } else {
      box.classList.add('hidden'); whisperEl.hidden = true;
      cur.tline = terminal.newLine(opts.speaker, opts.name);
    }
    render('');

    if (wantsSkip()) { finishTyping(true); return; }
    if (skipping && !canSkip()) setSkip(false);
    startTyping();
  });
}

function startTyping() {
  const c = cur;
  const cps = Math.max(5, settings().textSpeed || 40);
  const corrupt = c.opts.tags?.corrupt || 0;
  const typeSfx = c.target === 'terminal';
  c.timer = setInterval(() => {
    if (cur !== c) { clearInterval(c.timer); return; }
    c.i++;
    let shown = c.full.slice(0, c.i);
    if (corrupt) shown = [...shown].map((ch) => (ch !== ' ' && Math.random() < corrupt ? BLOCKS[Math.floor(Math.random() * 4)] : ch)).join('');
    render(shown);
    if (typeSfx && c.i % 3 === 0) audio.sfx('type');
    if (c.i >= c.full.length) {
      clearInterval(c.timer);
      if (corrupt) setTimeout(() => { if (cur === c) finishTyping(false); }, 600);
      else finishTyping(false);
    }
  }, 1000 / cps);
}

function finishTyping(skipped) {
  const c = cur;
  if (!c) return;
  clearInterval(c.timer);
  c.typing = false;
  render(c.full);
  if (c.target === 'box') box.classList.add('done');
  emit('line:typed', { tags: c.opts.tags || {}, speaker: c.opts.speaker });
  if (skipped) {
    store.state.stats.skips++;
    emit('line:skipped', { count: 1 });
    setTimeout(() => { if (cur === c) resolveCur({}); }, 35);
  } else if (auto) scheduleAuto();
}

function scheduleAuto() {
  if (!cur) return;
  const c = cur;
  clearTimeout(c.autoTimer);
  c.autoTimer = setTimeout(() => { if (cur === c && !c.typing && auto) resolveCur({}); }, 800 + 30 * c.full.length);
}

function resolveCur(result) {
  const c = cur;
  if (!c) return;
  cur = null;
  clearInterval(c.timer); clearTimeout(c.autoTimer);
  c.resolve(result);
}

export function advance() {
  emit('input:advance');
  if (!cur) return;
  if (cur.typing) { finishTyping(false); return; }
  resolveCur({});
}

export function cancel() { if (cur) resolveCur({ cancelled: true }); }
export const busy = () => !!cur;

function kick() {
  if (!cur || !wantsSkip()) return;
  if (cur.typing) finishTyping(true);
  else { const c = cur; store.state.stats.skips++; setTimeout(() => { if (cur === c) resolveCur({}); }, 35); }
}

export function setSkip(on) {
  skipping = !!on && skipAllowed;
  emit('dialogue:modes', { auto, skipping });
  kick();
}
export function toggleSkip() { setSkip(!skipping); }
export function setCtrl(held) {
  if (ctrlHeld === held) return;
  ctrlHeld = held;
  emit('skip:held', held);
  kick();
}
export function toggleAuto() {
  auto = !auto;
  emit('dialogue:modes', { auto, skipping });
  if (auto && cur && !cur.typing) scheduleAuto();
}
export function stopModes() { auto = false; skipping = false; emit('dialogue:modes', { auto, skipping }); }
export function setSkipAllowed(v) { skipAllowed = v; if (!v) setSkip(false); }
export function setSceneNoSkip(v) { sceneNoSkip = v; }
export const modes = () => ({ auto, skipping });
