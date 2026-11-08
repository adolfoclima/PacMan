import './style.css'

document.querySelector('#app').innerHTML = `
  <main class="game-shell">
    <header class="topbar">
      <div class="brand"><span class="brand-dot"></span>PAC-MAN</div>
      <button class="sound-button" id="soundButton" aria-label="Alternar som" aria-pressed="false" title="Desativar som">♪</button>
    </header>

    <section class="game-area">
      <aside class="score-card">
        <span class="label">SCORE</span>
        <strong id="score">00000</strong>
        <span class="label phase-label">PHASE 1</span>
      </aside>

      <div class="board-wrap">
        <canvas id="board" width="504" height="504" aria-label="Tabuleiro Pac-Man"></canvas>
        <div class="overlay" id="overlay">
          <div class="overlay-panel">
            <div class="mini-pac"></div>
            <h1 id="overlayTitle">READY!</h1>
            <p id="overlayText">Use as setas para jogar</p>
            <button id="startButton">JOGAR</button>
          </div>
        </div>
      </div>

      <aside class="lives-card">
        <span class="label">LIVES</span>
        <div id="lives" class="lives"></div>
      </aside>
    </section>

    <div class="mobile-controls" aria-label="Controles">
      <button data-dir="up">▲</button>
      <button data-dir="left">◀</button>
      <button data-dir="down">▼</button>
      <button data-dir="right">▶</button>
    </div>

    <footer class="game-controls" aria-label="Controles do jogo">
      <span class="controls-label">CONTROLES</span>
      <div class="control-key control-key-up" data-dir="up" role="button" tabindex="0">
        <span>W</span>
        <small>▲</small>
      </div>
      <div class="control-key control-key-left" data-dir="left" role="button" tabindex="0">
        <span>A</span>
        <small>◀</small>
      </div>
      <div class="control-key control-key-down" data-dir="down" role="button" tabindex="0">
        <span>S</span>
        <small>▼</small>
      </div>
      <div class="control-key control-key-right" data-dir="right" role="button" tabindex="0">
        <span>D</span>
        <small>▶</small>
      </div>
      <div class="control-key control-key-enter" data-action="enter" role="button" tabindex="0">
        <span>ENTER</span>
        <small>▶|</small>
      </div>
    </footer>
  </main>
`

const canvas = document.querySelector('#board')
const ctx = canvas.getContext('2d')
const TILE = 24
const COLS = 21
const ROWS = 21

let map
let tunnelOrientation = 'horizontal'
let tunnelVerticalCol = 10

const directions = {
  left: { x: -1, y: 0, angle: Math.PI },
  right: { x: 1, y: 0, angle: 0 },
  up: { x: 0, y: -1, angle: -Math.PI / 2 },
  down: { x: 0, y: 1, angle: Math.PI / 2 },
  none: { x: 0, y: 0, angle: 0 }
}

let player, ghosts, score, lives, level = 1, running = false, frightenedUntil = 0
let lastTime = 0
const scoreEl = document.querySelector('#score')
const livesEl = document.querySelector('#lives')
const overlay = document.querySelector('#overlay')
const overlayTitle = document.querySelector('#overlayTitle')
const overlayText = document.querySelector('#overlayText')
const startButton = document.querySelector('#startButton')

let audioContext
let masterGain
let ambientGain
let ambientOscillators = []
let soundEnabled = true
let normalPelletTone = false
let wallSoundAt = 0

function ensureAudio () {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!audioContext) {
    audioContext = new AudioContextClass()
    masterGain = audioContext.createGain()
    masterGain.gain.value = 0.45
    masterGain.connect(audioContext.destination)
  }
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

function playTone (frequency, duration = 0.08, type = 'square', volume = 0.12, delay = 0) {
  if (!soundEnabled) return
  if (!ensureAudio()) return
  const startAt = audioContext.currentTime + delay
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)
  gain.gain.setValueAtTime(volume, startAt)
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
  oscillator.connect(gain)
  gain.connect(masterGain)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration)
}

