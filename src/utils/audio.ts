import { DialogueLine } from '../types/toefl';

/**
 * Resilient Built-in Speech Engine for TOEFL Listening & Speaking Prompts.
 * Uses the browser's built-in Web Speech API with multi-speaker pitch/voice differentiation,
 * plus graceful fallback timer playback if system voices are unavailable.
 */

export interface PlaybackCallbacks {
  onStart?: () => void;
  onProgress?: (pct: number, activeLineIndex: number) => void;
  onEnd?: () => void;
  onError?: (msg: string) => void;
}

class AudioController {
  private activeTimer: number | null = null;
  private isCancelled = false;
  private currentAudioEl: HTMLAudioElement | null = null;

  stop() {
    this.isCancelled = true;
    if (this.activeTimer !== null) {
      window.clearInterval(this.activeTimer);
      this.activeTimer = null;
    }
    if (this.currentAudioEl) {
      this.currentAudioEl.pause();
      this.currentAudioEl = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore synthesis cancel errors
      }
    }
  }

  private pickVoice(role: DialogueLine['voiceRole']): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
    if (voices.length === 0) return null;

    const femaleHints = ['Samantha', 'Victoria', 'Karen', 'Google US English', 'Zira', 'Female', 'Aria'];
    const maleHints = ['Daniel', 'Alex', 'David', 'Google UK English Male', 'Guy', 'Male', 'Fred'];

    const preferFemale = role === 'female-academic' || role === 'student-female';
    const hints = preferFemale ? femaleHints : maleHints;

    for (const h of hints) {
      const found = voices.find((v) => v.name.includes(h));
      if (found) return found;
    }
    if (role === 'announcer' && voices.length > 1) return voices[1];
    return voices[preferFemale ? 0 : Math.min(1, voices.length - 1)];
  }

  private rolePitch(role: DialogueLine['voiceRole']): number {
    switch (role) {
      case 'female-academic':
        return 1.06;
      case 'student-female':
        return 1.14;
      case 'male-academic':
        return 0.92;
      case 'student-male':
        return 0.98;
      default:
        return 1.0;
    }
  }

  playScript(
    lines: DialogueLine[],
    options: { rate?: number; volume?: number } = {},
    callbacks: PlaybackCallbacks = {}
  ) {
    this.stop();
    this.isCancelled = false;
    const rate = options.rate ?? 1.0;
    const volume = options.volume ?? 1.0;

    const totalWords = Math.max(
      1,
      lines.reduce((sum, l) => sum + l.text.split(/\s+/).length, 0)
    );
    const estimatedTotalMs = Math.max(2500, ((totalWords / 2.4) * 1000) / rate);

    const hasSpeech =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined';

    callbacks.onStart?.();

    const startTime = Date.now();
    let currentLineIdx = 0;

    this.activeTimer = window.setInterval(() => {
      if (this.isCancelled) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min(98, Math.round((elapsed / estimatedTotalMs) * 100));
      callbacks.onProgress?.(pct, currentLineIdx);
    }, 120);

    if (!hasSpeech) {
      // Graceful timed playback fallback (never shows a broken audio player)
      window.setTimeout(() => {
        if (this.isCancelled) return;
        this.stop();
        callbacks.onProgress?.(100, lines.length - 1);
        callbacks.onEnd?.();
      }, estimatedTotalMs);
      return;
    }

    const speakNext = (index: number) => {
      if (this.isCancelled) return;
      if (index >= lines.length) {
        if (this.activeTimer !== null) {
          window.clearInterval(this.activeTimer);
          this.activeTimer = null;
        }
        callbacks.onProgress?.(100, lines.length - 1);
        callbacks.onEnd?.();
        return;
      }

      currentLineIdx = index;
      const line = lines[index];
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.volume = volume;
      utterance.pitch = this.rolePitch(line.voiceRole);
      const v = this.pickVoice(line.voiceRole);
      if (v) utterance.voice = v;

      utterance.onend = () => {
        if (!this.isCancelled) speakNext(index + 1);
      };
      utterance.onerror = () => {
        if (!this.isCancelled) speakNext(index + 1);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        speakNext(index + 1);
      }
    };

    speakNext(0);
  }

  speakWord(word: string, rate = 0.95) {
    this.playScript([{ speaker: 'Dictionary', voiceRole: 'female-academic', text: word }], { rate });
  }

  /**
   * Short subtle acoustic tone for equipment check / UI cues
   */
  playChime(type: 'check' | 'correct' | 'complete' = 'check') {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const now = ctx.currentTime;
      if (type === 'check') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.14);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'correct') {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.28);
      } else {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        osc.frequency.setValueAtTime(783.99, now + 0.24);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.58);
      }
    } catch {
      // AudioContext blocked before gesture; safely ignore
    }
  }
}

export const audioController = new AudioController();
