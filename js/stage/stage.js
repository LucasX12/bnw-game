// Stage scaling, act classes and colour drain.
export const $ = (sel) => document.querySelector(sel);
export const stageEl = () => document.getElementById('stage');

export function initStage() {
  const fit = () => {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stageEl().style.setProperty('--s', String(s));
  };
  fit();
  window.addEventListener('resize', fit);
}

export function setAct(n) {
  const st = stageEl();
  st.classList.remove('act-1', 'act-2', 'act-3');
  st.classList.add(`act-${n}`);
}

export function setDrain(x, ms = 0) {
  const st = stageEl();
  st.style.setProperty('--drain-ms', `${ms}ms`);
  st.style.setProperty('--drain', String(Math.max(0, Math.min(1, x))));
}

export function setStageClass(name, on) { stageEl().classList.toggle(name, on); }

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
