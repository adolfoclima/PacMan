export class GameLoop {
  constructor(update) {
    this.update = update;
    this.animationFrame = null;
    this.lastTime = 0;
    this.running = true;
  }

  start() {
    this.stop();
    this.running = true;
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame((now) => this.frame(now));
  }

  frame(now) {
    if (!this.running) return;
    const delta = Math.min((now - this.lastTime) / 1000 || 0, 0.033);
    this.lastTime = now;
    this.update(delta, now);
    if (!this.running) {
      this.animationFrame = null;
      return;
    }
    this.animationFrame = requestAnimationFrame((time) => this.frame(time));
  }

  pause() {
    this.running = false;
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  resume() {
    if (this.running) return;
    this.start();
  }

  stop() {
    this.running = false;
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }
}
