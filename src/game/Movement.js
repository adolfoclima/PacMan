import { GAME_CONFIG } from '../config/gameConfig.js'
import { DIRECTIONS } from '../entities/directions.js'

export class Movement {
  constructor (levelState, audioService) {
    this.levelState = levelState
    this.audioService = audioService
    this.wallSoundAt = 0
  }

  atCenter (value) {
    const gridPosition = (value - GAME_CONFIG.tileSize / 2) / GAME_CONFIG.tileSize
    return Math.abs(gridPosition - Math.round(gridPosition)) < 0.065
  }

  snap (entity) {
    const { tileSize } = GAME_CONFIG
    entity.x = Math.round((entity.x - tileSize / 2) / tileSize) * tileSize + tileSize / 2
    entity.y = Math.round((entity.y - tileSize / 2) / tileSize) * tileSize + tileSize / 2
  }

  canMove (x, y, dir) {
    const vector = DIRECTIONS[dir]
    if (!vector || dir === 'none') return false
    const col = Math.round((x - GAME_CONFIG.tileSize / 2) / GAME_CONFIG.tileSize) + vector.x
    const row = Math.round((y - GAME_CONFIG.tileSize / 2) / GAME_CONFIG.tileSize) + vector.y
    const centerCol = Math.round((x - GAME_CONFIG.tileSize / 2) / GAME_CONFIG.tileSize)
    const { map, tunnelOrientation, tunnelVerticalCol } = this.levelState
    if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && row === 10 && (col < 0 || col >= GAME_CONFIG.columns)) return true
    if ((tunnelOrientation === 'vertical' || tunnelOrientation === 'both') && centerCol === tunnelVerticalCol && (row < 0 || row >= GAME_CONFIG.rows)) return true
    return row >= 0 && row < GAME_CONFIG.rows && col >= 0 && col < GAME_CONFIG.columns && map[row][col] !== '#'
  }

  move (entity, speed, dt, isPlayer = false) {
    const { tileSize, columns, rows } = GAME_CONFIG
    const xDistance = Math.abs(((entity.x - tileSize / 2) / tileSize) - Math.round((entity.x - tileSize / 2) / tileSize))
    const yDistance = Math.abs(((entity.y - tileSize / 2) / tileSize) - Math.round((entity.y - tileSize / 2) / tileSize))
    if (xDistance > 0.08 || yDistance > 0.08) entity.centerLock = false

    if (!entity.centerLock && this.atCenter(entity.x) && this.atCenter(entity.y)) {
      entity.centerLock = true
      this.snap(entity)
      if (entity.nextDir && this.canMove(entity.x, entity.y, entity.nextDir)) entity.dir = entity.nextDir
      if (!this.canMove(entity.x, entity.y, entity.dir)) {
        entity.dir = 'none'
        entity.centerLock = false
        if (isPlayer) {
          const now = performance.now()
          if (now - this.wallSoundAt > 180) {
            this.wallSoundAt = now
            this.audioService.wall()
          }
        }
      }
    }

    const vector = DIRECTIONS[entity.dir] || DIRECTIONS.none
    entity.x += vector.x * speed * dt
    entity.y += vector.y * speed * dt
    this.applyPortals(entity, isPlayer, columns, rows)
  }

  applyPortals (entity, isPlayer, columns, rows) {
    const { tileSize } = GAME_CONFIG
    const entityRow = Math.round((entity.y - tileSize / 2) / tileSize)
    const entityCol = Math.round((entity.x - tileSize / 2) / tileSize)
    const { tunnelOrientation, tunnelVerticalCol } = this.levelState

    if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && entityRow === 10) {
      if (entity.x < -tileSize / 2) {
        entity.x = columns * tileSize + tileSize / 2
        if (isPlayer) this.audioService.portal()
      }
      if (entity.x > columns * tileSize + tileSize / 2) {
        entity.x = -tileSize / 2
        if (isPlayer) this.audioService.portal()
      }
    }
    if (tunnelOrientation === 'vertical' || tunnelOrientation === 'both') {
      if (entityCol === tunnelVerticalCol && entity.y < -tileSize / 2) {
        entity.y = rows * tileSize + tileSize / 2
        if (isPlayer) this.audioService.portal()
      }
      if (entityCol === tunnelVerticalCol && entity.y > rows * tileSize + tileSize / 2) {
        entity.y = -tileSize / 2
        if (isPlayer) this.audioService.portal()
      }
    }
  }
}
