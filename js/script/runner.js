// Steps through the scene graph and executes each line. The only module that advances the story.
import { store, saveSlot, saveGlobal, saveGlobalSoon, sessionSet } from '../store.js';
import { config, CLUB } from '../config.js';
import { emit, on } from '../bus.js';
import { evaluate, interpolate } from './expr.js';
import { setAct, setDrain, sleep } from '../stage/stage.js';
import * as bg from '../stage/backgrounds.js';
import * as sprites from '../stage/sprites.js';
import * as fx from '../stage/fx.js';
import * as dialogue from '../ui/dialogue.js';
import * as choices from '../ui/choices.js';
import * as soma from '../ui/soma.js';
import * as slogan from '../ui/slogan.js';
import * as terminal from '../ui/terminal.js';
import * as interlude from '../ui/interlude.js';
import * as endings from '../ui/endings.js';
import * as audio from '../audio/audio.js';
import { whisperSlogan } from '../audio/whisper.js';
import { setTitle } from '../meta/tabtitle.js';
import * as clock from '../meta/clock.js';

let gen = 0;
let jumped = false;
let enterPending = false;
let pendingSoma = null;
const warned = new Set();

const graph = () => config.graph;
const st = () => store.state;

// ---------- Expression context ----------
function warnOnce(msg) { if (!warned.has(msg)) { warned.add(msg); console.warn(`[script] ${msg}`); emit('script:warning', msg); } }

export function highest() {
  const a = st().affinity;
  let best = ''; let max = -Infinity; let tie = false;
  for (const id of CLUB) {
    const v = a[id] || 0;
    if (v > max) { max = v; best = id; tie = false; } else if (v === max) tie = true;
  }
  return tie ? '' : best;
}
const highestOf = (x, y) => ((st().affinity[x] || 0) >= (st().affinity[y] || 0) ? x : y);

function sloganText(s) { return s ? s.words.join(' ') : ''; }

function lookup(path) {
  const s = st(); const g = store.global;
  if (!path.includes('.')) {
    if (path === 'name') return s.player.name;
    if (path === 'highest') return highest();
    if (path === 'day') return s.day;
    if (path === 'act') return s.act;
    if (config.characters[path]) return path;
    warnOnce(`Unknown name "${path}"`);
    return 0;
  }
  const [root, ...rest] = path.split('.');
  const key = rest.join('.');
  switch (root) {
    case 'stats': return s.stats[key] ?? 0;
    case 'affinity': return s.affinity[key] ?? 0;
    case 'flag': return s.flags[key] ?? false;
    case 'global': return g[key] ?? false;
    case 'records': return g.records[key] ?? '';
    case 'player': return s.player[key];
    case 'tuning': return config.tuning[key] ?? 0;
    case 'clock': return clock.get(key);
    case 'slogan': {
      const last = s.slogans.at(-1);
      if (key === 'last') return sloganText(last);
      if (key === 'catchiness') return last?.catchiness ?? 0;
      if (key === 'hasTruth') return !!last?.hasTruth;
      if (key === 'hasShock') return !!last?.hasShock;
      if (key === 'count') return s.slogans.length;
      if (/^\d+$/.test(key)) return sloganText(s.slogans[Number(key) - 1]);
      break;
    }
    default: break;
  }
  warnOnce(`Unknown path "${path}"`);
  return 0;
}

export const ctx = { lookup, highestOf };

function setPath(path, value) {
  const [root, key] = path.split('.');
  const s = st();
  if (root === 'stats') s.stats[key] = value;
  else if (root === 'affinity') s.affinity[key] = value;
  else if (root === 'flag') s.flags[key] = value;
}

// ---------- Flow ----------
function resolveTarget(t) {
  const g = graph();
  if (g.labels[t]) return g.labels[t];
  if (g.scenes[t]) return { scene: t, index: 0 };
  return null;
}

function jumpTo(t) {
  const p = resolveTarget(t);
  if (!p) { console.error(`[script] Unknown target "${t}"`); return; }
  const s = st();
  enterPending = p.scene !== s.pos.scene || t === p.scene;
  s.pos = { scene: p.scene, node: p.index };
  jumped = true;
}

function nextSceneId() {
  const g = graph();
  return g.order[g.order.indexOf(st().pos.scene) + 1] || null;
}

export function stop() {
  gen++;
  pendingSoma = null;
  dialogue.cancel();
  choices.cancel();
  slogan.cancel();
}

