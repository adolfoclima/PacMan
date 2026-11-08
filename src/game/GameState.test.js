import { describe, expect, it } from "vitest";
import { GAME_STATES, GameState } from "./GameState.js";

describe("GameState", () => {
  it("starts in ready state", () => {
    expect(new GameState().current).toBe(GAME_STATES.READY);
  });

  it("pauses and resumes running", () => {
    const state = new GameState(GAME_STATES.RUNNING);
    state.pause();
    expect(state.current).toBe(GAME_STATES.PAUSED);
    state.resume();
    expect(state.current).toBe(GAME_STATES.RUNNING);
  });

  it("pauses and resumes life lost state", () => {
    const state = new GameState(GAME_STATES.LIFE_LOST);
    state.pause();
    expect(state.current).toBe(GAME_STATES.PAUSED);
    state.resume();
    expect(state.current).toBe(GAME_STATES.LIFE_LOST);
  });

  it("rejects unknown states", () => {
    const state = new GameState();
    expect(() => state.set("unknown")).toThrow("Invalid game state");
  });
});
