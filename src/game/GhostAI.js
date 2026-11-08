import { GAME_CONFIG } from '../config/gameConfig.js'
import { DIRECTIONS, REVERSE_DIRECTION } from '../entities/directions.js'
import { getGhostTarget } from './ghostBehaviors.js'

export class GhostAI {
  constructor (movement) {
    this.movement = movement
  }

  update (ghost, player, frightenedUntil, dt, now, ghosts = [ghost]) {
    const { tileSize } = GAME_CONFIG
    if (this.movement.atCenter(ghost.x) && this.movement.atCenter(ghost.y)) {
      const gx = Math.round((ghost.x - tileSize / 2) / tileSize)
      const gy = Math.round((ghost.y - tileSize / 2) / tileSize)
      const decisionKey = `${gx},${gy}`
      if (ghost.lastDecision !== decisionKey) {
        this.movement.snap(ghost)
        ghost.lastDecision = decisionKey
        let options = Object.keys(DIRECTIONS).filter(dir => dir !== 'none' && this.movement.canMove(ghost.x, ghost.y, dir))
        const reverse = REVERSE_DIRECTION[ghost.dir]
        const forwardOptions = options.filter(dir => dir !== reverse)
        if (forwardOptions.length) options = forwardOptions
        if (!options.length && reverse && this.movement.canMove(ghost.x, ghost.y, reverse)) options = [reverse]

        if (options.length) {
          ghost.dir = this.chooseDirection(ghost, player, gx, gy, options, frightenedUntil > now, ghosts)
        } else {
          ghost.dir = 'none'
        }
      } else if (!this.movement.canMove(ghost.x, ghost.y, ghost.dir)) {
        let options = Object.keys(DIRECTIONS).filter(dir => dir !== 'none' && this.movement.canMove(ghost.x, ghost.y, dir))
        const reverse = REVERSE_DIRECTION[ghost.dir]
        const forwardOptions = options.filter(dir => dir !== reverse)
        if (forwardOptions.length) options = forwardOptions
        if (options.length) ghost.dir = options[0]
        else ghost.dir = 'none'
      } else {
        this.movement.alignToCorridor(ghost)
      }
    }
    this.movement.move(ghost, ghost.speed, dt, false)
  }

  chooseDirection (ghost, player, gx, gy, options, frightened, ghosts) {
    const { tileSize } = GAME_CONFIG
    const target = frightened
      ? null
      : getGhostTarget(ghost, player, ghosts, gx, gy)
    const playerX = Math.round((player.x - tileSize / 2) / tileSize)
    const playerY = Math.round((player.y - tileSize / 2) / tileSize)

    let best = options[0]
    let bestDistance = frightened ? -Infinity : Infinity
    for (const dir of options) {
      const vector = DIRECTIONS[dir]
      let distance
      if (frightened) {
        const dx = gx + vector.x - playerX
        const dy = gy + vector.y - playerY
        distance = dx * dx + dy * dy
      } else {
        const dx = gx + vector.x - target.x
        const dy = gy + vector.y - target.y
        distance = dx * dx + dy * dy
      }
      if ((frightened && distance > bestDistance) || (!frightened && distance < bestDistance)) {
        best = dir
        bestDistance = distance
      }
    }
    return best
  }
}
