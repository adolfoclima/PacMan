import { GAME_CONFIG } from '../config/gameConfig.js'
import { DIRECTIONS } from '../entities/directions.js'

export class GameRenderer {
  constructor (canvas, context, levelState, frightenedUntilProvider) {
    this.canvas = canvas
    this.context = context
    this.levelState = levelState
    this.frightenedUntilProvider = frightenedUntilProvider
  }

  draw (player, ghosts, now) {
    this.drawMap()
    this.drawPlayer(player, now)
    ghosts.forEach(ghost => this.drawGhost(ghost, now))
  }

  drawMap () {
    const { tileSize, rows, columns } = GAME_CONFIG
    const ctx = this.context
    ctx.fillStyle = '#070915'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cell = this.levelState.map[row][col]
        const x = col * tileSize
        const y = row * tileSize
        if (cell === '#') this.drawWall(x, y)
        if (cell === '.') {
          ctx.fillStyle = '#ffdda8'
          ctx.beginPath()
          ctx.arc(x + tileSize / 2, y + tileSize / 2, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
        if (cell === 'o') {
          ctx.fillStyle = '#fff1a8'
          ctx.beginPath()
          ctx.arc(x + tileSize / 2, y + tileSize / 2, 7, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  drawWall (x, y) {
    const ctx = this.context
    ctx.fillStyle = '#202b8f'
    ctx.fillRect(x + 2, y + 2, GAME_CONFIG.tileSize - 4, GAME_CONFIG.tileSize - 4)
    ctx.strokeStyle = '#3b5cff'
    ctx.lineWidth = 2
    ctx.strokeRect(x + 3, y + 3, GAME_CONFIG.tileSize - 6, GAME_CONFIG.tileSize - 6)
  }

  drawPlayer (player, now) {
    void now
    player.mouth += 0.012
    const mouth = 0.16 + Math.abs(Math.sin(player.mouth * 10)) * 0.18
    const angle = DIRECTIONS[player.dir]?.angle || 0
    const ctx = this.context
    ctx.fillStyle = '#ffe438'
    ctx.beginPath()
    ctx.moveTo(player.x, player.y)
    ctx.arc(player.x, player.y, 9.5, angle + mouth, angle + Math.PI * 2 - mouth)
    ctx.closePath()
    ctx.fill()
  }

  drawGhost (ghost, now) {
    const ctx = this.context
    const frightened = this.frightenedUntilProvider() > now
    ctx.fillStyle = frightened ? '#3d5cff' : ghost.color
    ctx.beginPath()
    ctx.arc(ghost.x, ghost.y - 1, 9.5, Math.PI, 0)
    ctx.lineTo(ghost.x + 9.5, ghost.y + 9)
    ctx.lineTo(ghost.x + 5, ghost.y + 5)
    ctx.lineTo(ghost.x + 1, ghost.y + 9)
    ctx.lineTo(ghost.x - 4, ghost.y + 5)
    ctx.lineTo(ghost.x - 9.5, ghost.y + 9)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(ghost.x - 3.5, ghost.y - 2, 2.5, 0, Math.PI * 2)
    ctx.arc(ghost.x + 3.5, ghost.y - 2, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = frightened ? '#ee3434' : '#2844b5'
    ctx.beginPath()
    ctx.arc(ghost.x - 3.5, ghost.y - 2, 1, 0, Math.PI * 2)
    ctx.arc(ghost.x + 3.5, ghost.y - 2, 1, 0, Math.PI * 2)
    ctx.fill()
  }
}
