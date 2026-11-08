export class GameUI {
  constructor () {
    this.app = document.querySelector('#app')
    this.renderShell()
    this.canvas = document.querySelector('#board')
    this.context = this.canvas.getContext('2d')
    this.score = document.querySelector('#score')
    this.lives = document.querySelector('#lives')
    this.phase = document.querySelector('.phase-label')
    this.overlay = document.querySelector('#overlay')
    this.overlayTitle = document.querySelector('#overlayTitle')
    this.overlayText = document.querySelector('#overlayText')
    this.startButton = document.querySelector('#startButton')
    this.soundButton = document.querySelector('#soundButton')
    this.enterControl = document.querySelector('[data-action="enter"]')
  }

  renderShell () {
    this.app.innerHTML = `
      <main class="game-shell">
        <header class="topbar"><div class="brand"><span class="brand-dot"></span>PAC-MAN</div>
          <button class="sound-button" id="soundButton" aria-label="Alternar som" aria-pressed="false" title="Desativar som">♪</button>
        </header>
        <section class="game-area">
          <aside class="score-card"><span class="label">SCORE</span><strong id="score">00000</strong><span class="label phase-label">PHASE 1</span></aside>
          <div class="board-wrap"><canvas id="board" width="504" height="504" aria-label="Tabuleiro Pac-Man"></canvas>
            <div class="overlay" id="overlay"><div class="overlay-panel"><div class="mini-pac"></div><h1 id="overlayTitle">READY!</h1>
              <p id="overlayText">Use as setas para jogar</p><button id="startButton">JOGAR</button></div></div>
          </div>
          <aside class="lives-card"><span class="label">LIVES</span><div id="lives" class="lives"></div></aside>
        </section>
        <div class="mobile-controls" aria-label="Controles">
          <button data-dir="up">▲</button><button data-dir="left">◀</button><button data-dir="down">▼</button><button data-dir="right">▶</button>
        </div>
        <footer class="game-controls" aria-label="Controles do jogo">
          <span class="controls-label">CONTROLES</span>
          <div class="control-key control-key-up" data-dir="up" role="button" tabindex="0"><span>W</span><small>▲</small></div>
          <div class="control-key control-key-left" data-dir="left" role="button" tabindex="0"><span>A</span><small>◀</small></div>
          <div class="control-key control-key-down" data-dir="down" role="button" tabindex="0"><span>S</span><small>▼</small></div>
          <div class="control-key control-key-right" data-dir="right" role="button" tabindex="0"><span>D</span><small>▶</small></div>
          <div class="control-key control-key-enter" data-action="enter" role="button" tabindex="0"><span>ENTER</span><small>▶|</small></div>
        </footer>
      </main>`
  }

  updateHud (score, lives, level) {
    this.score.textContent = String(score).padStart(5, '0')
    this.lives.innerHTML = Array.from({ length: lives }, () => '<span class="life"></span>').join('')
    this.phase.textContent = `PHASE ${level}`
  }

  showOverlay (title, text, buttonText) {
    this.overlayTitle.textContent = title
    this.overlayText.textContent = text
    this.startButton.textContent = buttonText
    this.overlay.classList.remove('hidden')
  }

  hideOverlay () {
    this.overlay.classList.add('hidden')
  }

  setSoundEnabled (enabled) {
    this.soundButton.classList.toggle('muted', !enabled)
    this.soundButton.textContent = enabled ? '♪' : '×'
    this.soundButton.setAttribute('aria-pressed', String(!enabled))
    this.soundButton.title = enabled ? 'Desativar som' : 'Ativar som'
  }
}
