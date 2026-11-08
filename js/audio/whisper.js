// The Voice reads the player's own slogans back to them with the browser's speech synthesis.
// Bernard's line about repetitions making one truth (p. 47), aimed at the player.
export function whisperSlogan(text, volume = 0.9) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.75;
    u.pitch = 0.6;
    u.volume = Math.max(0, Math.min(1, volume * 0.8));
    const voices = synth.getVoices().filter((v) => /^en/i.test(v.lang));
    const soft = voices.find((v) => /samantha|serena|karen|moira|female|zira|libby/i.test(v.name)) || voices[0];
    if (soft) u.voice = soft;
    synth.speak(u);
  } catch { /* text only */ }
}

export function stopWhisper() { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }
