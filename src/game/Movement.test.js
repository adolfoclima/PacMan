import { describe, expect, it } from "@jest/globals";
import { GAME_CONFIG } from "../config/gameConfig.js";
import { Movement } from "./Movement.js";

function createLevelState(tunnelOrientation = "horizontal") {
  return {
    map: Array.from({ length: GAME_CONFIG.rows }, () =>
      Array(GAME_CONFIG.columns).fill("#"),
    ),
    tunnelOrientation,
    tunnelVerticalCol: 10,
  };
}

describe("Movement", () => {
  it("allows movement through horizontal portals", () => {
    const levelState = createLevelState("horizontal");
    for (let col = 0; col < GAME_CONFIG.columns; col++) {
      levelState.map[10][col] = ".";
    }
    const movement = new Movement(levelState, { wall() {} });
    const x = GAME_CONFIG.tileSize / 2;
    const y = 10.5 * GAME_CONFIG.tileSize;

    expect(movement.canMove(x, y, "left")).toBe(true);
  });

  it("rejects movement into walls", () => {
    const levelState = createLevelState("horizontal");
    const movement = new Movement(levelState, { wall() {} });
    const x = 10.5 * GAME_CONFIG.tileSize;
    const y = 10.5 * GAME_CONFIG.tileSize;

    expect(movement.canMove(x, y, "up")).toBe(false);
  });

  it("allows vertical portals only on the configured column", () => {
    const levelState = createLevelState("vertical");
    const movement = new Movement(levelState, { wall() {} });
    const x = 10.5 * GAME_CONFIG.tileSize;
    const y = GAME_CONFIG.tileSize / 2;

    expect(movement.canMove(x, y, "up")).toBe(true);
    expect(movement.canMove(GAME_CONFIG.tileSize / 2, y, "up")).toBe(false);
  });
});
