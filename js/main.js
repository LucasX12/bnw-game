// Boot sequence, input wiring, and moving between the title screen and the game.
import { config } from './config.js';
import { store, loadGlobal, saveGlobal, freshState, readSlot, saveSlot, sessionSet } from './store.js';
import { on, emit } from './bus.js';
import { initStage, setAct, setDrain, setStageClass } from './stage/stage.js';
import { loadManifest, getManifest } from './assets.js';
import { parseScripts } from './script/parser.js';
import * as runner from './script/runner.js';
import * as bg from './stage/backgrounds.js';
import * as sprites from './stage/sprites.js';
import * as fx from './stage/fx.js';
import * as dialogue from './ui/dialogue.js';
import * as choices from './ui/choices.js';
import * as soma from './ui/soma.js';
import * as terminal from './ui/terminal.js';
import * as interlude from './ui/interlude.js';
import * as quickmenu from './ui/quickmenu.js';
import * as menus from './ui/menus.js';
import * as records from './ui/records.js';
import * as settings from './ui/settings.js';
import * as slogan from './ui/slogan.js';
import * as gate from './ui/gate.js';
import { openLog, clearLog } from './ui/log.js';
import { overlayOpen, closeTop, closeAll, trapTab } from './ui/overlay.js';
import * as audio from './audio/audio.js';
import { stopWhisper } from './audio/whisper.js';
import * as refresh from './meta/refresh.js';
import * as skipmash from './meta/skipmash.js';
import { setInGame, setTitle } from './meta/tabtitle.js';
import * as debug from './debug.js';

let inGame = false;

async function fetchJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`Could not load ${path} (${r.status})`);
  return r.json();
}

async function boot() {
  initStage();
  const ui = document.getElementById('ui');
  bg.mount(); fx.mount();
  dialogue.mount(ui); terminal.mount(ui); soma.mount(ui);
  quickmenu.mount(ui, {
    auto: () => dialogue.toggleAuto(),
    skip: () => dialogue.toggleSkip(),
    log: openLog,
    save: () => menus.openSaveLoad('save'),
    records: records.open,
    settings: settings.open,
  });
  skipmash.mount();
  loadGlobal();

  if (gate.isPhone()) { gate.phoneGate(); return; }
  if (location.protocol === 'file:') {
    gate.showErrors('Open the game through a web server', ['Browsers block loading the script files from file://.'],
      'In the bnw-game folder run  python3 -m http.server 8000  and open http://localhost:8000/');
    return;
  }

  try {
    await loadManifest();
    const [characters, decks, tuning, credits, index] = await Promise.all(
      ['data/characters.json', 'data/decks.json', 'data/tuning.json', 'data/credits.json', 'script/index.json'].map(fetchJson),
    );
    Object.assign(config, { characters, decks, tuning, credits });
    const files = await Promise.all(index.files.map(async (f) => {
      const r = await fetch(`script/${f}`);
      if (!r.ok) throw new Error(`Could not load script/${f} (${r.status})`);
      return { name: f, text: await r.text() };
    }));
    const graph = parseScripts(files, { characters, manifest: getManifest() });
    config.graph = graph;
    config.startScene = index.start || graph.order[0];
    if (config.debug) debug.mount(graph);
    if (graph.errors.length) {
      gate.showErrors(`The script has ${graph.errors.length} error${graph.errors.length === 1 ? '' : 's'}`,
        graph.errors.map((e) => `${e.file} line ${e.line}: ${e.msg}`), 'Fix these in the script files, save, and reload the page.');
      return;
    }
    graph.warnings.forEach((w) => console.warn(`[script] ${w.file}:${w.line} ${w.msg}`));
  } catch (err) {
    gate.showErrors('The game could not load', [String(err.message || err)]);
    return;
  }

  wireInput();
  wireBus();

  const refreshed = refresh.detect();
  if (!store.global.warningSeen) {
    await gate.contentWarning();
    store.global.warningSeen = true;
    saveGlobal();
    audio.unlock();
  }
  if (refreshed && readSlot('auto')) { await handleRefresh(refreshed); return; }
  toTitle();
}

// ---------- Moving between title and game ----------
function resetStage() {
  runner.stop();
  closeAll();
  stopWhisper(); audio.stopVoice();
  dialogue.stopModes(); dialogue.hideBox();
  choices.cancel(); slogan.cancel();
  terminal.exit();
  setStageClass('interlude', false);
  sprites.clear(); bg.clear();
  soma.setState('hidden');
  setAct(1); setDrain(0, 0);
  audio.setDetune(0, 0);
  emit('mode:changed', 'normal');
}

function toTitle() {
  resetStage();
  inGame = false; setInGame(false); setTitle(null);
  skipmash.setActive(false);
  soma.setVisible(false); quickmenu.setVisible(false);
  sessionSet(null);
  store.state = null;
  menus.showTitle();
  audio.playMusic('title_theme', 1200);
}

function enterGame() {
  menus.hideTitle();
  closeAll();
  inGame = true; setInGame(true);
  skipmash.setActive(true);
  clearLog();
  soma.setVisible(true); quickmenu.setVisible(true);
  audio.unlock();
}

function newGame(name) {
  resetStage();
  store.state = freshState(name);
  enterGame();
  runner.start(config.startScene);
}

function restoreStage(s) {
  setAct(s.act); setDrain(s.drain, 0);
  if (s.stage.bg) bg.set(s.stage.bg, { mode: s.stage.bgMode === 'drain' ? 'drain' : 'cut' });
  if (s.mode === 'interlude' && s.interlude) interlude.enter(s.interlude);
  for (const sp of s.stage.sprites || []) sprites.show(sp.id, sp.expr, sp.pos);
  if (s.mode === 'terminal') { terminal.enter(); if (s.termStats) terminal.showStats(runner.getStatsView()); }
  if (s.stage.music) audio.playMusic(s.stage.music, 800); else audio.stopMusic(400);
  audio.setDetune(s.stage.detune || 0, 0);
  soma.setState(s.soma || 'hidden');
  soma.setBlocked(s.mode === 'interlude' || (s.sceneTags || []).includes('nosoma'));
  dialogue.setSkipAllowed(s.skipAllowed !== false);
  dialogue.setSceneNoSkip((s.sceneTags || []).includes('noskip'));
  setTitle(s.title);
  emit('mode:changed', s.mode === 'interlude' ? 'interlude' : 'normal');
}

function loadGame(save, { pos = null, persist = false } = {}) {
  if (!save) return;
  resetStage();
  const s = structuredClone(save);
  if (store.mendedPending) { s.flags.mended = true; store.mendedPending = false; }
  if (pos) s.pos = { scene: pos.scene, node: pos.index };
  store.state = s;
  enterGame();
  restoreStage(s);
  if (persist) saveSlot('auto');
  runner.resume();
}

async function handleRefresh(sess) {
  store.global.totalRefreshes = (store.global.totalRefreshes || 0) + 1;
  saveGlobal();
  await refresh.interstitial();
  const save = readSlot('auto');
  if (!save) { toTitle(); return; }
  save.stats.refreshes = (save.stats.refreshes || 0) + 1;
  const mended = sess.sad ? config.graph.labels[`${sess.scene}_mended`] : null;
  loadGame(save, { pos: mended || null, persist: true });
}

function confirmTitle() {
  menus.confirmBox('Return to the title screen?', 'Anything since the start of this scene will be lost.', 'Title').then((ok) => { if (ok) toTitle(); });
}

// ---------- Wiring ----------
function wireBus() {
  on('game:new', newGame);
  on('game:load', (save) => loadGame(save));
  on('go:title', toTitle);
  on('script:end', toTitle);
  on('settings:changed', ({ key }) => { if (['music', 'sfx', 'voice'].includes(key)) audio.applyVolumes(); });
  on('debug:jump', (target) => {
    if (!inGame) { resetStage(); store.state = freshState('Tester'); enterGame(); } else { runner.stop(); sprites.clear(); }
    runner.start(target);
  });
}

function wireInput() {
  const stage = document.getElementById('stage');
  stage.addEventListener('pointerdown', () => audio.unlock(), { capture: true });
  // A mouse click must not leave focus on a game button, or Space (advance) would press it again.
  // Keyboard users (detail 0) keep focus so they can still use the buttons on purpose.
  stage.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && e.detail > 0 && !b.closest('.overlay')) setTimeout(() => b.blur(), 0);
  }, { capture: true });
  stage.addEventListener('click', (e) => {
    if (!inGame || overlayOpen() || menus.titleShown() || slogan.active() || choices.active()) return;
    if (e.target.closest('button, input, select, textarea, a, .choices, .soma-wrap, .quickmenu, .debug, .ending, .credits')) return;
    dialogue.advance();
  });
  window.addEventListener('keydown', (e) => {
    audio.unlock();
    if (e.key === '`' && config.debug) { debug.toggle(); return; }
    if (overlayOpen()) {
      if (e.key === 'Escape') { e.preventDefault(); closeTop(); } else trapTab(e);
      return;
    }
    if (!inGame || menus.titleShown() || slogan.active()) return;
    if (e.key === 'Control') { dialogue.setCtrl(true); return; }
    if (e.key === 'Escape') { e.preventDefault(); menus.pauseMenu({ title: confirmTitle }); return; }
    const tag = e.target?.tagName;
    const onControl = tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    if ((e.key === ' ' || e.key === 'Enter') && !onControl) { e.preventDefault(); if (!choices.active()) dialogue.advance(); return; }
    if (/^[1-9]$/.test(e.key) && choices.active()) { choices.pick(Number(e.key)); return; }
    if ((e.key === 'a' || e.key === 'A') && store.state?.mode !== 'interlude') { dialogue.toggleAuto(); return; }
    if (e.key === 'l' || e.key === 'L') openLog();
  });
  window.addEventListener('keyup', (e) => { if (e.key === 'Control') dialogue.setCtrl(false); });
  window.addEventListener('blur', () => dialogue.setCtrl(false));
}

boot();
