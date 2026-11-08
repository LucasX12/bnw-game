// A tiny test runner with no dependencies. Open tests.html through a local server.
import { parseScripts } from '../js/script/parser.js';
import { compile, evaluate, interpolate } from '../js/script/expr.js';
import { scoreSlogan } from '../js/ui/slogan.js';
import { isLocked } from '../js/store.js';
import { wasRefreshedMidScene } from '../js/meta/refresh.js';

const out = document.getElementById('out');
let pass = 0; let fail = 0; let list = null;

function suite(name) {
  const h = document.createElement('h2'); h.textContent = name; out.appendChild(h);
  list = document.createElement('ul'); out.appendChild(list);
}
function assert(cond, label) {
  const li = document.createElement('li');
  li.className = cond ? 'pass' : 'fail';
  li.textContent = `${cond ? 'PASS' : 'FAIL'}  ${label}`;
  list.appendChild(li);
  if (cond) pass++; else { fail++; console.error('FAIL', label); }
}
const parse = (text, opts) => parseScripts([{ name: 't.txt', text }], opts);
const chars = {
  lenina: { expressions: ['neutral', 'happy'] }, bernard: { expressions: ['neutral'] }, helmholtz: { expressions: ['neutral'] },
  john: { expressions: ['neutral'] }, you: {}, voice: {},
};

// ---------- Parser ----------
suite('Parser: line types');
{
  const g = parse(`# comment\n@scene s1 act1 day2 sad\nlenina happy: "Hi there." [sad] [vo v1]\n"Narration line."\nyou: “Curly quotes work.”\n\tbg classroom_bright fade 300\nlabel here\nchoice\n  "Option A" -> here [+lenina 2]\n  "Option B" -> s1 [if stats.truth >= 3] [disabled "Too low"]\nend\njump here`, { characters: chars });
  assert(g.errors.length === 0, `no errors (${JSON.stringify(g.errors)})`);
  const n = g.scenes.s1.nodes;
  assert(g.scenes.s1.tags.join() === 'act1,day2,sad', 'scene tags parsed');
  assert(n[0].t === 'say' && n[0].speaker === 'lenina' && n[0].expr === 'happy' && n[0].text === 'Hi there.', 'dialogue with expression');
  assert(n[0].tags.sad && n[0].tags.vo === 'v1', 'trailing tags');
  assert(n[1].t === 'say' && n[1].speaker === null, 'narration');
  assert(n[2].text === 'Curly quotes work.', 'curly quotes');
  assert(n[3].t === 'cmd' && n[3].name === 'bg' && n[3].args[0] === 'classroom_bright', 'tab-indented command');
  assert(g.labels.here.index === 4, 'label index points at next node');
  assert(n[4].t === 'choice' && n[4].options.length === 2, 'choice block');
  assert(n[4].options[0].aff.lenina === 2, 'affinity bracket');
  assert(n[4].options[1].cond && n[4].options[1].disabled === 'Too low', 'condition and disabled caption');
  assert(n[5].name === 'jump' && n[5].target === 'here', 'jump');
  const c = parse('@scene a\ncg cg_welcome fade 900\ncg off 400', { characters: chars });
  assert(c.errors.length === 0 && c.scenes.a.nodes[0].name === 'cg' && c.scenes.a.nodes[1].args[0] === 'off', 'cg command');
  assert(parse('@scene a\n"[[TODO Lucas: x]]"\n"[[TODO Lucas: y]]"').todo === 2, 'TODO counter');
  const q = parse('@scene a\nlenina: "She said "hi" to me."', { characters: chars });
  assert(q.scenes.a.nodes[0].text === 'She said "hi" to me.', 'inner quotes kept');
}

suite('Parser: errors');
{
  const e = (text) => parse(text, { characters: chars }).errors.map((x) => x.msg).join(' | ');
  assert(/Unknown command/.test(e('@scene a\nfly away')), 'unknown command');
  assert(/Unknown target/.test(e('@scene a\njump nowhere')), 'unknown jump target');
  assert(/Duplicate label/.test(e('@scene a\nlabel x\nlabel x')), 'duplicate label');
  assert(/no "end"/.test(e('@scene a\nchoice\n  "A" -> a')), 'unterminated choice');
  assert(/if/.test(e('@scene a\nif stats.truth = 3 -> a')), 'bad expression (single =)');
  assert(/closing quote/.test(e('@scene a\nlenina: "unclosed')) || /Unknown command/.test(e('@scene a\nlenina: "unclosed')), 'unclosed quote');
  assert(/outside any @scene/.test(e('"no scene"')), 'line outside a scene');
  assert(/Unknown speaker/.test(e('@scene a\nghost: "boo"')), 'unknown speaker');
  assert(/no expression/.test(e('@scene a\nbernard happy: "x"')), 'unknown expression');
  assert(/Unknown position/.test(e('@scene a\nshow lenina happy middle')), 'unknown position');
  assert(/Can only set/.test(e('@scene a\nset global.resetSeen true')), 'set restricted to stats, affinity, flag');
  const multi = parse('@scene a\nfly\njump nope\nghost: "x"', { characters: chars });
  assert(multi.errors.length === 3, 'collects all errors in one pass');
  assert(multi.errors.every((x) => x.file === 't.txt' && x.line > 0), 'errors carry file and line');
}