export function start(target) {
  stop();
  const p = resolveTarget(target);
  if (!p) throw new Error(`Unknown start target "${target}"`);
  st().pos = { scene: p.scene, node: p.index };
  enterPending = true;
  return loop();
}

// Resume from a restored save. pos.node 0 means a scene start: re-enter it.
export function resume() {
  stop();
  enterPending = st().pos.node === 0;
  return loop();
}

async function loop() {
  const my = ++gen;
  while (my === gen) {
    const s = st();
    const sc = graph().scenes[s.pos.scene];
    if (!sc) { console.error(`[script] No scene "${s.pos.scene}"`); return; }
    if (enterPending) {
      enterPending = false;
      enterScene(sc);
    }
    if (s.pos.node >= sc.nodes.length) {
      const next = nextSceneId();
      if (!next) { console.warn('[script] Reached the end of the script with no ending.'); emit('script:end'); return; }
      s.pos = { scene: next, node: 0 };
      enterPending = true;
      continue;
    }
    const node = sc.nodes[s.pos.node];
    jumped = false;
    try { await exec(node, my); } catch (err) { console.error(`[script] ${node.file}:${node.line}`, err); emit('runtime:error', { node, err }); }
    if (my !== gen) return;
    if (pendingSoma) { const t = pendingSoma; pendingSoma = null; jumpTo(t); continue; }
    if (!jumped) s.pos.node++;
  }
}

function enterScene(sc) {
  const s = st();
  s.sceneTags = sc.tags;
  for (const tag of sc.tags) {
    if (/^act[123]$/.test(tag) && s.act !== Number(tag[3])) applyAct(Number(tag[3]));
    else if (/^day\d+$/.test(tag)) s.day = Number(tag.slice(3));
  }
  s.somaskip = null;
  soma.setBlocked(sc.tags.includes('nosoma') || s.mode === 'interlude');
  dialogue.setSceneNoSkip(sc.tags.includes('noskip'));
  sessionSet({ scene: sc.id, sad: sc.tags.includes('sad'), t: Date.now() });
  autosave();
  emit('scene:start', { sceneId: sc.id, tags: sc.tags });
}

function applyAct(n) {
  const s = st();
  s.act = n;
  setAct(n);
  const d = { 1: 0, 2: 0.35, 3: 1 }[n];
  s.drain = d;
  setDrain(d, 2000);
  emit('act:changed', { act: n });
}

export function autosave() {
  const s = st();
  s.stage.sprites = sprites.list();
  saveSlot('auto');
}

// ---------- Commands ----------
const islandScene = () => st().sceneTags?.includes('island');
const erased = (id) => store.global.records[id] === 'transferred' && !islandScene();

