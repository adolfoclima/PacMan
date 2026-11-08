import { GAME_CONFIG } from '../../config/gameConfig.js'

export function createPinky () {
  const { tileSize } = GAME_CONFIG
  return {
    name: 'Pinky',
    personality: 'ambusher',
    color: '#ffb8d1',
    x: 10.5 * tileSize,
    y: 10.5 * tileSize,
    dir: 'up',
    speed: 72,
    centerLock: false,
    lastDecision: ''
  }
}

