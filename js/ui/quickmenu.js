// AUTO, SKIP, LOG, SAVE, RECORDS, SETTINGS under the text box.
import { on } from '../bus.js';
import { el } from '../stage/stage.js';

let nav; const btns = {};
let mode = 'normal';
let visible = false;

export function mount(ui, handlers) {
  nav = el('nav', 'quickmenu');
  nav.setAttribute('aria-label', 'Quick menu');
  for (const [key, label] of [['auto', 'AUTO'], ['skip', 'SKIP'], ['log', 'LOG'], ['save', 'SAVE'], ['records', 'RECORDS'], ['settings', 'SETTINGS']]) {
    const b = el('button', null, label);
    b.type = 'button';
    b.onclick = (ev) => { ev.stopPropagation(); b.blur(); handlers[key]?.(); };
    btns[key] = b;
    nav.appendChild(b);
  }
  ui.appendChild(nav);
  on('dialogue:modes', ({ auto, skipping }) => {
    btns.auto.classList.toggle('on', auto);
    btns.skip.classList.toggle('on', skipping);
    btns.auto.setAttribute('aria-pressed', String(auto));
    btns.skip.setAttribute('aria-pressed', String(skipping));
  });
  on('mode:changed', (m) => { mode = m; render(); });
  render();
}

function render() {
  if (!nav) return;
  nav.hidden = !visible;
  for (const [k, b] of Object.entries(btns)) b.hidden = mode === 'interlude' && k !== 'log';
}

export function setVisible(v) { visible = v; render(); }