async function exec(node, my) {
  if (node.t === 'say') return say(node);
  if (node.t === 'choice') return choose(node);
  const a = node.args; const s = st();
  switch (node.name) {
    case 'jump': jumpTo(node.target); return;
    case 'if': if (evaluate(node.ast, ctx)) jumpTo(node.target); return;
    case 'set': setPath(node.path, evaluate(node.ast, ctx)); return;
    case 'add': setPath(node.path, (Number(lookup(node.path)) || 0) + node.n); return;
    case 'bg': {
      const [id, mode = 'fade', ms] = a;
      s.stage.bg = id; s.stage.bgMode = mode === 'drain' ? 'drain' : 'normal';
      bg.set(id, { mode, ms: Number(ms) || undefined });
      return;
    }
    case 'show': {
      const [id, expr = 'neutral', pos] = a;
      if (erased(id)) { warnOnce(`${node.file}:${node.line} show ${id}: ${id} has been erased`); return; }
      sprites.show(id, expr, pos);
      s.stage.sprites = sprites.list();
      return;
    }
    case 'hide': sprites.hide(a[0], a[1]); s.stage.sprites = sprites.list(); return;
    case 'move': sprites.move(a[0], a[1], Number(a[2]) || 600); s.stage.sprites = sprites.list(); return;
    case 'music': {
      if (a[0] === 'stop') { s.stage.music = null; audio.stopMusic(Number(a[2] || a[1]) || 800); return; }
      s.stage.music = a[0];
      audio.playMusic(a[0], a[1] === 'fade' ? Number(a[2]) || 1000 : 600);
      return;
    }
    case 'detune': s.stage.detune = Number(a[0]) || 0; audio.setDetune(s.stage.detune, Number(a[1]) || 1500); return;
    case 'sfx': audio.sfx(a[0]); return;
    case 'act': applyAct(Number(a[0])); return;
    case 'drain': s.drain = Number(a[0]) || 0; setDrain(s.drain, Number(a[1]) || 1200); return;
    case 'effect': runEffect(a); return;
    case 'soma': s.soma = a[0]; soma.setState(a[0]); return;
    case 'somaskip': s.somaskip = node.target; return;
    case 'slogan': return runSlogan(a[0]);
    case 'inject': injectWord(a[0]); return;
    case 'whisper': return whisper(a);
    case 'delete': return deleteChar(a[0]);
    case 'review': store.global.records[a[0]] = 'review'; saveGlobal(); emit('record:changed', { charId: a[0] }); return;
    case 'interlude': s.mode = 'interlude'; s.interlude = a[0]; soma.setBlocked(true); interlude.enter(a[0]); return;
    case 'endinterlude': s.mode = 'normal'; s.interlude = null; soma.setBlocked(false); interlude.exit(); return;
    case 'terminal':
      if (a[0] === 'on') { s.mode = 'terminal'; dialogue.hideBox(); terminal.enter(); } else { s.mode = 'normal'; s.termStats = false; terminal.exit(); }
      return;
    case 'stats':
      s.termStats = a[0] === 'show';
      if (s.termStats) terminal.showStats(statsView()); else terminal.hideStats();
      return;
    case 'title': s.title = a[0] === 'reset' ? null : interpolate(a[0], ctx); setTitle(s.title); return;
    case 'wait': return wait((Number(a[0]) || 1) * 1000, my);
    case 'skip': s.skipAllowed = a[0] !== 'off'; dialogue.setSkipAllowed(s.skipAllowed); return;
    case 'ending': return runEnding(a[0]);
    case 'checkpoint': autosave(); return;
    case 'day': s.day = Number(a[0]) || s.day; return;
    default: warnOnce(`Command "${node.name}" is not implemented`);
  }
}

async function wait(ms, my) {
  const step = 50;
  for (let t = 0; t < ms; t += step) {
    if (my !== gen || pendingSoma) return;
    if (dialogue.modes().skipping) return;
    await sleep(step);
  }
}

async function say(node) {
  const s = st(); const sp = node.speaker;
  if (sp && sp !== 'you' && sp !== 'voice' && erased(sp)) return;
  if (sp && node.expr && sprites.isVisible(sp)) { sprites.show(sp, node.expr); s.stage.sprites = sprites.list(); }
  sprites.focus(sp);
  const text = interpolate(node.text, ctx);
  const key = `${s.pos.scene}:${s.pos.node}`;
  const ch = config.characters[sp] || {};
  const name = sp === 'you' ? s.player.name : (ch.name || '');
  if (node.tags.vo) audio.voice(node.tags.vo);
  const res = await dialogue.say({
    speaker: sp, name, caste: sp === 'you' ? s.player.caste : (ch.caste || ''), tag: ch.tag || null,
    text, tags: node.tags, read: !!store.global.readLines[key], mode: s.mode,
  });
  if (res?.cancelled) return;
  store.global.readLines[key] = true;
  saveGlobalSoon();
  emit('line:shown', { speaker: sp, text, sceneId: s.pos.scene, lineNo: node.line });
}

async function choose(node) {
  dialogue.stopModes();
  const opts = node.options.map((o) => {
    const ok = o.cond ? !!evaluate(o.cond, ctx) : true;
    return { text: interpolate(o.text, ctx), enabled: ok, hidden: !ok && o.disabled == null, caption: ok ? null : o.disabled, src: o };
  }).filter((o) => !o.hidden);
  const pick = await choices.show(opts, st().mode);
  if (!pick) return;
  const o = pick.src; const s = st();
  for (const [k, v] of Object.entries(o.aff)) s.affinity[k] = (s.affinity[k] || 0) + v;
  for (const x of o.sets) setPath(x.path, evaluate(x.ast, ctx));
  audio.sfx('choice');
  emit('choice:made', { label: o.target });
  jumpTo(o.target);
}

function runEffect(a) {
  const [k, x, y] = a;
  if (k === 'shake') fx.shake(Number(x) || 400);
  else if (k === 'glitch') fx.glitch(Number(x) || 0.5, Number(y) || 600);
  else if (k === 'flash') fx.flash(x || '#FFFFFF', Number(y) || 200);
  else if (k === 'static') fx.staticNoise(Number(x) || 600);
  else if (k === 'haze') fx.haze(Number(x) || 900);
}

