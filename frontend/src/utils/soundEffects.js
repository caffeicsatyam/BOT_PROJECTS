/**
 * Web Audio API Comic Sound Synthesizer & Visual Pop-Art Engine
 * 100% Client-side, zero external files, instantaneous cartoon/comic sound effects.
 */

class ComicSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.listeners = new Set();
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    this.listeners.forEach(cb => cb(this.enabled));
    return this.enabled;
  }

  onToggle(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Determine category from sound effect text (e.g. "BAM!", "WHOOSH!", "ZAP!", "KRAK-THOOM!")
  categorize(sfxText) {
    const text = (sfxText || '').toUpperCase();
    if (/THOOM|THUNDER|BOOM|BLAST|ROAR|RUMBLE|DETONAT|KRAK/.test(text)) return 'thunder';
    if (/ZAP|PEW|BEAM|LASER|SPARK|SHOCK|VOLT|SIZZLE|BZZZT/.test(text)) return 'laser';
    if (/WHOOSH|SWOOSH|ZOOM|WHIRR|WIND|FLY|DASH|SKRRRT|VROOOM/.test(text)) return 'whoosh';
    if (/CLANG|CLACK|BONK|SNAP|CLICK|TINK|CRUNCH/.test(text)) return 'clang';
    if (/SPLAT|SQUISH|SLOSH|BLOB|OOZE/.test(text)) return 'splat';
    if (/POP|BING|DING|SPARKLE|CHIME|MAGIC|PING|GASP/.test(text)) return 'chime';
    // Default punch / comic impact (BAM, POW, KAPOW, CRASH, THUD, SMASH)
    return 'impact';
  }

  // Visual color themes tailored for each SFX category
  getVisualTheme(sfxText) {
    const cat = this.categorize(sfxText);
    switch (cat) {
      case 'thunder':
        return {
          gradient: 'from-amber-400 via-rose-600 to-purple-800',
          shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)]',
          border: 'border-yellow-300',
          textColor: 'text-yellow-100',
          emoji: '⚡'
        };
      case 'laser':
        return {
          gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
          shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.6)]',
          border: 'border-cyan-200',
          textColor: 'text-cyan-50',
          emoji: '💥'
        };
      case 'whoosh':
        return {
          gradient: 'from-teal-400 via-emerald-500 to-sky-600',
          shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
          border: 'border-emerald-200',
          textColor: 'text-emerald-50',
          emoji: '💨'
        };
      case 'clang':
        return {
          gradient: 'from-slate-200 via-zinc-400 to-amber-500',
          shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
          border: 'border-white',
          textColor: 'text-slate-900',
          emoji: '🛡️'
        };
      case 'splat':
        return {
          gradient: 'from-lime-400 via-green-500 to-emerald-700',
          shadow: 'shadow-[0_0_15px_rgba(132,204,22,0.6)]',
          border: 'border-lime-200',
          textColor: 'text-lime-950',
          emoji: '🧪'
        };
      case 'chime':
        return {
          gradient: 'from-pink-400 via-purple-500 to-indigo-500',
          shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]',
          border: 'border-pink-200',
          textColor: 'text-pink-50',
          emoji: '✨'
        };
      case 'impact':
      default:
        return {
          gradient: 'from-yellow-400 via-orange-500 to-red-600',
          shadow: 'shadow-[0_0_18px_rgba(239,68,68,0.6)]',
          border: 'border-yellow-200',
          textColor: 'text-white',
          emoji: '🔥'
        };
    }
  }

  play(sfxText) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const category = this.categorize(sfxText);

    switch (category) {
      case 'thunder':
        this.playThunder();
        break;
      case 'laser':
        this.playLaser();
        break;
      case 'whoosh':
        this.playWhoosh();
        break;
      case 'clang':
        this.playClang();
        break;
      case 'splat':
        this.playSplat();
        break;
      case 'chime':
        this.playChime();
        break;
      case 'impact':
      default:
        this.playImpact();
        break;
    }
  }

  // BAM! POW! KAPOW! Punch Impact
  playImpact() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Sub-bass kick oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.22);

    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);

    // Punchy noise burst for crunch/snap
    const bufferSize = ctx.sampleRate * 0.14;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(120, now + 0.14);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.55, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
  }

  // KRAK-THOOM! Massive thunderclap & detonation
  playThunder() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Deep low rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + 0.45);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);

    // Crackle noise burst
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.4);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
  }

  // ZAP! PEW! Comic Laser & Energy Shock
  playLaser() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  // WHOOSH! SWOOSH! Speed Swoosh
  playWhoosh() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.28;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.5;
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.13);
    filter.frequency.exponentialRampToValueAtTime(280, now + 0.28);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.13);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // CLANG! Metal collision & shield deflection
  playClang() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(460, now);
    osc2.frequency.setValueAtTime(890, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.33);
    osc2.stop(now + 0.33);
  }

  // SPLAT! Cartoon slime / puddle impact
  playSplat() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  // BING! Cartoon Pop Chime & Discovery Sparkle
  playChime() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(739.99, now + 0.07); // F#5
    osc.frequency.setValueAtTime(880.00, now + 0.14); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.21); // D6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.39);
  }
}

export const comicSound = new ComicSoundEngine();
