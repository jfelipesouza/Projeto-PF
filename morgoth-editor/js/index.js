const createHistory = () => {
  let history = []

  const addState = canvas => {
    const state = canvas.toDataURL() // Salva o estado atual da imagem como um Data URL
    history = [...history, state] // Imutabilidade
    return history // Retorna o novo histórico
  }

  const undo = (canvas, canvasContext) => {
    const context = canvasContext.context // Obtenha o contexto correto aqui
    if (history.length > 1) {
      history = history.slice(0, -1) // Remove o estado atual mantendo a imutabilidade
      const previousState = history[history.length - 1]
      const img = new Image()
      img.src = previousState
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height) // Limpa o canvas com o contexto correto
        context.drawImage(img, 0, 0) // Redesenha o estado anterior
      }
    } else if (history.length === 1) {
      history = [] // Limpa o histórico
      context.clearRect(0, 0, canvas.width, canvas.height) // Limpa o canvas
    }
    return history // Retorna o histórico atualizado
  }

  return {
    addState,
    undo,
    getHistoryLength: () => history.length // Função pura para obter o tamanho do histórico
  }
}

const imageHistory = createHistory() // Estado inicial sem imagem

const updateUndoButtonState = historyLength => {
  const undoBtn = document.getElementById('undoBtn')
  undoBtn.disabled = historyLength === 0 // Se não houver histórico, desabilita o botão
}

const loadImage = (imageSrc, canvasContext, canvasDimensions) => {
  const image = new Image()
  image.src = imageSrc

  image.onload = () => {
    const dimensions = renderImage(image, {
      width: image.width,
      height: image.height,
      ...canvasDimensions
    })

    const currentCanvasState = drawImageOnCanvas(
      image,
      canvasContext,
      dimensions
    )
    const historyLength = imageHistory.addState(currentCanvasState).length
    updateUndoButtonState(historyLength) // Atualiza o estado do botão "Undo"
  }
}

const undoLastChange = () => {
  const { canvas, context } = getCanvasContext('canva') // Obtenha tanto o canvas quanto o contexto
  const historyLength = imageHistory.undo(canvas, { canvas, context }).length
  updateUndoButtonState(historyLength) // Atualiza o estado do botão "Undo"
}

const renderImage = (image, canvasDimensions) => {
  const { width, height, maxWidth, maxHeight } = canvasDimensions

  let adjustedWidth = width
  let adjustedHeight = height

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const ratio = Math.min(widthRatio, heightRatio)
    adjustedWidth = width * ratio
    adjustedHeight = height * ratio
  }

  return {
    width: adjustedWidth,
    height: adjustedHeight
  }
}

const getCanvasContext = canvasId => {
  const canvas = document.getElementById(canvasId)
  return {
    canvas,
    context: canvas.getContext('2d')
  }
}

const drawImageOnCanvas = (image, canvasContext, dimensions) => {
  const { canvas, context } = canvasContext
  canvas.width = dimensions.width
  canvas.height = dimensions.height
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height)
  return canvas.toDataURL() // Retorna o estado atual da imagem como string (ou outra representação)
}

const openInput = inputElementId => {
  document.getElementById(inputElementId).click()
}

const handleInputChange = (inputElement, onImageLoad) => {
  const file = inputElement.files[0]
  const image = new Image()

  image.onload = () => {
    onImageLoad(image)
  }

  image.src = URL.createObjectURL(file)
  return image
}

const resetCanvas = (originalImage, canvasContext, canvasDimensions) => {
  drawImageOnCanvas(originalImage, canvasContext, canvasDimensions)
}

// Exemplo de como usar essas funções
document.getElementById('fileInput').addEventListener('change', event => {
  const inputElement = event.target

  const canvasContext = getCanvasContext('canva')
  const previewContent = document.querySelector('.previewContent')
  const canvasDimensions = {
    maxWidth: previewContent.clientWidth,
    maxHeight: previewContent.clientHeight
  }

  handleInputChange(inputElement, image => {
    const dimensions = renderImage(image, {
      width: image.width,
      height: image.height,
      ...canvasDimensions
    })

    drawImageOnCanvas(image, canvasContext, dimensions)
    const historyLength = imageHistory.addState(canvasContext.canvas).length
    updateUndoButtonState(historyLength) // Atualiza o estado do botão "Undo"
  })
})

document.getElementById('undoBtn').addEventListener('click', undoLastChange)
