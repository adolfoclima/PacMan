import { GAME_CONFIG } from "../config/gameConfig.js";
import {
  createPlayer,
  createGhosts,
  resetGhost,
} from "../entities/createEntities.js";
import { LevelGenerator } from "./LevelGenerator.js";
import { Movement } from "./Movement.js";
import { GhostAI } from "./GhostAI.js";
import { CollisionRules } from "./CollisionRules.js";
import { GameRenderer } from "../render/GameRenderer.js";
import { GameUI } from "../ui/GameUI.js";
import { AudioService } from "../audio/AudioService.js";
import { InputController } from "../controllers/InputController.js";
import { GAME_STATES, GameState } from "./GameState.js";
import { GameLoop } from "./GameLoop.js";

export class PacManGame {
  constructor(i18n) {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.gameState = new GameState();
    this.running = false;
    this.frightenedUntil = 0;
    this.gameLoop = new GameLoop((dt, now) => this.loop(dt, now));
    this.lifeLostTimeout = null;
    this.lifeLostDeadline = 0;
    this.audioService = new AudioService();
    this.i18n = i18n;
    this.ui = new GameUI(i18n);
    this.levelState = {
      map: [],
      tunnelOrientation: "horizontal",
      tunnelVerticalCol: 10,
    };
    this.levelGenerator = new LevelGenerator();
    this.movement = new Movement(this.levelState, this.audioService);
    this.ghostAI = new GhostAI(this.movement);
    this.collisionRules = new CollisionRules(this.levelState);
    this.renderer = new GameRenderer(
      this.ui.canvas,
      this.ui.context,
      this.levelState,
      () => this.frightenedUntil,
    );
    this.player = createPlayer();
    this.ghosts = createGhosts();
    this.inputController = new InputController(
      () => this.player,
      this.ui,
      this.audioService,
      () => this.start(),
      () => this.running,
    );
    this.prepareLevel();
    this.ui.updateHud(this.score, this.lives, this.level);
    this.renderer.draw(this.player, this.ghosts, performance.now());
    this.gameLoop.stop();
    this.visibilityHandler = () => {
      if (document.hidden) {
        const wasRunning = this.running;
        const wasLifeLost = this.gameState.is(GAME_STATES.LIFE_LOST);
        if (wasRunning || wasLifeLost) this.gameState.pause();
        this.running = false;
        this.gameLoop.pause();
        if (this.lifeLostTimeout !== null) {
          window.clearTimeout(this.lifeLostTimeout);
          this.lifeLostTimeout = null;
          this.lifeLostDeadline = Math.max(
            this.lifeLostDeadline - performance.now(),
            0,
          );
        }
      } else if (this.gameState.is(GAME_STATES.PAUSED)) {
        this.gameState.resume();
        this.gameLoop.resume();
        if (this.gameState.is(GAME_STATES.RUNNING)) {
          this.running = true;
        } else if (this.gameState.is(GAME_STATES.LIFE_LOST)) {
          this.scheduleLifeLostResume(this.lifeLostDeadline || 900);
        }
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  prepareLevel() {
    Object.assign(this.levelState, this.levelGenerator.generate(this.level));
  }

  resetPositions() {
    const player = createPlayer();
    Object.assign(this.player, player);
    this.ghosts = createGhosts();
  }

  start() {
    if (this.gameState.is(GAME_STATES.GAME_OVER)) {
      this.level = 1;
      this.score = 0;
      this.lives = 3;
    } else if (this.gameState.is(GAME_STATES.READY)) {
      this.score = 0;
      this.lives = 3;
    }
    this.prepareLevel();
    this.resetPositions();
    this.ui.updateHud(this.score, this.lives, this.level);
    this.audioService.stopAmbient();
    this.audioService.gameStart();
    this.ui.hideOverlay();
    this.running = true;
    this.gameState.set(GAME_STATES.RUNNING);
    this.gameLoop.resume();
    this.audioService.startAmbient();
  }

  loseLife() {
    this.lives--;
    this.audioService.stopAmbient();
    this.audioService.lifeLost();
    this.ui.updateHud(this.score, this.lives, this.level);
    if (this.lives <= 0) {
      this.running = false;
      this.gameState.set(GAME_STATES.GAME_OVER);
      this.gameLoop.pause();
      this.audioService.gameOver();
      this.ui.showOverlay(
        "gameOver",
        "pointsCount",
        { count: this.score },
        "retry",
      );
    } else {
      this.running = false;
      this.resetPositions();
      this.gameState.set(GAME_STATES.LIFE_LOST);
      this.gameLoop.pause();
      this.scheduleLifeLostResume(900);
    }
  }

  scheduleLifeLostResume(delay = 900) {
    if (this.lifeLostTimeout !== null) {
      window.clearTimeout(this.lifeLostTimeout);
    }
    this.lifeLostDeadline = performance.now() + delay;
    this.lifeLostTimeout = window.setTimeout(() => {
      this.lifeLostTimeout = null;
      this.lifeLostDeadline = 0;
      if (this.lives > 0 && !document.hidden) {
        this.running = true;
        this.gameState.set(GAME_STATES.RUNNING);
        this.gameLoop.resume();
        this.audioService.startAmbient();
      }
    }, delay);
  }

  loop(dt, now) {
    if (this.running) {
      this.movement.move(this.player, GAME_CONFIG.playerSpeed, dt, true);
      this.collectPellet();
      this.ghosts.forEach((ghost) =>
        this.ghostAI.update(
          ghost,
          this.player,
          this.frightenedUntil,
          dt,
          now,
          this.ghosts,
        ),
      );
      this.checkGhostCollisions(now);
    }
    this.renderer.draw(this.player, this.ghosts, now);
  }

  collectPellet() {
    const result = this.collisionRules.collectPellet(this.player, this.score);
    this.score = result.score;
    this.ui.updateHud(this.score, this.lives, this.level);
    if (result.pellet === "o") {
      this.frightenedUntil = performance.now() + GAME_CONFIG.frightenedDuration;
      this.audioService.specialPellet();
    } else if (result.pellet === ".") {
      this.audioService.normalPellet();
    }
    if (result.levelCleared) {
      this.running = false;
      this.gameState.set(GAME_STATES.LEVEL_COMPLETE);
      this.audioService.stopAmbient();
      this.audioService.levelComplete();
      this.level++;
      this.gameLoop.pause();
      this.ui.showOverlay(
        "levelComplete",
        "nextLevel",
        {
          completed: this.level - 1,
          next: this.level,
        },
        "nextPhase",
      );
    }
  }

  checkGhostCollisions(now) {
    for (const ghost of this.ghosts) {
      if (!this.collisionRules.isGhostCollision(this.player, ghost)) continue;
      if (this.frightenedUntil > now) {
        this.score += 200;
        this.ui.updateHud(this.score, this.lives, this.level);
        this.audioService.ghostEaten();
        resetGhost(ghost);
      } else {
        this.loseLife();
        break;
      }
    }
  }

  destroy() {
    this.gameLoop.stop();
    if (this.lifeLostTimeout !== null)
      window.clearTimeout(this.lifeLostTimeout);
    document.removeEventListener("visibilitychange", this.visibilityHandler);
    this.inputController?.destroy();
    this.ui.destroy();
    this.audioService.destroy();
  }
}
