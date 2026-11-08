import { GAME_CONFIG } from '../../config/gameConfig.js'

export function createInky () {
  const { tileSize } = GAME_CONFIG
  return {
    name: 'Inky',
    personality: 'flanker',
    color: '#55d9ff',
    x: 11.5 * tileSize,
    y: 10.5 * tileSize,
    dir: 'right',
    speed: 68,
    centerLock: false,
    lastDecision: ''
  }
}

