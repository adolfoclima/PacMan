import { GAME_CONFIG } from '../config/gameConfig.js'
import { DIRECTIONS } from '../entities/directions.js'

export function getGhostTarget (ghost, player, ghosts, gx, gy) {
  const { tileSize, columns, rows } = GAME_CONFIG
  const playerX = Math.round((player.x - tileSize / 2) / tileSize)
  const playerY = Math.round((player.y - tileSize / 2) / tileSize)
  const playerDirection = DIRECTIONS[player.dir] || DIRECTIONS.none

  switch (ghost.personality) {
    case 'chaser':
      return { x: playerX, y: playerY }
    case 'ambusher':
      return {
        x: playerX + playerDirection.x * 4,
        y: playerY + playerDirection.y * 4
      }
    case 'flanker': {
      const blinky = ghosts.find(candidate => candidate.name === 'Blinky')
      const blinkyX = blinky
        ? Math.round((blinky.x - tileSize / 2) / tileSize)
        : playerX
      const blinkyY = blinky
        ? Math.round((blinky.y - tileSize / 2) / tileSize)
        : playerY
      const pivotX = playerX + playerDirection.x * 2
      const pivotY = playerY + playerDirection.y * 2
      return {
        x: pivotX * 2 - blinkyX,
        y: pivotY * 2 - blinkyY
      }
    }
    case 'shy': {
      const distance = Math.hypot(gx - playerX, gy - playerY)
      return distance > 8
        ? { x: playerX, y: playerY }
        : { x: 1, y: rows - 2 }
    }
    default:
      return {
        x: gx < columns / 2 ? columns - 3 : 3,
        y: gy < rows / 2 ? rows - 3 : 3
      }
  }
}
