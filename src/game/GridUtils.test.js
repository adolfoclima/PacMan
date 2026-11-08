import { describe, expect, it } from "@jest/globals";
import { GAME_CONFIG } from "../config/gameConfig.js";
import { isAtGridCenter, toGridIndex, toWorld } from "./GridUtils.js";

describe("GridUtils", () => {
  it("converts world values to grid indexes", () => {
    expect(toGridIndex(GAME_CONFIG.tileSize / 2)).toBe(0);
    expect(toGridIndex(10.5 * GAME_CONFIG.tileSize)).toBe(10);
  });

  it("converts grid indexes back to world centers", () => {
    expect(toWorld(10)).toBe(10.5 * GAME_CONFIG.tileSize);
  });

  it("detects grid centers", () => {
    expect(isAtGridCenter(10.5 * GAME_CONFIG.tileSize)).toBe(true);
    expect(isAtGridCenter(11 * GAME_CONFIG.tileSize)).toBe(false);
  });
});
