import { GAME_CONFIG } from '../config/gameConfig.js'
import { DIRECTIONS, REVERSE_DIRECTION } from '../entities/directions.js'

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

  atTurnCenter (value) {
    const gridPosition = (value - GAME_CONFIG.tileSize / 2) / GAME_CONFIG.tileSize
    return Math.abs(gridPosition - Math.round(gridPosition)) < 0.12
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
    const { columns, rows } = GAME_CONFIG
    if (isPlayer && entity.nextDir) {
      if (entity.nextDir === REVERSE_DIRECTION[entity.dir]) {
        entity.dir = entity.nextDir
        entity.nextDir = entity.dir
        entity.nextDirExpires = 0
      } else if (entity.nextDir === entity.dir) {
        entity.nextDirExpires = 0
      } else if (this.atTurnCenter(entity.x) && this.atTurnCenter(entity.y)) {
        if (this.canMove(entity.x, entity.y, entity.nextDir)) {
          this.alignTurnAxis(entity, entity.nextDir)
          entity.dir = entity.nextDir
          entity.nextDir = entity.dir
          entity.nextDirExpires = 0
        }
      }
    }

    if (entity.dir !== 'none' && !this.canMove(entity.x, entity.y, entity.dir)) {
      if (this.atCenter(entity.x) && this.atCenter(entity.y)) {
        entity.dir = 'none'
        if (isPlayer) this.playWallSound()
      }
    }

    const vector = DIRECTIONS[entity.dir] || DIRECTIONS.none
    const distance = speed * dt
    if (vector.x !== 0 || vector.y !== 0) {
      const wallLimit = this.getWallLimit(entity, vector, distance)
      if (wallLimit !== null) {
        if (vector.x !== 0) entity.x = wallLimit
        if (vector.y !== 0) entity.y = wallLimit
        entity.dir = 'none'
        if (isPlayer) this.playWallSound()
      } else {
        entity.x += vector.x * distance
        entity.y += vector.y * distance
      }
    }
    this.applyPortals(entity, isPlayer, columns, rows)
  }

  alignTurnAxis (entity, direction) {
    const vector = DIRECTIONS[direction]
    if (!vector) return
    if (vector.x !== 0) {
      entity.y = this.nearestCenter(entity.y)
    } else {
      entity.x = this.nearestCenter(entity.x)
    }
  }

  nearestCenter (value) {
    const { tileSize } = GAME_CONFIG
    return Math.round((value - tileSize / 2) / tileSize) * tileSize + tileSize / 2
  }

  getWallLimit (entity, vector, distance) {
    const { tileSize } = GAME_CONFIG
    const radius = 9.5
    const nextX = entity.x + vector.x * distance
    const nextY = entity.y + vector.y * distance

    if (vector.x !== 0) {
      const row = Math.floor(nextY / tileSize)
      const probeX = nextX + vector.x * radius
      const col = Math.floor(probeX / tileSize)
      if (this.levelState.map[row]?.[col] === '#') {
        return vector.x > 0 ? col * tileSize - radius : (col + 1) * tileSize + radius
      }
    }

    if (vector.y !== 0) {
      const col = Math.floor(nextX / tileSize)
      const probeY = nextY + vector.y * radius
      const row = Math.floor(probeY / tileSize)
      if (this.levelState.map[row]?.[col] === '#') {
        return vector.y > 0 ? row * tileSize - radius : (row + 1) * tileSize + radius
      }
    }
    return null
  }

  playWallSound () {
    const now = performance.now()
    if (now - this.wallSoundAt > 180) {
      this.wallSoundAt = now
      this.audioService.wall()
    }
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
