import { GAME_CONFIG } from '../../config/gameConfig.js'

export function createClyde () {
  const { tileSize } = GAME_CONFIG
  return {
    name: 'Clyde',
    personality: 'shy',
    color: '#ffad33',
    x: 12.5 * tileSize,
    y: 10.5 * tileSize,
    dir: 'left',
    speed: 66,
    centerLock: false,
    lastDecision: ''
  }
}
