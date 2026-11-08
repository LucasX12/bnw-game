// Content warning, phone gate and the script error screen.
import { el, esc } from '../stage/stage.js';

export function isPhone() {
  try {
    return matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.screen?.width || window.innerWidth) < 900;
  } catch { return false; }
}

export function phoneGate() {
  const g = el('div', 'gate', "<h1>Everybody's Happy Now</h1><p>Please play on a laptop or desktop browser.</p>");
  document.getElementById('ui').appendChild(g);
}

export function contentWarning() {
  return new Promise((resolve) => {
    const g = el('div', 'gate', '<h1>Content warning</h1><p>This game contains psychological horror, including manipulation of the player, unsettling imagery, and references to drug use and death. It contains no gore.</p><button class="btn primary" type="button">I understand</button>');
    g.setAttribute('role', 'dialog');
    document.getElementById('ui').appendChild(g);
    const b = g.querySelector('button');
    setTimeout(() => b.focus(), 50);
    b.onclick = (ev) => { ev.stopPropagation(); g.remove(); resolve(); };
  });
}

export function showErrors(title, items, hint = '') {
  const box = el('div', 'errors', `<h2>${esc(title)}</h2>${hint ? `<p>${esc(hint)}</p>` : ''}<ul>${items.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`);
  document.getElementById('ui').appendChild(box);
}