function playNotes (notes, duration = 0.08, type = 'square', volume = 0.12) {
  notes.forEach((frequency, index) => playTone(frequency, duration, type, volume, index * duration))
}

function playMenuSound () {
  playNotes([440, 554, 659], 0.07, 'triangle', 0.1)
}

function playGameOverSound () {
  playNotes([392, 330, 262, 196, 131], 0.18, 'sawtooth', 0.13)
}

function startAmbientSound () {
  if (!soundEnabled || ambientGain) return
  ensureAudio()
  ambientGain = audioContext.createGain()
  ambientGain.gain.value = 0.018
  ambientGain.connect(masterGain)
  for (const frequency of [55, 82.4]) {
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    oscillator.connect(ambientGain)
    oscillator.start()
    ambientOscillators.push(oscillator)
  }
}

function stopAmbientSound () {
  if (!ambientGain) return
  ambientOscillators.forEach(oscillator => {
    try { oscillator.stop() } catch {}
  })
  ambientOscillators = []
  ambientGain.disconnect()
  ambientGain = null
}

function resetPositions () {
  player = { x: 10.5 * TILE, y: 16.5 * TILE, dir: 'left', nextDir: 'left', mouth: 0, centerLock: false }
  ghosts = [
    { x: 9.5 * TILE, y: 10.5 * TILE, dir: 'left', color: '#ff4b4b', speed: 78, centerLock: false, personality: 'chaser' },
    { x: 10.5 * TILE, y: 10.5 * TILE, dir: 'up', color: '#ffb8d1', speed: 72, centerLock: false, personality: 'ambusher' },
    { x: 11.5 * TILE, y: 10.5 * TILE, dir: 'right', color: '#55d9ff', speed: 68, centerLock: false, personality: 'wanderer' }
  ]
}

function resetGame () {
  generateLevel(level)
  score = 0
  lives = 3
  resetPositions()
  updateHud()
}

function updateHud () {
  scoreEl.textContent = String(score).padStart(5, '0')
  livesEl.innerHTML = Array.from({ length: lives }, () => '<span class="life"></span>').join('')
  document.querySelector('.phase-label').textContent = `PHASE ${level}`
}

