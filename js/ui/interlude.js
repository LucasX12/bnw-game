// Night interludes: deep blue, interior monologue, no soma.
import { config } from '../config.js';
import { emit } from '../bus.js';
import { setStageClass, stageEl } from '../stage/stage.js';
import * as sprites from '../stage/sprites.js';

export function enter(id) {
  setStageClass('interlude', true);
  stageEl().style.setProperty('--accent', config.characters[id]?.accent || '#E9D7A6');
  sprites.clear();
  sprites.show(id, 'neutral', 'far-left');
  emit('mode:changed', 'interlude');
}

export function exit() {
  setStageClass('interlude', false);
  sprites.clear();
  emit('mode:changed', 'normal');
}
