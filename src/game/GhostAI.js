import { GAME_CONFIG } from '../config/gameConfig.js'
import { DIRECTIONS, REVERSE_DIRECTION } from '../entities/directions.js'

export class GhostAI {
  constructor (movement) {
    this.movement = movement
  }

  update (ghost, player, frightenedUntil, dt, now) {
    const { tileSize } = GAME_CONFIG
    if (this.movement.atCenter(ghost.x) && this.movement.atCenter(ghost.y)) {
      this.movement.snap(ghost)
      const gx = Math.round((ghost.x - tileSize / 2) / tileSize)
      const gy = Math.round((ghost.y - tileSize / 2) / tileSize)
      let options = Object.keys(DIRECTIONS).filter(dir => dir !== 'none' && this.movement.canMove(ghost.x, ghost.y, dir))
      const reverse = REVERSE_DIRECTION[ghost.dir]
      const forwardOptions = options.filter(dir => dir !== reverse)
      if (forwardOptions.length) options = forwardOptions

      if (options.length) {
        ghost.dir = this.chooseDirection(ghost, player, gx, gy, options, frightenedUntil > now)
      } else {
        ghost.dir = 'none'
        ghost.centerLock = false
      }
    }
    this.movement.move(ghost, ghost.speed, dt, false)
  }

  chooseDirection (ghost, player, gx, gy, options, frightened) {
    const { tileSize, columns, rows } = GAME_CONFIG
    const px = Math.round((player.x - tileSize / 2) / tileSize)
    const py = Math.round((player.y - tileSize / 2) / tileSize)
    const playerDir = DIRECTIONS[player.dir] || DIRECTIONS.none
    const target = { x: px, y: py }

    if (!frightened && ghost.personality === 'ambusher') {
      target.x = px + playerDir.x * 4
      target.y = py + playerDir.y * 4
    } else if (!frightened && ghost.personality === 'wanderer' && Math.random() < 0.45) {
      target.x = gx < columns / 2 ? columns - 3 : 3
      target.y = gy < rows / 2 ? rows - 3 : 3
    }

    let best = options[0]
    let bestDistance = frightened ? -Infinity : Infinity
    for (const dir of options) {
      const vector = DIRECTIONS[dir]
      const dx = gx + vector.x - target.x
      const dy = gy + vector.y - target.y
      const distance = dx * dx + dy * dy
      if ((frightened && distance > bestDistance) || (!frightened && distance < bestDistance)) {
        best = dir
        bestDistance = distance
      }
    }
    return best
  }
}