function generateLevel (phase) {
  const templates = [
    [
      '#####################',
      '#.........#.........#',
      '#.###.###.#.###.###.#',
      '#o..#.....#.....#..o#',
      '###.#.###.#.###.#.###',
      '#...#.....#.....#...#',
      '#.###.###.#.###.###.#',
      '#...................#',
      '#.###.#.#####.#.###.#',
      '#.....#...#...#.....#',
      '.....................',
      '#.###.#.#####.#.###.#',
      '#...................#',
      '#.###.###.#.###.###.#',
      '#...#.....#.....#...#',
      '###.#.###.#.###.#.###',
      '#o..#.....#.....#..o#',
      '#.........#.........#',
      '#.###.###.#.###.###.#',
      '#...................#',
      '#####################'
    ],
    [
      '#####################',
      '#.........#.........#',
      '#.###.###.#.###.###.#',
      '#o..#...........#..o#',
      '#.###.#.###.#.###.#.#',
      '#.....#.....#.....#.#',
      '#.########.########.#',
      '#...................#',
      '#.###.#.#####.#.###.#',
      '#.....#.......#.....#',
      '.....................',
      '#.###.#.#####.#.###.#',
      '#...................#',
      '#.########.########.#',
      '#.....#.....#.....#.#',
      '#.###.#.###.#.###.#.#',
      '#o..#...........#..o#',
      '#.###.###.#.###.###.#',
      '#.........#.........#',
      '#...................#',
      '#####################'
    ]
  ]

  let chosen = templates[(phase - 1 + Math.floor(Math.random() * templates.length)) % templates.length]
  const reverseHorizontal = phase % 2 === 0 || Math.random() > 0.5
  if (reverseHorizontal) chosen = chosen.map(row => [...row].reverse().join(''))

  map = chosen.map(row => row.padEnd(COLS, '.').slice(0, COLS).split('').map(cell => cell === '#' ? '#' : '.'))

  const tunnelRoll = Math.random()
  tunnelOrientation = tunnelRoll < 0.78 ? 'horizontal' : tunnelRoll < 0.97 ? 'vertical' : 'both'

  // Horizontal tunnel: the broad center corridor connects both sides.
  if (tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') {
    map[10] = Array.from({ length: COLS }, () => '.')
  } else {
    for (let col = 0; col < COLS; col++) {
      if (col === 10) continue
      if (map[10]?.[col] !== '#') map[10][col] = '.'
    }
  }

  // Vertical tunnel: a rare top-to-bottom opening in a central corridor.
  if (tunnelOrientation === 'vertical' || tunnelOrientation === 'both') {
    tunnelVerticalCol = 10
    map[0][tunnelVerticalCol] = '.'
    map[ROWS - 1][tunnelVerticalCol] = '.'
    for (let row = 1; row < ROWS - 1; row++) {
      if (map[row][tunnelVerticalCol] === '#') {
        map[row][tunnelVerticalCol] = '.'
      }
    }
  }

  // Rebuild reachable food cells from the spawn. This prevents pellets in isolated or inaccessible spaces.
  const startRow = 16
  const startCol = 10
  const reachable = new Set([`${startRow},${startCol}`])
  const queue = [[startRow, startCol]]

  while (queue.length) {
    const [row, col] = queue.shift()
    for (const direction of Object.values(directions)) {
      if (direction.x === 0 && direction.y === 0) continue
      let nextRow = row + direction.y
      let nextCol = col + direction.x
      if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && row === 10 && nextCol < 0) nextCol = COLS - 1
      if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && row === 10 && nextCol >= COLS) nextCol = 0
      if ((tunnelOrientation === 'vertical' || tunnelOrientation === 'both') && col === tunnelVerticalCol && nextRow < 0) nextRow = ROWS - 1
      if ((tunnelOrientation === 'vertical' || tunnelOrientation === 'both') && col === tunnelVerticalCol && nextRow >= ROWS) nextRow = 0
      if (nextCol < 0 || nextCol >= COLS) continue
      if (nextRow < 0 || nextRow >= ROWS || map[nextRow][nextCol] === '#') continue
      const key = `${nextRow},${nextCol}`
      if (reachable.size >= ROWS * COLS) continue
      if (!reachable.has(key)) {
        reachable.add(key)
        queue.push([nextRow, nextCol])
      }
    }
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (map[row][col] === '#') continue
      if (!reachable.has(`${row},${col}`)) {
        map[row][col] = '#'
        continue
      }
      map[row][col] = '.'
    }
  }

  for (const [row, col] of [[3, 1], [3, 19], [16, 1], [16, 19]]) {
    if (map[row]?.[col] === '.') map[row][col] = 'o'
  }

  if (tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') {
    map[10][0] = '.'
    map[10][COLS - 1] = '.'
  }
}

function isWallAt (x, y) {
  const col = Math.floor(x / TILE)
  const row = Math.floor(y / TILE)
  return row < 0 || row >= ROWS || col < 0 || col >= COLS || map[row][col] === '#'
}

function atCenter (value) {
  const gridPosition = (value - TILE / 2) / TILE
  return Math.abs(gridPosition - Math.round(gridPosition)) < 0.065
}

function canMove (x, y, dir) {
  const d = directions[dir]
  if (!d || dir === 'none') return false
  const col = Math.round((x - TILE / 2) / TILE) + d.x
  const row = Math.round((y - TILE / 2) / TILE) + d.y
  const centerCol = Math.round((x - TILE / 2) / TILE)
  const centerRow = Math.round((y - TILE / 2) / TILE)
  if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && row === 10 && (col < 0 || col >= COLS)) return true
  if ((tunnelOrientation === 'vertical' || tunnelOrientation === 'both') &&
      centerCol === tunnelVerticalCol && (row < 0 || row >= ROWS)) return true
  return row >= 0 && row < ROWS && col >= 0 && col < COLS && map[row][col] !== '#'
}

