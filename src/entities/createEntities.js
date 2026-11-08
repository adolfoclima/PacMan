import { GAME_CONFIG } from '../config/gameConfig.js'

export function createPlayer () {
  const { tileSize } = GAME_CONFIG
  return {
    x: 10.5 * tileSize,
    y: 16.5 * tileSize,
    dir: 'left',
    nextDir: 'left',
    mouth: 0,
    centerLock: false
  }
}

export function createGhosts () {
  const { tileSize } = GAME_CONFIG
  return [
    { x: 9.5 * tileSize, y: 10.5 * tileSize, dir: 'left', color: '#ff4b4b', speed: 78, centerLock: false, personality: 'chaser' },
    { x: 10.5 * tileSize, y: 10.5 * tileSize, dir: 'up', color: '#ffb8d1', speed: 72, centerLock: false, personality: 'ambusher' },
    { x: 11.5 * tileSize, y: 10.5 * tileSize, dir: 'right', color: '#55d9ff', speed: 68, centerLock: false, personality: 'wanderer' }
  ]
}
