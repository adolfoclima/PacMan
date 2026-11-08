export class GameUI {
  constructor(i18n) {
    this.i18n = i18n;
    this.overlayContent = null;
    this.hud = { score: 0, lives: 3, level: 1 };
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
    this.lives.setAttribute(
      "aria-label",
      this.i18n.t("livesCount", { count: 3 }),
    );
    this.mobileControls = document.querySelector(".mobile-controls");
    this.gameControls = document.querySelector(".game-controls");
    this.languageButton = document.querySelector("#languageButton");
    this.languageFlag = document.querySelector("#languageFlag");
    this.languageMenu = document.querySelector("#languageMenu");
    this.setControlsBlocked(true);
    this.languageOptionHandler = (event) => {
      const locale = event.currentTarget.dataset.locale;
      this.i18n.setLocale(locale);
      this.closeLanguageMenu();
    };
    this.languageMenuButtons = [
      ...this.languageMenu.querySelectorAll("[data-locale]"),
    ];
    this.languageMenuButtons.forEach((button) =>
      button.addEventListener("click", this.languageOptionHandler),
    );
    this.languageToggleHandler = () => this.toggleLanguageMenu();
    this.languageButton.addEventListener("click", this.languageToggleHandler);
    this.languageOutsideHandler = (event) => {
      if (!event.target.closest(".language-control")) this.closeLanguageMenu();
    };
    this.languageKeyHandler = (event) => {
      if (event.key === "Escape") this.closeLanguageMenu();
    };
    document.addEventListener("pointerdown", this.languageOutsideHandler);
    document.addEventListener("keydown", this.languageKeyHandler);
    this.applyTranslations();
    this.unsubscribe = this.i18n.subscribe(() => {
      this.applyTranslations();
      this.updateHud(this.hud.score, this.hud.lives, this.hud.level);
      this.refreshOverlay();
    });
  }

  renderShell() {
    this.app.innerHTML = `
      <main class="game-shell">
        <header class="topbar"><div class="brand"><span class="brand-dot"></span>PAC-MAN</div>
          <div class="topbar-actions">
            <div class="language-control">
              <button type="button" class="language-button" id="languageButton" aria-label="Idioma" aria-haspopup="menu" aria-expanded="false">
                <span class="language-current-flag" id="languageFlag" aria-hidden="true"></span>
                <span class="language-chevron" aria-hidden="true"></span>
              </button>
              <div class="language-menu" id="languageMenu" role="menu" hidden>
                <button type="button" role="menuitemradio" data-locale="pt-BR"><span class="language-flag" aria-hidden="true"><svg viewBox="0 0 30 20" role="presentation"><rect width="30" height="20" rx="2" fill="#009b3a"/><path d="M15 2.5 27 10 15 17.5 3 10Z" fill="#ffdf00"/><circle cx="15" cy="10" r="5" fill="#002776"/></svg></span><span>Português</span><span class="language-check" aria-hidden="true">✓</span></button>
                <button type="button" role="menuitemradio" data-locale="en-US"><span class="language-flag" aria-hidden="true"><svg viewBox="0 0 30 20" role="presentation"><rect width="30" height="20" rx="2" fill="#fff"/><path d="M0 2h30M0 6h30M0 10h30M0 14h30M0 18h30" stroke="#b22234" stroke-width="2"/><rect width="12" height="11" rx="1" fill="#3c3b6e"/></svg></span><span>English</span><span class="language-check" aria-hidden="true">✓</span></button>
                <button type="button" role="menuitemradio" data-locale="es-ES"><span class="language-flag" aria-hidden="true"><svg viewBox="0 0 30 20" role="presentation"><rect width="30" height="20" rx="2" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/></svg></span><span>Español</span><span class="language-check" aria-hidden="true">✓</span></button>
              </div>
            </div>
            <button type="button" class="sound-button" id="soundButton" aria-label="Alternar som" aria-pressed="true" title="Desativar som">♪</button>
          </div>
        </header>
        <section class="game-area">
          <aside class="score-card" aria-live="polite"><span class="label" data-i18n="points">PONTOS</span><strong id="score">00000</strong><span class="label phase-label">FASE 1</span></aside>
          <div class="board-wrap"><canvas id="board" width="504" height="504" aria-label="Tabuleiro Pac-Man" role="img" data-i18n-fallback="canvasFallback">Seu navegador não suporta Canvas.</canvas>
            <div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-labelledby="overlayTitle" aria-describedby="overlayText" aria-hidden="false"><div class="overlay-panel"><div class="mini-pac" aria-hidden="true"></div><h1 id="overlayTitle" data-i18n="ready">PRONTO!</h1>
              <p id="overlayText" data-i18n="instruction">Use as setas para jogar</p><button type="button" id="startButton" data-i18n="start">JOGAR</button></div></div>
          </div>
          <aside class="lives-card"><span class="label" data-i18n="lives">VIDAS</span><div id="lives" class="lives" aria-label="3 vidas" aria-live="polite"></div></aside>
        </section>
        <div class="mobile-controls" aria-label="Controles" data-i18n-aria="mobileControls">
          <button type="button" data-dir="up" aria-label="Mover para cima" data-i18n-aria="moveUp">▲</button><button type="button" data-dir="left" aria-label="Mover para esquerda" data-i18n-aria="moveLeft">◀</button><button type="button" data-dir="down" aria-label="Mover para baixo" data-i18n-aria="moveDown">▼</button><button type="button" data-dir="right" aria-label="Mover para direita" data-i18n-aria="moveRight">▶</button>
        </div>
        <footer class="game-controls" aria-label="Controles do jogo" data-i18n-aria="gameControls">
          <span class="controls-label" data-i18n="controls">CONTROLES</span>
          <button type="button" class="control-key control-key-up" data-dir="up" aria-label="Mover para cima" data-i18n-aria="moveUp"><span>W</span><small>▲</small></button>
          <button type="button" class="control-key control-key-left" data-dir="left" aria-label="Mover para esquerda" data-i18n-aria="moveLeft"><span>A</span><small>◀</small></button>
          <button type="button" class="control-key control-key-down" data-dir="down" aria-label="Mover para baixo" data-i18n-aria="moveDown"><span>S</span><small>▼</small></button>
          <button type="button" class="control-key control-key-right" data-dir="right" aria-label="Mover para direita" data-i18n-aria="moveRight"><span>D</span><small>▶</small></button>
          <button type="button" class="control-key control-key-enter" data-action="enter" aria-label="Confirmar" data-i18n-aria="confirm"><span data-i18n="confirm">CONFIRMAR</span><small>▶|</small></button>
        </footer>
      </main>`;
  }

  updateHud(score, lives, level) {
    this.hud = { score, lives, level };
    this.score.textContent = String(score).padStart(5, "0");
    this.lives.replaceChildren();
    for (let index = 0; index < lives; index++) {
      const life = document.createElement("span");
      life.className = "life";
      this.lives.append(life);
    }
    this.lives.setAttribute(
      "aria-label",
      this.i18n.t("livesCount", { count: lives }),
    );
    this.phase.textContent = this.i18n.t("phase", { level });
    document.querySelector('[data-i18n="points"]').textContent =
      this.i18n.t("points");
    document.querySelector('[data-i18n="lives"]').textContent =
      this.i18n.t("lives");
  }

  showOverlay(titleKey, textKey, textVariables, buttonKey) {
    this.overlayContent = {
      titleKey,
      textKey,
      textVariables,
      buttonKey,
    };
    this.refreshOverlay();
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

  applyTranslations() {
    this.languageButton.setAttribute("aria-label", this.i18n.t("language"));
    const languageFlags = {
      "pt-BR":
        '<svg viewBox="0 0 30 20" role="presentation"><rect width="30" height="20" rx="2" fill="#009b3a"/><path d="M15 2.5 27 10 15 17.5 3 10Z" fill="#ffdf00"/><circle cx="15" cy="10" r="5" fill="#002776"/></svg>',
      "en-US":
        '<svg viewBox="0 0 30 20" role="presentation"><rect width="30" height="20" rx="2" fill="#fff"/><path d="M0 2h30M0 6h30M0 10h30M0 14h30M0 18h30" stroke="#b22234" stroke-width="2"/><rect width="12" height="11" rx="1" fill="#3c3b6e"/></svg>',
      "es-ES":
        '<svg viewBox="0 0 30 20" role="presentation"><rect width="30" height="20" rx="2" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/></svg>',
    };
    this.languageFlag.innerHTML = languageFlags[this.i18n.locale];
    this.languageMenuButtons.forEach((button) => {
      const selected = button.dataset.locale === this.i18n.locale;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-checked", String(selected));
    });
    for (const element of document.querySelectorAll("[data-i18n]")) {
      const key = element.dataset.i18n;
      element.textContent = this.i18n.t(key);
    }
    for (const element of document.querySelectorAll("[data-i18n-aria]")) {
      element.setAttribute("aria-label", this.i18n.t(element.dataset.i18nAria));
    }
    for (const element of document.querySelectorAll("[data-i18n-fallback]")) {
      element.textContent = this.i18n.t(element.dataset.i18nFallback);
    }
    this.setSoundEnabled(this.soundEnabled !== false);
    this.hud && this.updateHud(this.hud.score, this.hud.lives, this.hud.level);
  }

  refreshOverlay() {
    if (!this.overlayContent) {
      this.overlayTitle.textContent = this.i18n.t("ready");
      this.overlayText.textContent = this.i18n.t("instruction");
      this.startButton.textContent = this.i18n.t("start");
      return;
    }
    this.overlayTitle.textContent = this.i18n.t(this.overlayContent.titleKey);
    this.overlayText.textContent = this.i18n.t(
      this.overlayContent.textKey,
      this.overlayContent.textVariables,
    );
    this.startButton.textContent = this.i18n.t(this.overlayContent.buttonKey);
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    this.soundButton.classList.toggle("muted", !enabled);
    this.soundButton.textContent = enabled ? "♪" : "×";
    this.soundButton.setAttribute("aria-pressed", String(enabled));
    this.soundButton.setAttribute("aria-label", this.i18n.t("soundToggle"));
    this.soundButton.title = enabled
      ? this.i18n.t("disableSound")
      : this.i18n.t("enableSound");
  }

  setControlsBlocked(blocked) {
    for (const controls of [this.mobileControls, this.gameControls]) {
      if (!controls) continue;
      if (blocked) controls.setAttribute("inert", "");
      else controls.removeAttribute("inert");
    }
  }

  toggleLanguageMenu() {
    const willOpen = this.languageMenu.hidden;
    if (willOpen) {
      this.languageMenu.hidden = false;
      this.languageButton.setAttribute("aria-expanded", "true");
      this.languageButton.classList.add("open");
      this.languageMenuButtons
        .find((button) => button.dataset.locale === this.i18n.locale)
        ?.focus();
    } else {
      this.closeLanguageMenu();
    }
  }

  closeLanguageMenu() {
    this.languageMenu.hidden = true;
    this.languageButton.setAttribute("aria-expanded", "false");
    this.languageButton.classList.remove("open");
  }

  destroy() {
    this.unsubscribe?.();
    this.languageButton?.removeEventListener(
      "click",
      this.languageToggleHandler,
    );
    this.languageMenuButtons?.forEach((button) =>
      button.removeEventListener("click", this.languageOptionHandler),
    );
    document.removeEventListener("pointerdown", this.languageOutsideHandler);
    document.removeEventListener("keydown", this.languageKeyHandler);
  }
}