function snap (entity) {
  const gx = Math.round((entity.x - TILE / 2) / TILE)
  const gy = Math.round((entity.y - TILE / 2) / TILE)
  entity.x = gx * TILE + TILE / 2
  entity.y = gy * TILE + TILE / 2
}

function moveEntity (entity, speed, dt) {
  const xDistance = Math.abs(((entity.x - TILE / 2) / TILE) - Math.round((entity.x - TILE / 2) / TILE))
  const yDistance = Math.abs(((entity.y - TILE / 2) / TILE) - Math.round((entity.y - TILE / 2) / TILE))
  if (xDistance > 0.08 || yDistance > 0.08) entity.centerLock = false

  if (!entity.centerLock && atCenter(entity.x) && atCenter(entity.y)) {
    entity.centerLock = true
    snap(entity)
    if (entity.nextDir && canMove(entity.x, entity.y, entity.nextDir)) {
      entity.dir = entity.nextDir
    }
    if (!canMove(entity.x, entity.y, entity.dir)) {
      entity.dir = 'none'
      entity.centerLock = false
      const now = performance.now()
      if (entity === player && now - wallSoundAt > 180) {
        wallSoundAt = now
        playTone(95, 0.035, 'square', 0.05)
      }
    }
  }
  const d = directions[entity.dir] || directions.none
  entity.x += d.x * speed * dt
  entity.y += d.y * speed * dt
  const entityRow = Math.round((entity.y - TILE / 2) / TILE)
  const entityCol = Math.round((entity.x - TILE / 2) / TILE)
  if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && entityRow === 10) {
    if (entity.x < -TILE / 2) {
      entity.x = canvas.width + TILE / 2
      if (entity === player) playNotes([220, 330], 0.04, 'sine', 0.08)
    }
    if (entity.x > canvas.width + TILE / 2) {
      entity.x = -TILE / 2
      if (entity === player) playNotes([220, 330], 0.04, 'sine', 0.08)
    }
  }
  if (tunnelOrientation === 'vertical' || tunnelOrientation === 'both') {
    if (entityCol === tunnelVerticalCol && entity.y < -TILE / 2) {
      entity.y = canvas.height + TILE / 2
      if (entity === player) playNotes([220, 330], 0.04, 'sine', 0.08)
    }
    if (entityCol === tunnelVerticalCol && entity.y > canvas.height + TILE / 2) {
      entity.y = -TILE / 2
      if (entity === player) playNotes([220, 330], 0.04, 'sine', 0.08)
    }
  }
}

function collectPellet () {
  const col = Math.round((player.x - TILE / 2) / TILE)
  const row = Math.round((player.y - TILE / 2) / TILE)
  if (map[row]?.[col] === '.' || map[row]?.[col] === 'o') {
    const pellet = map[row][col]
    score += pellet === 'o' ? 50 : 10
    map[row][col] = ' '
    if (pellet === 'o') {
      frightenedUntil = performance.now() + 7000
      playNotes([220, 277, 330, 440], 0.09, 'square', 0.1)
    } else {
      normalPelletTone = !normalPelletTone
      playTone(normalPelletTone ? 180 : 260, 0.045, 'square', 0.055)
    }
    updateHud()
  }
  if (!map.some(row => row.includes('.') || row.includes('o'))) {
    running = false
    stopAmbientSound()
    playNotes([523, 659, 784, 1047], 0.12, 'triangle', 0.14)
    level++
    overlayTitle.textContent = 'YOU WIN!'
    overlayText.textContent = `Fase ${level - 1} concluída · Próxima fase: ${level}`
    startButton.textContent = 'JOGAR NOVAMENTE'
    overlay.classList.remove('hidden')
  }
}

