export class InputController {
  constructor (getPlayer, ui, audioService, startGame, isRunning) {
    this.getPlayer = getPlayer
    this.ui = ui
    this.audioService = audioService
    this.startGame = startGame
    this.isRunning = isRunning
    this.bind()
  }

  bind () {
    window.addEventListener('keydown', event => {
      const keyMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' }
      const direction = keyMap[event.key] || keyMap[event.key.toLowerCase()]
      if (direction) {
        event.preventDefault()
        this.setPlayerDirection(direction)
      }
      if (event.key === 'Enter' && !event.repeat && !this.ui.overlay.classList.contains('hidden')) {
        event.preventDefault()
        this.ui.startButton.click()
      }
    })

    document.querySelectorAll('[data-dir]').forEach(button => {
      const setDirection = event => {
        if (event?.cancelable) event.preventDefault()
        this.setPlayerDirection(button.dataset.dir)
        this.audioService.ensureContext()
        this.audioService.direction(button.dataset.dir)
        document.querySelectorAll('.control-key').forEach(key => key.classList.remove('active'))
        if (button.classList.contains('control-key')) button.classList.add('active')
      }

      button.addEventListener('pointerdown', setDirection)
      button.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') setDirection(event)
      })
      button.addEventListener('pointerup', () => button.classList.remove('active'))
      button.addEventListener('pointerleave', () => button.classList.remove('active'))
    })

    this.ui.startButton.addEventListener('click', () => this.startGame())
    this.ui.soundButton.addEventListener('click', () => this.toggleSound())

    const activateEnter = event => {
      if (event?.cancelable) event.preventDefault()
      this.ui.enterControl.classList.add('active')
      window.setTimeout(() => this.ui.enterControl.classList.remove('active'), 120)
      if (!this.ui.overlay.classList.contains('hidden')) this.ui.startButton.click()
    }
    this.ui.enterControl.addEventListener('pointerdown', activateEnter)
    this.ui.enterControl.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') activateEnter(event)
    })
    window.addEventListener('pointerdown', () => {
      this.audioService.ensureContext()
      if (!this.ui.overlay.classList.contains('hidden')) this.audioService.menu()
    }, { once: true })
  }

  setPlayerDirection (direction) {
    const player = this.getPlayer()
    player.nextDir = direction
    player.nextDirExpires = performance.now() + 300
  }

  toggleSound () {
    const enabled = !this.audioService.enabled
    this.audioService.setEnabled(enabled)
    this.ui.setSoundEnabled(enabled)
    if (enabled) {
      this.audioService.ensureContext()
      this.audioService.menu()
      if (this.isRunning()) this.audioService.startAmbient()
    }
  }
}
