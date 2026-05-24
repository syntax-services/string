import { useEffect } from "react";

// ============================================================================
// WEB AUDIO API HIGH-FIDELITY SYNTHESIZER ENGINE FOR STRING
// Generates pristine, zero-delay sound signals directly in-browser.
// ============================================================================

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // Lazy initialisation to comply with browser autoplay policies
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Helper to resume suspended context (blocked by autoplay policy)
async function resumeContext(ctx: AudioContext): Promise<boolean> {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      return true;
    } catch (e) {
      console.warn("AudioContext resume blocked:", e);
      return false;
    }
  }
  return true;
}

/**
 * Play a sparkling double-ring coin chime representing a marketplace order.
 */
export async function playOrderChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const now = ctx.currentTime;

  const playCoinRing = (timeOffset: number, freq1: number, freq2: number) => {
    // Create twin oscillators for rich metallic shimmer
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(freq1, now + timeOffset);
    osc2.frequency.setValueAtTime(freq2, now + timeOffset);

    // Apply frequency sweep vibrato
    osc1.frequency.exponentialRampToValueAtTime(freq1 * 1.05, now + timeOffset + 0.35);

    gainNode.gain.setValueAtTime(0, now + timeOffset);
    gainNode.gain.linearRampToValueAtTime(0.3, now + timeOffset + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now + timeOffset);
    osc2.start(now + timeOffset);

    osc1.stop(now + timeOffset + 0.5);
    osc2.stop(now + timeOffset + 0.5);
  };

  // Ring twice in rapid succession: "Cha-ching!"
  playCoinRing(0, 987.77, 1567.98); // B5 and G6
  playCoinRing(0.08, 1318.51, 1975.53); // E6 and B6
}

/**
 * Play a luxurious, warm ambient chord sweep representing premium smart matchmaking or boosts.
 */
export async function playPremiumMatchChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const now = ctx.currentTime;
  const duration = 1.6;

  // Premium chord frequencies (Major 7th: C5 - E5 - G5 - B5)
  const chord = [523.25, 659.25, 783.99, 987.77];

  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    // Subtle detune to broaden the stereo field
    osc.detune.setValueAtTime((idx - 1.5) * 8, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + duration);

    // Warm soft pad envelope (gentle attack, slow decay)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.25); // 250ms attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  });
}

/**
 * Play a crisp, high-tempo dual beep alert for instant chat messages and bids.
 */
export async function playChatAlert() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const now = ctx.currentTime;

  const playBlip = (timeOffset: number, freq: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + timeOffset);

    gainNode.gain.setValueAtTime(0, now + timeOffset);
    gainNode.gain.linearRampToValueAtTime(0.15, now + timeOffset + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.08);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + 0.1);
  };

  playBlip(0, 880); // A5
  playBlip(0.06, 1100); // C#6
}

/**
 * Play a triumphant, ascending arpeggio for location verification approval.
 */
export async function playVerificationChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const timeOffset = idx * 0.06;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + timeOffset);

    gainNode.gain.setValueAtTime(0, now + timeOffset);
    gainNode.gain.linearRampToValueAtTime(0.2, now + timeOffset + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.35);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + 0.4);
  });
}

/**
 * Play a dull, low-frequency warning dual pulse for cancellations or premium revocation alerts.
 */
export async function playRevokedChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const now = ctx.currentTime;

  const playDullPulse = (timeOffset: number) => {
    // Dissonant low alarm frequencies
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "sine";
    osc2.type = "sawtooth";

    osc1.frequency.setValueAtTime(220, now + timeOffset); // A3
    osc2.frequency.setValueAtTime(180, now + timeOffset); // Dissonant F#3-ish

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, now + timeOffset);

    gainNode.gain.setValueAtTime(0, now + timeOffset);
    gainNode.gain.linearRampToValueAtTime(0.25, now + timeOffset + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.22);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now + timeOffset);
    osc2.start(now + timeOffset);

    osc1.stop(now + timeOffset + 0.35);
    osc2.stop(now + timeOffset + 0.35);
  };

  playDullPulse(0);
  playDullPulse(0.2);
}

/**
 * Standard hook for components to play audio signals easily,
 * locking context initialization to user gestures automatically.
 */
export function useAudioSignals() {
  useEffect(() => {
    const unlockAudio = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().then(() => {
          // Remove event listeners once unlocked
          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("touchstart", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);
        });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("click", unlockAudio);
      window.addEventListener("touchstart", unlockAudio);
      window.addEventListener("keydown", unlockAudio);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      }
    };
  }, []);

  return {
    playOrderChime,
    playPremiumMatchChime,
    playChatAlert,
    playVerificationChime,
    playRevokedChime
  };
}
