export type SoundEffect = 'jump' | 'gem' | 'checkpoint' | 'hazard' | 'goal' | 'complete';

/** Lightweight synthesized audio with no external assets or autoplay side effects. */
export class AudioManager {
  private context: AudioContext | undefined;
  private master: GainNode | undefined;
  private music: GainNode | undefined;
  private musicTimer: number | undefined;

  public constructor(private enabled: boolean) {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  /** Call only from a player gesture. This is what unlocks the browser audio context. */
  public activate(): void {
    if (!this.enabled) return;
    if (!this.context) this.createContext();
    void this.context?.resume().then(() => this.startMusic());
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!this.context || !this.master) return;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(enabled ? 0.82 : 0, this.context.currentTime, 0.035);
    if (enabled) this.activate();
  }

  public play(effect: SoundEffect): void {
    const context = this.context;
    if (!this.enabled || !context || context.state !== 'running') return;
    const now = context.currentTime;
    if (effect === 'jump') this.tone(310, 0.085, now, 'sine', 0.13, 520);
    if (effect === 'gem') {
      this.tone(740, 0.09, now, 'triangle', 0.1);
      this.tone(990, 0.12, now + 0.075, 'triangle', 0.1);
    }
    if (effect === 'checkpoint') {
      this.tone(390, 0.12, now, 'sine', 0.12, 520);
      this.tone(650, 0.18, now + 0.1, 'sine', 0.11);
    }
    if (effect === 'hazard') this.tone(150, 0.2, now, 'sawtooth', 0.11, 95);
    if (effect === 'goal') {
      this.tone(523.25, 0.15, now, 'triangle', 0.13);
      this.tone(659.25, 0.17, now + 0.11, 'triangle', 0.13);
      this.tone(783.99, 0.24, now + 0.22, 'triangle', 0.13);
    }
    if (effect === 'complete') {
      this.tone(523.25, 0.15, now, 'sine', 0.12);
      this.tone(659.25, 0.16, now + 0.12, 'sine', 0.12);
      this.tone(783.99, 0.24, now + 0.24, 'sine', 0.14);
      this.tone(1046.5, 0.38, now + 0.37, 'triangle', 0.13);
    }
  }

  public dispose(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.stopMusic();
    void this.context?.close();
  }

  private createContext(): void {
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.enabled ? 0.82 : 0;
    this.master.connect(this.context.destination);
    this.music = this.context.createGain();
    this.music.gain.value = 0.12;
    this.music.connect(this.master);
  }

  private tone(frequency: number, duration: number, start: number, type: OscillatorType, volume: number, glideTo?: number): void {
    const context = this.context;
    const destination = this.master;
    if (!context || !destination) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  private startMusic(): void {
    if (!this.enabled || !this.context || !this.music || this.musicTimer !== undefined || document.hidden) return;
    this.playMusicPhrase();
    this.musicTimer = window.setInterval(() => this.playMusicPhrase(), 2400);
  }

  private stopMusic(): void {
    if (this.musicTimer === undefined) return;
    window.clearInterval(this.musicTimer);
    this.musicTimer = undefined;
  }

  private playMusicPhrase(): void {
    const context = this.context;
    const destination = this.music;
    if (!this.enabled || !context || !destination || context.state !== 'running' || document.hidden) return;
    const start = context.currentTime + 0.05;
    const phrase: Array<[number, number]> = [[261.63, 0], [329.63, 0.32], [392, 0.64], [329.63, 0.96], [293.66, 1.36], [349.23, 1.68]];
    phrase.forEach(([frequency, offset]) => this.musicTone(frequency, start + offset, destination));
  }

  private musicTone(frequency: number, start: number, destination: GainNode): void {
    const context = this.context;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
    oscillator.connect(gain).connect(destination);
    oscillator.start(start);
    oscillator.stop(start + 0.28);
  }

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stopMusic();
    else this.startMusic();
  };
}
