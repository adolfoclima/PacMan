export class InputController {
  constructor(getPlayer, ui, audioService, startGame, isRunning) {
    this.getPlayer = getPlayer;
    this.ui = ui;
    this.audioService = audioService;
    this.startGame = startGame;
    this.isRunning = isRunning;
    this.directionButtons = [];
    this.enterTimeout = null;
    this.bind();
  }

  bind() {
    this.keydownHandler = (event) => {
      const keyMap = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        a: "left",
        d: "right",
        w: "up",
        s: "down",
      };
      const direction = keyMap[event.key] || keyMap[event.key.toLowerCase()];
      if (direction) {
        event.preventDefault();
        if (!this.ui.overlay.classList.contains("hidden")) return;
        this.setPlayerDirection(direction);
        this.audioService.ensureContext();
        this.audioService.direction(direction);
      }
      if (
        event.key === "Enter" &&
        !event.repeat &&
        !this.ui.overlay.classList.contains("hidden")
      ) {
        event.preventDefault();
        this.ui.startButton.click();
      }
    };
    window.addEventListener("keydown", this.keydownHandler);
    this.keyupHandler = () => {
      document
        .querySelectorAll(".control-key.active")
        .forEach((key) => key.classList.remove("active"));
    };
    this.blurHandler = this.keyupHandler;
    window.addEventListener("keyup", this.keyupHandler);
    window.addEventListener("blur", this.blurHandler);

    document.querySelectorAll("[data-dir]").forEach((button) => {
      const setDirection = (event) => {
        if (event?.cancelable) event.preventDefault();
        if (!this.ui.overlay.classList.contains("hidden")) return;
        this.setPlayerDirection(button.dataset.dir);
        this.audioService.ensureContext();
        this.audioService.direction(button.dataset.dir);
        document
          .querySelectorAll(".control-key")
          .forEach((key) => key.classList.remove("active"));
        if (button.classList.contains("control-key"))
          button.classList.add("active");
      };

      button.addEventListener("pointerdown", setDirection);
      const keydownDirection = (event) => {
        if (event.key === "Enter" || event.key === " ") setDirection(event);
      };
      const pointerUpDirection = () => button.classList.remove("active");
      const pointerLeaveDirection = () => button.classList.remove("active");
      button.addEventListener("keydown", keydownDirection);
      button.addEventListener("pointerup", pointerUpDirection);
      button.addEventListener("pointerleave", pointerLeaveDirection);
      button.addEventListener("pointercancel", pointerLeaveDirection);
      this.directionButtons.push({
        button,
        setDirection,
        keydownDirection,
        pointerUpDirection,
        pointerLeaveDirection,
      });
    });

    this.startHandler = () => this.startGame();
    this.soundHandler = () => this.toggleSound();
    this.ui.startButton.addEventListener("click", this.startHandler);
    this.ui.soundButton.addEventListener("click", this.soundHandler);

    this.activateEnter = (event) => {
      if (event?.cancelable) event.preventDefault();
      this.ui.enterControl.classList.add("active");
      if (this.enterTimeout !== null) window.clearTimeout(this.enterTimeout);
      this.enterTimeout = window.setTimeout(
        () => this.ui.enterControl.classList.remove("active"),
        120,
      );
      if (!this.ui.overlay.classList.contains("hidden"))
        this.ui.startButton.click();
    };
    this.ui.enterControl.addEventListener("pointerdown", this.activateEnter);
    this.enterKeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") this.activateEnter(event);
    };
    this.ui.enterControl.addEventListener("keydown", this.enterKeydown);
    this.initialPointerHandler = () => {
      this.audioService.ensureContext();
      if (!this.ui.overlay.classList.contains("hidden"))
        this.audioService.menu();
    };
    window.addEventListener("pointerdown", this.initialPointerHandler, {
      once: true,
    });
  }

  setPlayerDirection(direction) {
    const player = this.getPlayer();
    player.nextDir = direction;
    player.nextDirExpires = performance.now() + 700;
  }

  toggleSound() {
    const enabled = !this.audioService.enabled;
    this.audioService.setEnabled(enabled);
    this.ui.setSoundEnabled(enabled);
    if (enabled) {
      this.audioService.ensureContext();
      this.audioService.menu();
      if (this.isRunning()) this.audioService.startAmbient();
    }
  }

  destroy() {
    if (this.enterTimeout !== null) window.clearTimeout(this.enterTimeout);
    window.removeEventListener("keydown", this.keydownHandler);
    window.removeEventListener("keyup", this.keyupHandler);
    window.removeEventListener("blur", this.blurHandler);
    window.removeEventListener("pointerdown", this.initialPointerHandler);
    this.ui.startButton.removeEventListener("click", this.startHandler);
    this.ui.soundButton.removeEventListener("click", this.soundHandler);
    this.ui.enterControl.removeEventListener("pointerdown", this.activateEnter);
    this.ui.enterControl.removeEventListener("keydown", this.enterKeydown);
    for (const {
      button,
      setDirection,
      keydownDirection,
      pointerUpDirection,
      pointerLeaveDirection,
    } of this.directionButtons) {
      button.removeEventListener("pointerdown", setDirection);
      button.removeEventListener("keydown", keydownDirection);
      button.removeEventListener("pointerup", pointerUpDirection);
      button.removeEventListener("pointerleave", pointerLeaveDirection);
      button.removeEventListener("pointercancel", pointerLeaveDirection);
    }
  }
}
