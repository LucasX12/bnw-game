// Local time helpers so Mond can comment on the hour.
import { config } from '../config.js';

const WORDS = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

export function get(key, d = new Date()) {
  const h = d.getHours(); const m = d.getMinutes();
  switch (key) {
    case 'late': { const [a, b] = config.tuning.lateNight || [0, 5]; return h >= a && h < b; }
    case 'time': return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`;
    case 'hour': return h;
    case 'hourWords': {
      const part = h < 12 ? 'in the morning' : h < 17 ? 'in the afternoon' : h < 21 ? 'in the evening' : 'at night';
      return `past ${WORDS[h % 12]} ${part}`;
    }
    default: return undefined;
  }
}