function ghostMove (ghost, dt, now) {
  const xDistance = Math.abs(((ghost.x - TILE / 2) / TILE) - Math.round((ghost.x - TILE / 2) / TILE))
  const yDistance = Math.abs(((ghost.y - TILE / 2) / TILE) - Math.round((ghost.y - TILE / 2) / TILE))
  if (xDistance > 0.08 || yDistance > 0.08) ghost.centerLock = false

  if (!ghost.centerLock && atCenter(ghost.x) && atCenter(ghost.y)) {
    ghost.centerLock = true
    snap(ghost)
    const gx = Math.round((ghost.x - TILE / 2) / TILE)
    const gy = Math.round((ghost.y - TILE / 2) / TILE)
    let options = Object.keys(directions).filter(dir => dir !== 'none' && canMove(ghost.x, ghost.y, dir))
    const reverse = { left: 'right', right: 'left', up: 'down', down: 'up' }[ghost.dir]
    const forwardOptions = options.filter(dir => dir !== reverse)
    if (forwardOptions.length) options = forwardOptions

    if (options.length) {
      const px = Math.round((player.x - TILE / 2) / TILE)
      const py = Math.round((player.y - TILE / 2) / TILE)
      const playerDir = directions[player.dir] || directions.none
      const target = { x: px, y: py }

      if (ghost.personality === 'ambusher') {
        target.x = px + playerDir.x * 4
        target.y = py + playerDir.y * 4
      } else if (ghost.personality === 'wanderer') {
        if (Math.random() < 0.45) {
          target.x = gx < COLS / 2 ? COLS - 3 : 3
          target.y = gy < ROWS / 2 ? ROWS - 3 : 3
        }
      }

      let best = options[0]
      let bestDistance = frightenedUntil > now ? -Infinity : Infinity
      for (const dir of options) {
        const d = directions[dir]
        const dx = gx + d.x - target.x
        const dy = gy + d.y - target.y
        const distance = dx * dx + dy * dy
        if ((frightenedUntil > now && distance > bestDistance) || (frightenedUntil <= now && distance < bestDistance)) {
          best = dir
          bestDistance = distance
        }
      }
      ghost.dir = best
    } else {
      ghost.dir = 'none'
      ghost.centerLock = false
    }
  }
  const frightened = frightenedUntil > now
  const d = directions[ghost.dir] || directions.none
  ghost.x += d.x * ghost.speed * dt
  ghost.y += d.y * ghost.speed * dt
  const ghostRow = Math.round((ghost.y - TILE / 2) / TILE)
  const ghostCol = Math.round((ghost.x - TILE / 2) / TILE)
  if ((tunnelOrientation === 'horizontal' || tunnelOrientation === 'both') && ghostRow === 10) {
    if (ghost.x < -TILE / 2) ghost.x = canvas.width + TILE / 2
    if (ghost.x > canvas.width + TILE / 2) ghost.x = -TILE / 2
  }
  if (tunnelOrientation === 'vertical' || tunnelOrientation === 'both') {
    if (ghostCol === tunnelVerticalCol && ghost.y < -TILE / 2) ghost.y = canvas.height + TILE / 2
    if (ghostCol === tunnelVerticalCol && ghost.y > canvas.height + TILE / 2) ghost.y = -TILE / 2
  }
  void frightened
}

function drawWallTile (x, y) {
  ctx.fillStyle = '#202b8f'
  ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4)
  ctx.strokeStyle = '#3b5cff'
  ctx.lineWidth = 2
  ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6)
}