// ---------- Expressions ----------
suite('Expressions');
{
  const data = { stats: { truth: 3, soma: 0 }, affinity: { lenina: 5, bernard: 9, helmholtz: 9, john: 1 }, flag: { met: true } };
  const ctx = {
    lookup: (p) => {
      if (p === 'name') return 'Lucas';
      if (p === 'highest') return '';
      if (['lenina', 'bernard', 'helmholtz', 'john'].includes(p)) return p;
      const [r, k] = p.split('.');
      return data[r]?.[k] ?? 0;
    },
    highestOf: (a, b) => ((data.affinity[a] || 0) >= (data.affinity[b] || 0) ? a : b),
  };
  const ev = (s) => evaluate(compile(s), ctx);
  assert(ev('stats.truth >= 3') === true, '>=');
  assert(ev('1 + 2 - 1') === 2, 'left-to-right + and -');
  assert(ev('not flag.met or stats.truth == 3') === true, 'not binds tighter than or');
  assert(ev('stats.truth > 2 and stats.soma == 0') === true, 'and');
  assert(ev('(stats.truth + 1) == 4') === true, 'parentheses');
  assert(ev('highest_of helmholtz bernard == "helmholtz"') === true, 'highest_of tie goes to first listed');
  assert(ev('highest == bernard') === false, 'highest is empty on a tie');
  assert(ev('stats.unknown == 0') === true, 'unknown paths read as 0');
  assert(interpolate('Hi {name}, truth {stats.truth}.', ctx) === 'Hi Lucas, truth 3.', 'interpolation');
  let threw = false; try { compile('stats.truth = 3'); } catch { threw = true; }
  assert(threw, 'single = is rejected');
}

// ---------- Catchiness ----------
suite('Catchiness scoring');
{
  const W = (w, syl, rhyme, tags = [], shock = false) => ({ w, syl, rhyme, tags, shock });
  const ending = W('ending', 2, 'ending', ['comfort']); const mending = W('mending', 2, 'ending', ['comfort']);
  const is = W('is', 1); const better = W('better', 2); const than = W('than', 1);
  const s1 = scoreSlogan([ending, is, better, than, mending]);
  assert(s1.total >= 70, `"ending is better than mending" scores at least 70 (got ${s1.total})`);
  assert(scoreSlogan([]).total === 0, 'empty slogan scores 0');
  const alone = W('alone', 2, 'one', ['truth'], true);
  assert(scoreSlogan([ending, is, better, than, mending, alone]).total < s1.total - 40, 'shock word drops the score hard');
  const s2 = scoreSlogan([is, better, than]);
  assert(s2.rhyme === 0 && s2.syl === 4, 'no rhyme, 4 beats');
  assert(scoreSlogan([is, better, than, W('true', 1, null, ['truth'])]).truthCount === 1, 'truth words counted');
  const shakes = scoreSlogan([W('brave', 1, null, ['shakespeare']), W('new', 1, null, ['shakespeare']), W('world', 1, null, ['shakespeare'])]);
  assert(shakes.total === 0 && shakes.unmeasurable, 'Shakespeare is unmeasurable');
  const long = scoreSlogan(Array.from({ length: 7 }, () => W('everybody', 4)));
  assert(long.rhythm < 40, 'too many beats loses rhythm points');
  const gramme = W('gramme', 1, 'am', ['comfort']); const damn = W('damn', 1, 'am');
  assert(scoreSlogan([W('a', 1), gramme, is, better, than, W('a', 1), damn]).pairs === 1, 'gramme and damn rhyme');
  assert(scoreSlogan([ending, mending, W('sending', 2, 'ending'), is, better]).pairs === 2, 'three rhyming words make two pairs');
}

// ---------- Saves ----------
suite('Save locking');
{
  assert(isLocked({ delCount: 0 }, { deletionCount: 1 }) === true, 'save from before a deletion is locked');
  assert(isLocked({ delCount: 1 }, { deletionCount: 1 }) === false, 'save after the deletion is fine');
  assert(isLocked(null, { deletionCount: 2 }) === false, 'empty slot is not locked');
  const st = { a: 1, nested: { b: [1, 2] } };
  const round = JSON.parse(JSON.stringify(structuredClone(st)));
  assert(round.nested.b[1] === 2, 'save state survives a JSON round trip');
}

// ---------- Refresh detection ----------
suite('Refresh detection');
{
  assert(wasRefreshedMidScene('reload', { scene: 'a2_poem' }) === true, 'reload mid-scene is caught');
  assert(wasRefreshedMidScene('navigate', { scene: 'a2_poem' }) === false, 'normal load is not');
  assert(wasRefreshedMidScene('reload', null) === false, 'reload on the title screen is not');
}

// ---------- The real script ----------
suite('Story files');
{
  try {
    const index = await (await fetch('script/index.json')).json();
    const files = await Promise.all(index.files.map(async (f) => ({ name: f, text: await (await fetch(`script/${f}`)).text() })));
    const characters = await (await fetch('data/characters.json')).json();
    const manifest = await (await fetch('assets/manifest.json')).json();
    const g = parseScripts(files, { characters, manifest });
    assert(g.errors.length === 0, `script parses with no errors${g.errors.length ? `: ${g.errors.map((e) => `${e.file}:${e.line} ${e.msg}`).join('; ')}` : ''}`);
    assert(!!g.scenes[index.start], `start scene "${index.start}" exists`);
    for (const id of ['end_stability', 'end_island', 'end_unhappy', 'end_citizen']) assert(!!g.scenes[id], `${id} exists`);
    const decks = await (await fetch('data/decks.json')).json();
    for (const d of ['day1', 'day2', 'day3', 'day4', 'day5']) assert(decks[d]?.tiles?.length >= 8, `deck ${d} has tiles`);
  } catch (err) {
    assert(false, `could not load story files: ${err.message}`);
  }
}

document.getElementById('sum').innerHTML = `<b class="${fail ? 'fail' : 'pass'}">${pass} passed, ${fail} failed</b>`;
window.__testResults = { pass, fail };
