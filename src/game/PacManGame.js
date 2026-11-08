import { GAME_CONFIG } from '../config/gameConfig.js'
import { createPlayer, createGhosts } from '../entities/createEntities.js'
import { LevelGenerator } from './LevelGenerator.js'
import { Movement } from './Movement.js'
import { GhostAI } from './GhostAI.js'
import { CollisionRules } from './CollisionRules.js'
import { GameRenderer } from '../render/GameRenderer.js'
import { GameUI } from '../ui/GameUI.js'
import { AudioService } from '../audio/AudioService.js'
import { InputController } from '../controllers/InputController.js'

export class PacManGame {
  constructor () {
    this.level = 1
    this.score = 0
    this.lives = 3
    this.running = false
    this.frightenedUntil = 0
    this.lastTime = 0
    this.audioService = new AudioService()
    this.ui = new GameUI()
    this.levelState = { map: [], tunnelOrientation: 'horizontal', tunnelVerticalCol: 10 }
    this.levelGenerator = new LevelGenerator()
    this.movement = new Movement(this.levelState, this.audioService)
    this.ghostAI = new GhostAI(this.movement)
    this.collisionRules = new CollisionRules(this.levelState)
    this.renderer = new GameRenderer(this.ui.canvas, this.ui.context, this.levelState, () => this.frightenedUntil)
    this.player = createPlayer()
    this.ghosts = createGhosts()
    this.inputController = new InputController(() => this.player, this.ui, this.audioService, () => this.start(), () => this.running)
    this.prepareLevel()
    this.ui.updateHud(this.score, this.lives, this.level)
    requestAnimationFrame(now => this.loop(now))
  }

  prepareLevel () {
    Object.assign(this.levelState, this.levelGenerator.generate(this.level))
  }

  resetPositions () {
    const player = createPlayer()
    Object.assign(this.player, player)
    this.ghosts = createGhosts()
  }

  start () {
    const currentTitle = this.ui.overlayTitle.textContent
    if (currentTitle === 'GAME OVER') {
      this.level = 1
      this.score = 0
      this.lives = 3
    } else if (currentTitle === 'READY!' && this.running === false) {
      this.score = 0
      this.lives = 3
    }
    this.prepareLevel()
    this.resetPositions()
    this.ui.updateHud(this.score, this.lives, this.level)
    this.audioService.stopAmbient()
    this.audioService.gameStart()
    this.ui.hideOverlay()
    this.running = true
    this.lastTime = performance.now()
    this.audioService.startAmbient()
  }

  loseLife () {
    this.lives--
    this.audioService.stopAmbient()
    this.audioService.lifeLost()
    this.ui.updateHud(this.score, this.lives, this.level)
    if (this.lives <= 0) {
      this.running = false
      this.audioService.gameOver()
      this.ui.showOverlay('GAME OVER', `${this.score} pontos`, 'TENTAR NOVAMENTE')
    } else {
      this.resetPositions()
      window.setTimeout(() => {
        if (this.running && this.lives > 0) this.audioService.startAmbient()
      }, 900)
    }
  }

  loop (now) {
    const dt = Math.min((now - this.lastTime) / 1000 || 0, 0.033)
    this.lastTime = now
    if (this.running) {
      this.movement.move(this.player, GAME_CONFIG.playerSpeed, dt, true)
      this.collectPellet()
      this.ghosts.forEach(ghost => this.ghostAI.update(ghost, this.player, this.frightenedUntil, dt, now))
      this.checkGhostCollisions(now)
    }
    this.renderer.draw(this.player, this.ghosts, now)
    requestAnimationFrame(time => this.loop(time))
  }

  collectPellet () {
    const result = this.collisionRules.collectPellet(
      this.player,
      this.score,
      () => {
        this.frightenedUntil = performance.now() + GAME_CONFIG.frightenedDuration
        this.audioService.specialPellet()
      },
      () => this.audioService.normalPellet()
    )
    this.score = result.score
    this.ui.updateHud(this.score, this.lives, this.level)
    if (result.levelCleared) {
      this.running = false
      this.audioService.stopAmbient()
      this.audioService.levelComplete()
      this.level++
      this.ui.showOverlay('YOU WIN!', `Fase ${this.level - 1} concluída · Próxima fase: ${this.level}`, 'JOGAR NOVAMENTE')
    }
  }

  checkGhostCollisions (now) {
    for (const ghost of this.ghosts) {
      if (!this.collisionRules.isGhostCollision(this.player, ghost)) continue
      if (this.frightenedUntil > now) {
        this.score += 200
        this.ui.updateHud(this.score, this.lives, this.level)
        this.audioService.ghostEaten()
        Object.assign(ghost, { x: 10.5 * GAME_CONFIG.tileSize, y: 9.5 * GAME_CONFIG.tileSize, dir: 'left' })
      } else {
        this.loseLife()
        break
      }
    }
  }
}