async function runSlogan(deckId) {
  const deck = config.decks[deckId];
  if (!deck) { warnOnce(`No slogan deck "${deckId}" in data/decks.json`); return; }
  const s = st();
  dialogue.stopModes();
  dialogue.hideBox();
  soma.setVisible(false);
  const present = CLUB.filter((id) => !erased(id) && (id !== 'john' || s.act >= 2 || s.flags.met_john));
  const res = await slogan.open(deck, { present });
  soma.setVisible(true);
  if (!res) return;
  const owner = { comfort: 'lenina', status: 'bernard', truth: 'helmholtz', shakespeare: 'john' };
  for (const t of res.tiles) {
    for (const tag of t.tags || []) if (owner[tag]) s.affinity[owner[tag]] = (s.affinity[owner[tag]] || 0) + 1;
    if (t.tags?.includes('truth')) s.stats.truth++;
  }
  s.stats.shockOffered += res.shockOffered;
  s.stats.shockUsed += res.shockUsed;
  s.stats.slogans++;
  s.stats.catchinessTotal += res.catchiness;
  s.slogans.push({ day: s.day, words: res.words, catchiness: res.catchiness, tags: res.tags, injected: null, hasTruth: res.hasTruth, hasShock: res.shockUsed > 0 });
  emit('slogan:submitted', res);
}

function injectWord(word) {
  const last = st().slogans.at(-1);
  if (!last) { warnOnce('inject used before any slogan was written'); return; }
  const at = Math.floor(Math.random() * (last.words.length + 1));
  last.words.splice(at, 0, word);
  last.injected = { word, at };
  audio.sfx('glitch');
  fx.glitch(0.4, 500);
}

async function whisper(a) {
  const s = st();
  if (!s.slogans.length) return;
  const n = a[1] ? Math.min(Number(a[1]) || 1, s.slogans.length) - 1 : Math.floor(Math.random() * s.slogans.length);
  const text = sloganText(s.slogans[n]);
  audio.sfx('breath');
  whisperSlogan(text, store.global.settings.voice);
  await dialogue.say({ speaker: 'voice', name: '', text, tags: {}, read: false, mode: s.mode === 'terminal' ? 'normal' : s.mode });
}

async function deleteChar(id) {
  const g = store.global;
  if (g.records[id] === 'transferred') return;
  if (sprites.isVisible(id)) await sprites.drainAndDissolve(id);
  g.records[id] = 'transferred';
  g.deletionDay = st().day;
  g.deletionCount = (g.deletionCount || 0) + 1;
  saveGlobal();
  audio.sfx('delete');
  fx.glitch(0.4, 300);
  st().stage.sprites = sprites.list();
  emit('record:deleted', { charId: id });
  // Save straight away so the autosave is never older than the deletion.
  const s = st(); const keep = s.pos.node;
  s.pos.node = keep + 1; autosave(); s.pos.node = keep;
}

function statsView() {
  const s = st().stats;
  const offered = s.shockOffered || 0;
  return {
    soma: s.soma, skips: s.skips, refreshes: s.refreshes,
    shock: `${Math.max(0, offered - (s.shockUsed || 0))} of ${offered}`,
    truth: (s.truth || 0) >= (config.tuning.islandTruth || 3) ? 'High' : 'Low',
    time: clock.get('time'),
  };
}
export const getStatsView = statsView;

async function runEnding(id) {
  const g = store.global;
  g.endingsSeen[id] = true;
  if (id === 'stability') g.resetSeen = true;
  saveGlobal();
  emit('ending:reached', { id });
  const my = gen;
  dialogue.hideBox();
  soma.setVisible(false);
  await endings.show(id);
  if (my !== gen) return;
  gen++;
  emit('go:title');
}

// ---------- Soma ----------
on('soma:request', ({ auto }) => {
  const s = st();
  if (!s) return;
  s.stats.soma++;
  if (s.act === 3) s.stats.somaAct3++;
  if (auto) s.stats.somaAuto++;
  audio.sfx('soma');
  fx.haze(900);
  audio.brighten(10000);
  emit('soma:pressed', { auto });
  const target = s.somaskip || nextSceneId();
  if (!target) return;
  pendingSoma = target;
  dialogue.cancel();
  choices.cancel();
});
