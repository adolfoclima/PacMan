import { GAME_CONFIG } from '../config/gameConfig.js'
import { DIRECTIONS } from '../entities/directions.js'
import { MAP_TEMPLATES } from './mapTemplates.js'

export class LevelGenerator {
  generate (phase) {
    const templateIndex = (phase - 1 + Math.floor(Math.random() * MAP_TEMPLATES.length)) % MAP_TEMPLATES.length
    let chosen = MAP_TEMPLATES[templateIndex]
    if (phase % 2 === 0 || Math.random() > 0.5) {
      chosen = chosen.map(row => [...row].reverse().join(''))
    }

    const map = chosen.map(row => row
      .padEnd(GAME_CONFIG.columns, '.')
      .slice(0, GAME_CONFIG.columns)
      .split('')
      .map(cell => cell === '#' ? '#' : '.'))

    const tunnelRoll = Math.random()
    const tunnelOrientation = tunnelRoll < 0.78 ? 'horizontal' : tunnelRoll < 0.97 ? 'vertical' : 'both'
    const tunnelVerticalCol = 10

    if (tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') {
      map[10] = Array.from({ length: GAME_CONFIG.columns }, () => '.')
    }
    if (tunnelOrientation === 'vertical' || tunnelOrientation === 'both') {
      map[0][tunnelVerticalCol] = '.'
      map[GAME_CONFIG.rows - 1][tunnelVerticalCol] = '.'
      for (let row = 1; row < GAME_CONFIG.rows - 1; row++) map[row][tunnelVerticalCol] = '.'
    }

    const reachable = this.findReachableCells(map, tunnelOrientation, tunnelVerticalCol)
    for (let row = 0; row < GAME_CONFIG.rows; row++) {
      for (let col = 0; col < GAME_CONFIG.columns; col++) {
        if (map[row][col] === '#') continue
        map[row][col] = reachable.has(`${row},${col}`) ? '.' : '#'
      }
    }

    for (const [row, col] of [[3, 1], [3, 19], [16, 1], [16, 19]]) {
      if (map[row]?.[col] === '.') map[row][col] = 'o'
    }
    if (tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') {
      map[10][0] = '.'
      map[10][GAME_CONFIG.columns - 1] = '.'
    }

    return { map, tunnelOrientation, tunnelVerticalCol }
  }

  findReachableCells (map, tunnelOrientation, tunnelVerticalCol) {
    const startRow = 16
    const startCol = 10
    const reachable = new Set([`${startRow},${startCol}`])
    const queue = [[startRow, startCol]]

    while (queue.length) {
      const [row, col] = queue.shift()
      for (const direction of Object.values(DIRECTIONS)) {
        if (direction.x === 0 && direction.y === 0) continue
        let nextRow = row + direction.y
        let nextCol = col + direction.x
        if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && row === 10 && nextCol < 0) nextCol = GAME_CONFIG.columns - 1
        if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && row === 10 && nextCol >= GAME_CONFIG.columns) nextCol = 0
        if ((tunnelOrientation === 'vertical' || tunnelOrientation === 'both') && col === tunnelVerticalCol && nextRow < 0) nextRow = GAME_CONFIG.rows - 1
        if ((tunnelOrientation === 'vertical' || tunnelOrientation === 'both') && col === tunnelVerticalCol && nextRow >= GAME_CONFIG.rows) nextRow = 0
        if (nextCol < 0 || nextCol >= GAME_CONFIG.columns || nextRow < 0 || nextRow >= GAME_CONFIG.rows) continue
        if (map[nextRow][nextCol] === '#') continue
        const key = `${nextRow},${nextCol}`
        if (!reachable.has(key)) {
          reachable.add(key)
          queue.push([nextRow, nextCol])
        }
      }
    }
    return reachable
  }
}