function drawMap () {
  ctx.fillStyle = '#070915'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = map[row][col]
      const x = col * TILE
      const y = row * TILE
      if (cell === '#') drawWallTile(x, y)
      if (cell === '.') {
        ctx.fillStyle = '#ffdda8'
        ctx.beginPath()
        ctx.arc(x + TILE / 2, y + TILE / 2, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      if (cell === 'o') {
        ctx.fillStyle = '#fff1a8'
        ctx.beginPath()
        ctx.arc(x + TILE / 2, y + TILE / 2, 7, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}

function drawPlayer (now) {
  player.mouth += 0.012
  const mouth = 0.16 + Math.abs(Math.sin(player.mouth * 10)) * 0.18
  const angle = directions[player.dir]?.angle || 0
  ctx.fillStyle = '#ffe438'
  ctx.beginPath()
  ctx.moveTo(player.x, player.y)
  ctx.arc(player.x, player.y, 9.5, angle + mouth, angle + Math.PI * 2 - mouth)
  ctx.closePath()
  ctx.fill()
  void now
}

function drawGhost (ghost, now) {
  const frightened = frightenedUntil > now
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
  ctx.fillStyle = frightened ? '#fff' : '#fff'
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

function loseLife () {
  lives--
  stopAmbientSound()
  playNotes([440, 370, 300, 220, 110], 0.12, 'sawtooth', 0.12)
  updateHud()
  if (lives <= 0) {
    running = false
    playGameOverSound()
    overlayTitle.textContent = 'GAME OVER'
    overlayText.textContent = `${score} pontos`
    startButton.textContent = 'TENTAR NOVAMENTE'
    overlay.classList.remove('hidden')
  } else {
    resetPositions()
    window.setTimeout(() => {
      if (running && lives > 0) startAmbientSound()
    }, 900)
  }
}

function loop (now) {
  const dt = Math.min((now - lastTime) / 1000 || 0, 0.033)
  lastTime = now
  drawMap()
  if (running) {
    moveEntity(player, 92, dt)
    collectPellet()
    ghosts.forEach(ghost => ghostMove(ghost, dt, now))
    for (const ghost of ghosts) {
      if (Math.hypot(player.x - ghost.x, player.y - ghost.y) < 15) {
        if (frightenedUntil > now) {
          score += 200
          updateHud()
          playNotes([880, 660, 990], 0.07, 'square', 0.12)
          Object.assign(ghost, { x: 10.5 * TILE, y: 9.5 * TILE, dir: 'left' })
        } else {
          loseLife()
          break
        }
      }
    }
  }
  drawPlayer(now)
  ghosts.forEach(ghost => drawGhost(ghost, now))
  requestAnimationFrame(loop)
}

window.addEventListener('keydown', event => {
  const keyMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' }
  const direction = keyMap[event.key] || keyMap[event.key.toLowerCase()]
  if (direction) {
    event.preventDefault()
    player.nextDir = direction
  }

  if (event.key === 'Enter' && !event.repeat && !overlay.classList.contains('hidden')) {
    event.preventDefault()
    startButton.click()
  }
})

document.querySelectorAll('[data-dir]').forEach(button => {
  const setDirection = (event) => {
    if (event?.cancelable) event.preventDefault()
    player.nextDir = button.dataset.dir
    ensureAudio()
    playTone({ up: 220, down: 196, left: 165, right: 247 }[button.dataset.dir] || 220, 0.025, 'sine', 0.025)
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

startButton.addEventListener('click', () => {
  if (overlayTitle.textContent === 'GAME OVER') level = 1
  ensureAudio()
  playNotes([220, 330, 440, 660], 0.09, 'square', 0.1)
  stopAmbientSound()
  resetGame()
  overlay.classList.add('hidden')
  running = true
  lastTime = performance.now()
  startAmbientSound()
})

document.querySelector('#soundButton').addEventListener('click', event => {
  event.currentTarget.classList.toggle('muted')
  soundEnabled = !event.currentTarget.classList.contains('muted')
  event.currentTarget.textContent = soundEnabled ? '♪' : '×'
  event.currentTarget.setAttribute('aria-pressed', String(!soundEnabled))
  event.currentTarget.title = soundEnabled ? 'Desativar som' : 'Ativar som'
  if (soundEnabled) {
    ensureAudio()
    playMenuSound()
    if (running) startAmbientSound()
  } else {
    stopAmbientSound()
  }
})

const enterControl = document.querySelector('[data-action="enter"]')
const activateEnterControl = event => {
  if (event?.cancelable) event.preventDefault()
  enterControl.classList.add('active')
  window.setTimeout(() => enterControl.classList.remove('active'), 120)
  if (!overlay.classList.contains('hidden')) startButton.click()
}
enterControl.addEventListener('pointerdown', activateEnterControl)
enterControl.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') activateEnterControl(event)
})

window.addEventListener('pointerdown', () => {
  ensureAudio()
  if (!overlay.classList.contains('hidden')) playMenuSound()
}, { once: true })

resetGame()
requestAnimationFrame(loop)
