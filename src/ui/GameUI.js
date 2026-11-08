export class GameUI {
  constructor() {
    this.app = document.querySelector("#app");
    if (!this.app) throw new Error("Missing application root: #app");
    this.renderShell();
    this.canvas = document.querySelector("#board");
    if (!this.canvas) throw new Error("Missing game canvas: #board");
    this.context = this.canvas.getContext("2d");
    if (!this.context) throw new Error("2D canvas context is unavailable");
    this.score = document.querySelector("#score");
    this.lives = document.querySelector("#lives");
    this.phase = document.querySelector(".phase-label");
    this.overlay = document.querySelector("#overlay");
    this.overlayTitle = document.querySelector("#overlayTitle");
    this.overlayText = document.querySelector("#overlayText");
    this.startButton = document.querySelector("#startButton");
    this.soundButton = document.querySelector("#soundButton");
    this.enterControl = document.querySelector('[data-action="enter"]');
    this.lives.setAttribute("aria-label", "3 vidas");
    this.mobileControls = document.querySelector(".mobile-controls");
    this.gameControls = document.querySelector(".game-controls");
    this.setControlsBlocked(true);
  }

  renderShell() {
    this.app.innerHTML = `
      <main class="game-shell">
        <header class="topbar"><div class="brand"><span class="brand-dot"></span>PAC-MAN</div>
          <button type="button" class="sound-button" id="soundButton" aria-label="Alternar som" aria-pressed="true" title="Desativar som">♪</button>
        </header>
        <section class="game-area">
          <aside class="score-card" aria-live="polite"><span class="label">PONTOS</span><strong id="score">00000</strong><span class="label phase-label">FASE 1</span></aside>
          <div class="board-wrap"><canvas id="board" width="504" height="504" aria-label="Tabuleiro Pac-Man" role="img">Seu navegador não suporta Canvas.</canvas>
            <div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-labelledby="overlayTitle" aria-describedby="overlayText" aria-hidden="false"><div class="overlay-panel"><div class="mini-pac" aria-hidden="true"></div><h1 id="overlayTitle">PRONTO!</h1>
              <p id="overlayText">Use as setas para jogar</p><button type="button" id="startButton">JOGAR</button></div></div>
          </div>
          <aside class="lives-card"><span class="label">VIDAS</span><div id="lives" class="lives" aria-label="3 vidas" aria-live="polite"></div></aside>
        </section>
        <div class="mobile-controls" aria-label="Controles">
          <button type="button" data-dir="up" aria-label="Mover para cima">▲</button><button type="button" data-dir="left" aria-label="Mover para esquerda">◀</button><button type="button" data-dir="down" aria-label="Mover para baixo">▼</button><button type="button" data-dir="right" aria-label="Mover para direita">▶</button>
        </div>
        <footer class="game-controls" aria-label="Controles do jogo">
          <span class="controls-label">CONTROLES</span>
          <button type="button" class="control-key control-key-up" data-dir="up" aria-label="Mover para cima"><span>W</span><small>▲</small></button>
          <button type="button" class="control-key control-key-left" data-dir="left" aria-label="Mover para esquerda"><span>A</span><small>◀</small></button>
          <button type="button" class="control-key control-key-down" data-dir="down" aria-label="Mover para baixo"><span>S</span><small>▼</small></button>
          <button type="button" class="control-key control-key-right" data-dir="right" aria-label="Mover para direita"><span>D</span><small>▶</small></button>
          <button type="button" class="control-key control-key-enter" data-action="enter" aria-label="Confirmar"><span>CONFIRMAR</span><small>▶|</small></button>
        </footer>
      </main>`;
  }

  updateHud(score, lives, level) {
    this.score.textContent = String(score).padStart(5, "0");
    this.lives.replaceChildren();
    for (let index = 0; index < lives; index++) {
      const life = document.createElement("span");
      life.className = "life";
      this.lives.append(life);
    }
    this.lives.setAttribute(
      "aria-label",
      `${lives} ${lives === 1 ? "vida" : "vidas"}`,
    );
    this.phase.textContent = `FASE ${level}`;
  }

  showOverlay(title, text, buttonText) {
    this.overlayTitle.textContent = title;
    this.overlayText.textContent = text;
    this.startButton.textContent = buttonText;
    this.overlay.classList.remove("hidden");
    this.overlay.setAttribute("aria-hidden", "false");
    this.overlay.removeAttribute("inert");
    this.setControlsBlocked(true);
    this.startButton.focus();
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
    this.overlay.setAttribute("aria-hidden", "true");
    this.overlay.setAttribute("inert", "");
    this.setControlsBlocked(false);
  }

  setSoundEnabled(enabled) {
    this.soundButton.classList.toggle("muted", !enabled);
    this.soundButton.textContent = enabled ? "♪" : "×";
    this.soundButton.setAttribute("aria-pressed", String(enabled));
    this.soundButton.title = enabled ? "Desativar som" : "Ativar som";
  }

  setControlsBlocked(blocked) {
    for (const controls of [this.mobileControls, this.gameControls]) {
      if (!controls) continue;
      if (blocked) controls.setAttribute("inert", "");
      else controls.removeAttribute("inert");
    }
  }
}
