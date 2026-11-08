import { describe, expect, it } from "@jest/globals";
import { GAME_CONFIG } from "../config/gameConfig.js";
import { CollisionRules } from "./CollisionRules.js";

function levelState(map) {
  return { map };
}

describe("CollisionRules", () => {
  it("collects a normal pellet and awards points", () => {
    const state = levelState([["."]]);
    const rules = new CollisionRules(state);
    const player = { x: GAME_CONFIG.tileSize / 2, y: GAME_CONFIG.tileSize / 2 };

    const result = rules.collectPellet(player, 100);

    expect(result.points).toBe(10);
    expect(result.score).toBe(110);
    expect(result.pellet).toBe(".");
    expect(result.levelCleared).toBe(true);
  });

  it("collects a special pellet and awards bonus points", () => {
    const state = levelState([["o"]]);
    const rules = new CollisionRules(state);
    const player = { x: GAME_CONFIG.tileSize / 2, y: GAME_CONFIG.tileSize / 2 };

    const result = rules.collectPellet(player, 0);

    expect(result.points).toBe(50);
    expect(result.score).toBe(50);
  });

  it("does not collect an empty cell", () => {
    const state = levelState([[" "]]);
    const rules = new CollisionRules(state);
    const player = { x: GAME_CONFIG.tileSize / 2, y: GAME_CONFIG.tileSize / 2 };

    expect(rules.collectPellet(player, 10)).toMatchObject({
      score: 10,
      levelCleared: false,
      pellet: null,
      points: 0,
    });
  });
});
