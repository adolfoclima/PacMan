import { describe, expect, it } from "@jest/globals";
import { getGhostTarget } from "./ghostBehaviors.js";

describe("getGhostTarget", () => {
  const player = { x: 252, y: 396, dir: "left" };
  const ghosts = [{ name: "Blinky", x: 228, y: 252 }];

  it("targets the player for a chaser", () => {
    expect(
      getGhostTarget({ personality: "chaser" }, player, ghosts, 9, 10),
    ).toMatchObject({
      x: 10,
      y: 16,
    });
  });

  it("uses a fallback target for unknown personalities", () => {
    const target = getGhostTarget(
      { personality: "unknown" },
      player,
      ghosts,
      2,
      2,
    );
    expect(target).toEqual({ x: 18, y: 18 });
  });
});
