import { GAME_CONFIG } from "../config/gameConfig.js";

export class CollisionRules {
  constructor(levelState) {
    this.levelState = levelState;
  }

  collectPellet(player, score) {
    const { tileSize } = GAME_CONFIG;
    const col = Math.round((player.x - tileSize / 2) / tileSize);
    const row = Math.round((player.y - tileSize / 2) / tileSize);
    const pellet = this.levelState.map[row]?.[col];
    if (pellet !== "." && pellet !== "o") {
      return { score, levelCleared: false, pellet: null, points: 0 };
    }

    this.levelState.map[row][col] = " ";
    const points = pellet === "o" ? 50 : 10;
    return {
      score: score + points,
      levelCleared: this.isLevelCleared(),
      pellet,
      points,
    };
  }

  isLevelCleared() {
    return !this.levelState.map.some(
      (row) => row.includes(".") || row.includes("o"),
    );
  }

  isGhostCollision(player, ghost) {
    return (
      Math.hypot(player.x - ghost.x, player.y - ghost.y) <
      GAME_CONFIG.ghostCollisionDistance
    );
  }
}
