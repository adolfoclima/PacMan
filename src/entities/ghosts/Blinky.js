import { GAME_CONFIG } from "../../config/gameConfig.js";

export function createBlinky() {
  const { tileSize } = GAME_CONFIG;
  return {
    name: "Blinky",
    personality: "chaser",
    color: "#ff4b4b",
    x: 9.5 * tileSize,
    y: 10.5 * tileSize,
    dir: "left",
    speed: 78,
    lastDecision: "",
  };
}
