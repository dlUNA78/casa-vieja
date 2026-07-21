/**
 * sounds.ts — Notificaciones sonoras para el POS Casa Vieja
 * Usa la Web Audio API; no requiere archivos de audio externos.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Reanudar contexto si el navegador lo suspendió (política de autoplay)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Toca una nota simple con envolvente (attack + decay).
 */
function playTone(
  freq: number,
  startTime: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'sine'
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);   // attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // decay

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// ─── Sonido 1: Mesero conectado ───────────────────────────────────────────────
// Acorde ascendente suave tipo "ding-dong" (Do → Mi → Sol)
export function playWaiterConnected() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  playTone(523.25, now,        0.5, 0.25, 'sine'); // C5
  playTone(659.25, now + 0.15, 0.5, 0.22, 'sine'); // E5
  playTone(783.99, now + 0.30, 0.7, 0.20, 'sine'); // G5
}

// ─── Sonido 2: Nueva orden recibida ──────────────────────────────────────────
// Triple ding urgente con un toque metálico (triangle)
export function playNewOrder() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  playTone(880,    now,        0.15, 0.28, 'triangle'); // A5
  playTone(1174.7, now + 0.16, 0.15, 0.26, 'triangle'); // D6
  playTone(1479.98, now + 0.32, 0.30, 0.22, 'triangle'); // F#6
  playTone(440, now + 0.32, 0.45, 0.10, 'sine'); // apoyo grave
}
