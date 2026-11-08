// Turns Lucas's screenplay-style .txt files into a scene graph.
// Collects every error in one pass, each with its file and line.
import { compile } from './expr.js';

export const COMMANDS = new Set([
  'jump', 'if', 'set', 'add', 'bg', 'show', 'hide', 'move', 'music', 'detune', 'sfx', 'act', 'drain',
  'effect', 'soma', 'somaskip', 'slogan', 'inject', 'whisper', 'delete', 'review', 'interlude',
  'endinterlude', 'terminal', 'stats', 'title', 'wait', 'skip', 'ending', 'checkpoint', 'day',
]);
const NO_ARGS = new Set(['endinterlude', 'checkpoint']);
const POSITIONS = new Set(['far-left', 'left', 'center', 'right', 'far-right']);
const SETTABLE = /^(stats|affinity|flag)\.[A-Za-z0-9_]+$/;
const SAY = /^([A-Za-z_][A-Za-z0-9_]*)(?:\s+([A-Za-z_][A-Za-z0-9_]*))?\s*:\s*(?=["“])/;
const OPEN_Q = /^["“]/;

const countTodo = (s) => (s.match(/\[\[TODO/g) || []).length;

function splitQuoted(s) {
  // s starts with an opening quote. The text runs to the LAST closing quote on the line.
  const close = Math.max(s.lastIndexOf('"'), s.lastIndexOf('”'));
  if (close <= 0) return null;
  return { text: s.slice(1, close), rest: s.slice(close + 1).trim() };
}

function parseLineTags(rest) {
  const tags = {};
  const re = /\[([^\]]*)\]/g;
  const leftover = rest.replace(re, '').trim();
  if (leftover) return { error: `Unexpected text after the closing quote: "${leftover}"` };
  let m;
  while ((m = re.exec(rest))) {
    const [k, ...v] = m[1].trim().split(/\s+/);
    if (k === 'vo' && v[0]) tags.vo = v[0];
    else if (k === 'sad') tags.sad = true;
    else if (k === 'noskip') tags.noskip = true;
    else if (k === 'corrupt') tags.corrupt = parseFloat(v[0]) || 0.3;
    else return { error: `Unknown tag [${m[1]}]` };
  }
  return { tags };
}

export function parseSay(line) {
  let speaker = null; let expr = null; let body = line;
  if (!OPEN_Q.test(line)) {
    const m = line.match(SAY);
    if (!m) return null;
    speaker = m[1].toLowerCase();
    expr = m[2] ? m[2].toLowerCase() : null;
    body = line.slice(m[0].length);
  }
  const q = splitQuoted(body);
  if (!q) return { error: 'Missing closing quote' };
  const t = parseLineTags(q.rest);
  if (t.error) return { error: t.error };
  return { speaker, expr, text: q.text, tags: t.tags };
}

export function parseOption(l) {
  if (!OPEN_Q.test(l)) return { error: 'Each choice option must start with quoted text' };
  const re = /["”]\s*->\s*/g;
  re.lastIndex = 1;
  const arrow = re.exec(l);
  if (!arrow) return { error: 'Choice option needs "-> target" after the quoted text' };
  const text = l.slice(1, arrow.index);
  const rest = l.slice(arrow.index + arrow[0].length);
  const tm = rest.match(/^([A-Za-z0-9_]+)\s*(.*)$/);
  if (!tm) return { error: 'Choice option needs a target after ->' };
  const opt = { text, target: tm[1], aff: {}, sets: [], cond: null, condSrc: null, disabled: null };
  const brackets = tm[2];
  const bre = /\[([^\]]*)\]/g;
  const leftover = brackets.replace(bre, '').trim();
  if (leftover) return { error: `Unexpected text "${leftover}" in choice option` };
  let b;
  while ((b = bre.exec(brackets))) {
    const s = b[1].trim();
    let m;
    if ((m = s.match(/^\+([A-Za-z_]+)\s+(-?\d+)$/))) {
      const who = m[1].toLowerCase();
      opt.aff[who] = (opt.aff[who] || 0) + parseInt(m[2], 10);
    } else if (s.startsWith('set ')) {
      const parts = s.slice(4).trim().split(/\s+/);
      if (!SETTABLE.test(parts[0])) return { error: `Can only set stats.*, affinity.* or flag.*, not "${parts[0]}"` };
      try { opt.sets.push({ path: parts[0], ast: compile(parts.slice(1).join(' ')) }); } catch (e) { return { error: `Bad set: ${e.message}` }; }
    } else if (s.startsWith('if ')) {
      try { opt.cond = compile(s.slice(3)); opt.condSrc = s.slice(3); } catch (e) { return { error: `Bad condition: ${e.message}` }; }
    } else if (s.startsWith('disabled')) {
      const q = s.match(/["“]([^"”]*)["”]/);
      opt.disabled = q ? q[1] : '';
    } else {
      return { error: `Unknown choice bracket [${s}]` };
    }
  }
  return opt;
}

const splitArgs = (s) => s.match(/"[^"]*"|“[^”]*”|\S+/g) || [];
const unquote = (s) => s.replace(/^["“]|["”]$/g, '');

export function parseCommand(name, line) {
  const rest = line.slice(name.length).trim();
  const raw = splitArgs(rest);
  const c = { name, args: raw.map(unquote) };
  if (!raw.length && !NO_ARGS.has(name)) return { error: `"${name}" needs arguments` };
  try {
    switch (name) {
      case 'if': {
        const k = rest.lastIndexOf('->');
        if (k < 0) return { error: 'if needs "-> target"' };
        c.ast = compile(rest.slice(0, k));
        c.target = rest.slice(k + 2).trim();
        if (!/^[A-Za-z0-9_]+$/.test(c.target)) return { error: 'if target must be one label or scene name' };
        break;
      }
      case 'set': {
        if (raw.length < 2) return { error: 'set needs a path and a value' };
        if (!SETTABLE.test(raw[0])) return { error: `Can only set stats.*, affinity.* or flag.*, not "${raw[0]}"` };
        c.path = raw[0];
        c.ast = compile(rest.slice(raw[0].length));
        break;
      }
      case 'add': {
        if (raw.length !== 2 || Number.isNaN(Number(raw[1]))) return { error: 'add needs a path and a number' };
        if (!SETTABLE.test(raw[0])) return { error: `Can only add to stats.*, affinity.* or flag.*, not "${raw[0]}"` };
        c.path = raw[0]; c.n = Number(raw[1]);
        break;
      }
      case 'jump': case 'somaskip':
        if (raw.length !== 1) return { error: `${name} needs exactly one target` };
        c.target = raw[0];
        break;
      case 'show':
        if (c.args[2] && !POSITIONS.has(c.args[2])) return { error: `Unknown position "${c.args[2]}". Use far-left, left, center, right or far-right` };
        break;
      case 'move':
        if (!POSITIONS.has(c.args[1])) return { error: `Unknown position "${c.args[1]}"` };
        break;
      case 'soma':
        if (!['hidden', 'on', 'auto', 'off', 'act3'].includes(c.args[0])) return { error: 'soma must be hidden, on, auto, off or act3' };
        break;
      case 'act':
        if (!['1', '2', '3'].includes(c.args[0])) return { error: 'act must be 1, 2 or 3' };
        break;
      case 'terminal': case 'skip':
        if (!['on', 'off'].includes(c.args[0])) return { error: `${name} must be on or off` };
        break;
      case 'stats':
        if (!['show', 'hide'].includes(c.args[0])) return { error: 'stats must be show or hide' };
        break;
      case 'effect':
        if (!['shake', 'glitch', 'flash', 'static', 'haze'].includes(c.args[0])) return { error: `Unknown effect "${c.args[0]}"` };
        break;
      case 'whisper':
        if (c.args[0] !== 'slogan') return { error: 'whisper only supports: whisper slogan [n]' };
        break;
      default: break;
    }
  } catch (e) {
    return { error: `${name}: ${e.message}` };
  }
  return c;
}

/**
 * files: [{ name, text }]
 * opts: { characters, manifest } used to check names and warn about missing assets.
 */
export function parseScripts(files, opts = {}) {
  const { characters = null, manifest = null } = opts;
  const scenes = {}; const order = []; const labels = {}; const errors = []; const warnings = [];
  let todo = 0;

  for (const f of files) {
    const lines = f.text.replace(/\r\n?/g, '\n').split('\n');
    let scene = null;
    let i = 0;
    const err = (line, msg) => errors.push({ file: f.name, line, msg });

    while (i < lines.length) {
      const ln = i + 1;
      const line = lines[i].trim();
      i++;
      if (!line || line.startsWith('#')) continue;
      todo += countTodo(line);

      if (line.startsWith('@scene')) {
        const parts = line.split(/\s+/);
        const id = parts[1];
        if (!id) { err(ln, '@scene needs a name'); continue; }
        if (scenes[id] || labels[id]) { err(ln, `Duplicate scene or label "${id}"`); continue; }
        scene = { id, tags: parts.slice(2), nodes: [], file: f.name, line: ln };
        scenes[id] = scene; order.push(id);
        continue;
      }
      if (!scene) { err(ln, 'This line is outside any @scene'); continue; }
      const at = { file: f.name, line: ln };

      if (line === 'choice') {
        const options = []; let closed = false;
        while (i < lines.length) {
          const l2 = lines[i].trim(); const ln2 = i + 1; i++;
          if (!l2 || l2.startsWith('#')) continue;
          todo += countTodo(l2);
          if (l2 === 'end') { closed = true; break; }
          const opt = parseOption(l2);
          if (opt.error) err(ln2, opt.error); else options.push({ ...opt, line: ln2 });
        }
        if (!closed) err(ln, 'choice block has no "end"');
        if (!options.length) err(ln, 'choice block has no options');
        scene.nodes.push({ t: 'choice', options, ...at });
        continue;
      }

      const say = parseSay(line);
      if (say) {
        if (say.error) { err(ln, say.error); continue; }
        scene.nodes.push({ t: 'say', ...say, ...at });
        continue;
      }

      const word = line.split(/\s+/)[0];
      if (word === 'label') {
        const name = line.split(/\s+/)[1];
        if (!name) { err(ln, 'label needs a name'); continue; }
        if (labels[name] || scenes[name]) { err(ln, `Duplicate label "${name}"`); continue; }
        labels[name] = { scene: scene.id, index: scene.nodes.length };
        continue;
      }
      if (word === 'end') { err(ln, '"end" without a matching "choice"'); continue; }
      if (!COMMANDS.has(word)) { err(ln, `Unknown command "${word}". Dialogue needs a speaker, a colon and quotes, like  lenina: "Hi"`); continue; }
      const cmd = parseCommand(word, line);
      if (cmd.error) { err(ln, cmd.error); continue; }
      scene.nodes.push({ t: 'cmd', ...cmd, ...at });
    }
  }

  // Labels declared before a scene of the same name.
  for (const name of Object.keys(labels)) {
    if (scenes[name]) errors.push({ file: scenes[name].file, line: scenes[name].line, msg: `"${name}" is used as both a scene and a label` });
  }

  // Cross-checks.
  const hasTarget = (t) => !!(labels[t] || scenes[t]);
  const chars = characters || {};
  const known = (id) => !characters || !!chars[id];
  const knownExpr = (id, ex) => !characters || !chars[id]?.expressions || chars[id].expressions.includes(ex);
  const bgKnown = (id) => !manifest || !!manifest.backgrounds?.[id];

  for (const id of order) {
    for (const n of scenes[id].nodes) {
      const e = (msg) => errors.push({ file: n.file, line: n.line, msg });
      const w = (msg) => warnings.push({ file: n.file, line: n.line, msg });
      if (n.t === 'say') {
        if (n.speaker && !known(n.speaker)) e(`Unknown speaker "${n.speaker}"`);
        if (n.speaker && n.expr && !knownExpr(n.speaker, n.expr)) e(`"${n.speaker}" has no expression "${n.expr}"`);
      } else if (n.t === 'choice') {
        for (const o of n.options) if (!hasTarget(o.target)) errors.push({ file: n.file, line: o.line, msg: `Unknown target "${o.target}"` });
      } else if (n.t === 'cmd') {
        if (['jump', 'if', 'somaskip'].includes(n.name) && !hasTarget(n.target)) e(`Unknown target "${n.target}"`);
        if (['show', 'hide', 'move', 'delete', 'review', 'interlude'].includes(n.name) && !known(n.args[0])) e(`Unknown character "${n.args[0]}"`);
        if (n.name === 'show' && n.args[1] && !knownExpr(n.args[0], n.args[1])) e(`"${n.args[0]}" has no expression "${n.args[1]}"`);
        if (n.name === 'bg' && !bgKnown(n.args[0])) w(`Background "${n.args[0]}" is not in assets/manifest.json`);
        if (n.name === 'ending' && !['stability', 'island', 'unhappy', 'citizen'].includes(n.args[0])) w(`Ending "${n.args[0]}" is not one of the four planned endings`);
      }
    }
  }

  return { scenes, order, labels, errors, warnings, todo };
}
