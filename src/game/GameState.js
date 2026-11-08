export const GAME_STATES = Object.freeze({
  READY: "ready",
  RUNNING: "running",
  LIFE_LOST: "life-lost",
  PAUSED: "paused",
  LEVEL_COMPLETE: "level-complete",
  GAME_OVER: "game-over",
});

export class GameState {
  constructor(initialState = GAME_STATES.READY) {
    this.current = initialState;
    this.previous = null;
    this.pausedState = null;
  }

  set(state) {
    if (!Object.values(GAME_STATES).includes(state)) {
      throw new Error(`Invalid game state: ${state}`);
    }
    this.previous = this.current;
    this.current = state;
  }

  is(state) {
    return this.current === state;
  }

  pause() {
    if (this.is(GAME_STATES.RUNNING) || this.is(GAME_STATES.LIFE_LOST)) {
      this.pausedState = this.current;
      this.set(GAME_STATES.PAUSED);
    }
  }

  resume() {
    if (this.is(GAME_STATES.PAUSED)) {
      const state = this.pausedState ?? GAME_STATES.READY;
      this.pausedState = null;
      this.set(state);
    }
  }
}
