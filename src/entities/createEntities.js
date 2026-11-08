import { GAME_CONFIG } from '../config/gameConfig.js'
import { createBlinky } from './ghosts/Blinky.js'
import { createPinky } from './ghosts/Pinky.js'
import { createInky } from './ghosts/Inky.js'
import { createClyde } from './ghosts/Clyde.js'

export function createPlayer () {
  const { tileSize } = GAME_CONFIG
  return {
    x: 10.5 * tileSize,
    y: 16.5 * tileSize,
    dir: 'left',
    nextDir: 'none',
    nextDirExpires: 0,
    mouth: 0,
    centerLock: false
  }
}

export function createGhosts () {
  return [createBlinky(), createPinky(), createInky(), createClyde()].map(ghost => ({
    ...ghost,
    spawnX: ghost.x,
    spawnY: ghost.y
  }))
}
