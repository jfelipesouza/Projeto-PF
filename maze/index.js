const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const gameOverMessage = document.getElementById('gameOverMessage')

// Ajusta o tamanho do canvas
canvas.width = window.innerWidth / 1.55 // Largura total da tela
canvas.height = window.innerHeight * 0.92 // Metade da altura da tela

// Configurações iniciais
const player = {
  x: 120, // Posição inicial do jogador em X
  y: 140, // Posição inicial do jogador em Y
  size: 20,
  speed: 5,
  color: 'blue'
}

const wallSize = 40

let cameraX = 0
const cameraSpeed = 0 // Velocidade da câmera
const stageWidth = 2000 // Largura da fase (maior que o canvas)
let gameStarted = false // Para controlar o início do jogo
let gameOver = false // Para controlar se o jogo está no estado de "game over"
let animationFrameId // Para armazenar o ID da animação
let moveDirection = null // Para armazenar a direção do movimento

// Labirinto
let maze = []
// Chegada do Labirinto
let endPoint = null
// Verifica o fim de jogo

let endPosition = null // Variável para armazenar a posição do fim

// Cria um labirinto aleatorio

const generateMaze = (width, height) => {
  const newMaze = Array.from({ length: height }, () => Array(width).fill(1))

  const inBounds = (x, y) => x >= 0 && x < width && y >= 0 && y < height

  const directions = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0]
  ]

  const carve = (x, y) => {
    newMaze[y][x] = 0 // Marca a célula atual como caminho (0)

    for (let [dx, dy] of directions.sort(() => Math.random() - 0.5)) {
      const nx = x + dx
      const ny = y + dy

      if (inBounds(nx, ny) && newMaze[ny][nx] === 1) {
        newMaze[y + dy / 2][x + dx / 2] = 0
        carve(nx, ny)
      }
    }
  }

  const startX = Math.floor(Math.random() * (width / 2)) * 2 + 1
  const startY = Math.floor(Math.random() * (height / 2)) * 2 + 1
  carve(startX, startY)

  // Encontre um ponto aleatório para o final do labirinto
  let foundEnd = false
  while (!foundEnd) {
    const randX = Math.floor(Math.random() * width)
    const randY = Math.floor(Math.random() * height)
    if (newMaze[randY][randX] === 0) {
      endPosition = { x: randX, y: randY }
      foundEnd = true
    }
  }

  return newMaze
}

// Atualize a função de desenho do labirinto
const drawMaze = () => {
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      ctx.fillStyle = maze[row][col] === 1 ? 'black' : 'white'
      ctx.fillRect(col * wallSize - cameraX, row * wallSize, wallSize, wallSize)
    }
  }

  // Desenhe o ponto final em verde, se definido
  if (endPosition) {
    ctx.fillStyle = 'green'
    ctx.fillRect(
      endPosition.x * wallSize - cameraX,
      endPosition.y * wallSize,
      wallSize,
      wallSize
    )
  }
}

// Atualize a função de verificação de fim de jogo
const checkGameOver = () => {
  // Verifica se o jogador atingiu o fim do labirinto
  if (
    endPosition &&
    player.x >= endPosition.x * wallSize - cameraX &&
    player.x < endPosition.x * wallSize - cameraX + wallSize &&
    player.y >= endPosition.y * wallSize &&
    player.y < endPosition.y * wallSize + wallSize
  ) {
    gameOver = true
    gameOverMessage.style.display = 'block'
    cancelAnimationFrame(animationFrameId)
  }

  // Verifica se o jogador saiu da câmera
  if (player.x < cameraX) {
    gameOver = true
    gameOverMessage.style.display = 'block'
    cancelAnimationFrame(animationFrameId)
  }
}

// Verifica se a próxima posição é uma parede
const isWall = (x, y) => {
  const col = Math.floor(x / wallSize)
  const row = Math.floor(y / wallSize)
  return maze[row] && maze[row][col] === 1 // Verifica se é uma parede
}

// Movimenta o jogador na direção especificada até colidir com uma parede
const movePlayer = () => {
  if (moveDirection && !gameOver) {
    let nextX = player.x
    let nextY = player.y

    switch (moveDirection) {
      case 'up':
        nextY -= player.speed
        break
      case 'down':
        nextY += player.speed
        break
      case 'left':
        nextX -= player.speed
        break
      case 'right':
        nextX += player.speed
        break
    }

    // Verifica se a próxima posição é uma parede
    if (!isWall(nextX, nextY)) {
      player.x = nextX
      player.y = nextY
    }
  }
}

// Desenha o personagem
const drawPlayer = () => {
  ctx.fillStyle = player.color
  ctx.fillRect(player.x - cameraX, player.y, player.size, player.size) // Ajuste com base na câmera
}

// Função principal do jogo
const gameLoop = () => {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    cameraX += cameraSpeed // Move a câmera

    drawMaze()
    drawPlayer()
    movePlayer() // Movimenta o jogador
    checkGameOver()

    animationFrameId = requestAnimationFrame(gameLoop)
  }
}

// Controla o início do jogo e a direção do movimento
const controlPlayer = event => {
  if (!gameStarted) {
    gameStarted = true
    gameLoop()
  }

  if (!gameOver) {
    const key = event.key
    if (key === 'ArrowUp') {
      moveDirection = 'up'
    }
    if (key === 'ArrowDown') {
      moveDirection = 'down'
    }
    if (key === 'ArrowLeft') {
      moveDirection = 'left'
    }
    if (key === 'ArrowRight') {
      moveDirection = 'right'
    }
  }
}

// Para o movimento ao soltar a tecla
const stopPlayer = event => {
  const key = event.key
  if (
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight'
  ) {
    moveDirection = null // Para o movimento
  }
}

// Escuta os eventos de teclado para mover o personagem
window.addEventListener('keydown', controlPlayer)
window.addEventListener('keyup', stopPlayer)
window.addEventListener('load', () => {
  maze = generateMaze(31, 22)
  gameStarted = true
  gameLoop()
})
