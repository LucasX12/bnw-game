// Choice menu. Disabled options show greyed out with a caption.
import { el, esc } from '../stage/stage.js';

let pending = null;
let wrap = null;

export function show(options, mode) {
  return new Promise((resolve) => {
    cancel();
    wrap = el('div', mode === 'terminal' ? 'choices term' : 'choices');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Choices');
    for (const o of options) {
      const b = el('button', null, `${esc(o.text)}${o.caption ? `<span class="cap">${esc(o.caption)}</span>` : ''}`);
      b.type = 'button';
      if (!o.enabled) b.disabled = true;
      else b.onclick = (ev) => { ev.stopPropagation(); finish(o); };
      wrap.appendChild(b);
    }
    document.getElementById('ui').appendChild(wrap);
    pending = { resolve };
    setTimeout(() => wrap?.querySelector('button:not([disabled])')?.focus(), 0);
  });
}

function finish(value) {
  const p = pending;
  pending = null;
  wrap?.remove();
  wrap = null;
  p?.resolve(value);
}

export function cancel() { if (pending) finish(null); }
export function pick(n) {
  if (!pending) return;
  const b = wrap.querySelectorAll('button')[n - 1];
  if (b && !b.disabled) b.click();
}
export const active = () => !!pending;
