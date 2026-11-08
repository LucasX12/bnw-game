// A stack of modal overlays. Esc closes the top one; focus stays inside it.
import { el } from '../stage/stage.js';

const stack = [];

export function openOverlay(content, { dark = false, closable = true, onClose } = {}) {
  const ov = el('div', `overlay${dark ? ' dark' : ''}`);
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.appendChild(content);
  document.getElementById('ui').appendChild(ov);
  const entry = { ov, closable, onClose, prevFocus: document.activeElement };
  stack.push(entry);
  setTimeout(() => (ov.querySelector('[autofocus]') || ov.querySelector('button:not([disabled]), input, select'))?.focus(), 0);
  entry.close = () => {
    const i = stack.indexOf(entry);
    if (i < 0) return;
    stack.splice(i, 1);
    ov.remove();
    try { entry.prevFocus?.focus?.(); } catch { /* ignore */ }
    onClose?.();
  };
  return entry.close;
}

export function closeTop() {
  const e = stack.at(-1);
  if (e && e.closable) { e.close(); return true; }
  return !!e;
}

export function closeAll() { while (stack.length) stack.at(-1).close(); }
export const overlayOpen = () => stack.length > 0;

// Keeps Tab inside the top overlay.
export function trapTab(ev) {
  const e = stack.at(-1);
  if (!e || ev.key !== 'Tab') return;
  const f = [...e.ov.querySelectorAll('button:not([disabled]), input:not([disabled]), select, [tabindex="0"]')];
  if (!f.length) return;
  const i = f.indexOf(document.activeElement);
  const next = ev.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1);
  ev.preventDefault();
  f[next].focus();
}
