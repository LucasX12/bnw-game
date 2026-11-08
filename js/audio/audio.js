// Music, sound effects and voice through Web Audio, so music can be detuned in Act 2.
// Missing files are silent. Audio unlocks on the first click or key press.
import { store } from '../store.js';
import { audioSrc, missing } from '../assets.js';

let ctx = null; let master; let musicBus; let sfxBus; let voiceBus; let filter; let duck;
const buffers = new Map();
let music = null; // { id, src, g }
let wanted = null; // music id the game currently wants
let detune = 0; let driftTimer = null;
let voiceSrc = null;

export function unlock() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
    master = ctx.createGain();
    filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 20000;
    duck = ctx.createGain();
    musicBus = ctx.createGain(); sfxBus = ctx.createGain(); voiceBus = ctx.createGain();
    musicBus.connect(filter); filter.connect(duck); duck.connect(master);
    sfxBus.connect(master); voiceBus.connect(master);
    master.connect(ctx.destination);
    applyVolumes();
    if (wanted) { const w = wanted; wanted = null; playMusic(w.id, w.fade); }
    setDetune(detune, 0);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function applyVolumes() {
  if (!ctx) return;
  const s = store.global?.settings || {};
  musicBus.gain.value = s.music ?? 0.7;
  sfxBus.gain.value = s.sfx ?? 0.8;
  voiceBus.gain.value = s.voice ?? 0.9;
}

function load(kind, id) {
  const url = audioSrc(kind, id);
  if (!url || !ctx) return Promise.resolve(null);
  if (!buffers.has(url)) {
    buffers.set(url, fetch(url)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((b) => ctx.decodeAudioData(b))
      .catch(() => { missing.add(url); return null; }));
  }
  return buffers.get(url);
}

export async function playMusic(id, fade = 800) {
  if (!ctx) { wanted = { id, fade }; return; }
  if (music?.id === id) return;
  wanted = { id, fade };
  stopMusic(fade, true);
  const buf = await load('music', id);
  if (!buf || wanted?.id !== id || music?.id === id) return;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(1, ctx.currentTime + fade / 1000);
  src.connect(g); g.connect(musicBus);
  src.start();
  music = { id, src, g };
}

export function stopMusic(fade = 800, keepWanted = false) {
  if (!keepWanted) wanted = null;
  if (!music || !ctx) return;
  const { src, g } = music;
  music = null;
  const t = ctx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.linearRampToValueAtTime(0, t + fade / 1000);
  setTimeout(() => { try { src.stop(); } catch { /* already stopped */ } }, fade + 60);
}

// x from 0 to 1: random pitch drift up to x * 60 cents, plus a lowpass closing in.
export function setDetune(x, ms = 1500) {
  detune = Math.max(0, Math.min(1, x || 0));
  clearInterval(driftTimer);
  if (!ctx) return;
  const t = ctx.currentTime;
  filter.frequency.cancelScheduledValues(t);
  filter.frequency.setValueAtTime(filter.frequency.value, t);
  filter.frequency.linearRampToValueAtTime(20000 - detune * 16000, t + ms / 1000);
  if (detune > 0) {
    driftTimer = setInterval(() => {
      if (!music?.src) return;
      const p = music.src.detune || music.src.playbackRate;
      const cents = (Math.random() * 2 - 1) * detune * 60;
      const now = ctx.currentTime;
      if (music.src.detune) p.linearRampToValueAtTime(cents, now + 1.2);
      else p.linearRampToValueAtTime(2 ** (cents / 1200), now + 1.2);
    }, 1200);
  } else if (music?.src?.detune) music.src.detune.linearRampToValueAtTime(0, t + 0.5);
}

// After a soma press: the music sweetens for a while.
export function brighten(ms = 10000) {
  if (!ctx) return;
  const t = ctx.currentTime;
  filter.frequency.cancelScheduledValues(t);
  filter.frequency.setValueAtTime(20000, t);
  setTimeout(() => setDetune(detune, 2000), ms);
}

export async function sfx(id, kind = 'sfx') {
  if (!ctx) return;
  const buf = await load(kind, id);
  if (!buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(sfxBus);
  src.start();
}

export async function voice(id) {
  if (!ctx) return;
  const buf = await load('voice', id);
  if (!buf) return;
  try { voiceSrc?.stop(); } catch { /* ignore */ }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(voiceBus);
  voiceSrc = src;
  const t = ctx.currentTime;
  duck.gain.cancelScheduledValues(t);
  duck.gain.setValueAtTime(duck.gain.value, t);
  duck.gain.linearRampToValueAtTime(0.4, t + 0.2);
  src.onended = () => {
    if (voiceSrc !== src) return;
    voiceSrc = null;
    const n = ctx.currentTime;
    duck.gain.linearRampToValueAtTime(1, n + 0.4);
  };
  src.start();
}

export function stopVoice() { try { voiceSrc?.stop(); } catch { /* ignore */ } voiceSrc = null; }
export const currentMusic = () => music?.id || wanted?.id || null;
