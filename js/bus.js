// Tiny event bus so modules can talk without importing each other.
const handlers = {};

export function on(event, fn) {
  (handlers[event] ||= []).push(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  handlers[event] = (handlers[event] || []).filter((f) => f !== fn);
}

export function emit(event, payload) {
  for (const fn of (handlers[event] || []).slice()) {
    try { fn(payload); } catch (err) { console.error(`[bus] ${event}`, err); }
  }
}
