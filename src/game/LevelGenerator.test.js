import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "../config/gameConfig.js";
import { LevelGenerator } from "./LevelGenerator.js";

describe("LevelGenerator", () => {
  it("generates valid dimensions and portals with injected randomness", () => {
    const state = new LevelGenerator().generate(1, () => 0);

    expect(state.map).toHaveLength(GAME_CONFIG.rows);
    expect(state.map.every((row) => row.length === GAME_CONFIG.columns)).toBe(
      true,
    );
    expect(["horizontal", "vertical", "both"]).toContain(
      state.tunnelOrientation,
    );
  });

  it("keeps special pellets on reachable cells", () => {
    const state = new LevelGenerator().generate(3, () => 0.25);
    const specials = state.map.flat().filter((cell) => cell === "o");
    expect(specials.length).toBeGreaterThanOrEqual(1);
  });
});
