export class AudioService {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.ambientOscillators = [];
    this.enabled = true;
    this.normalPelletTone = false;
  }

  ensureContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.context) {
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.45;
      this.masterGain.connect(this.context.destination);
    }
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  }

  tone(frequency, duration = 0.08, type = "square", volume = 0.12, delay = 0) {
    if (!this.enabled || !this.ensureContext()) return;
    const startAt = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  }

  notes(frequencies, duration = 0.08, type = "square", volume = 0.12) {
    frequencies.forEach((frequency, index) =>
      this.tone(frequency, duration, type, volume, index * duration),
    );
  }

  menu() {
    this.notes([440, 554, 659], 0.07, "triangle", 0.1);
  }
  gameStart() {
    this.notes([220, 330, 440, 660], 0.09, "square", 0.1);
  }
  wall() {
    this.tone(95, 0.035, "square", 0.05);
  }
  portal() {
    this.notes([220, 330], 0.04, "sine", 0.08);
  }
  specialPellet() {
    this.notes([220, 277, 330, 440], 0.09, "square", 0.1);
  }
  normalPellet() {
    this.normalPelletTone = !this.normalPelletTone;
    this.tone(this.normalPelletTone ? 180 : 260, 0.045, "square", 0.055);
  }
  ghostEaten() {
    this.notes([880, 660, 990], 0.07, "square", 0.12);
  }
  lifeLost() {
    this.notes([440, 370, 300, 220, 110], 0.12, "sawtooth", 0.12);
  }
  gameOver() {
    this.notes([392, 330, 262, 196, 131], 0.18, "sawtooth", 0.13);
  }
  levelComplete() {
    this.notes([523, 659, 784, 1047], 0.12, "triangle", 0.14);
  }
  direction(name) {
    this.tone(
      { up: 220, down: 196, left: 165, right: 247 }[name] || 220,
      0.025,
      "sine",
      0.025,
    );
  }

  startAmbient() {
    if (!this.enabled || this.ambientGain) return;
    this.ensureContext();
    if (!this.context) return;
    this.ambientGain = this.context.createGain();
    this.ambientGain.gain.value = 0.018;
    this.ambientGain.connect(this.masterGain);
    for (const frequency of [55, 82.4]) {
      const oscillator = this.context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(this.ambientGain);
      oscillator.start();
      this.ambientOscillators.push(oscillator);
    }
  }

  stopAmbient() {
    if (!this.ambientGain) return;
    this.ambientOscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        return;
      }
    });
    this.ambientOscillators = [];
    this.ambientGain.disconnect();
    this.ambientGain = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stopAmbient();
  }

  async destroy() {
    this.stopAmbient();
    if (this.context && this.context.state !== "closed") {
      await this.context.close();
    }
    this.context = null;
    this.masterGain = null;
  }
}
