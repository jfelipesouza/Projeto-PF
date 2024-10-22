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

// Retorna para o estado anterior da imagem
const undoLastChange = () => {
  const { canvas, context } = getCanvasContext('canva') // Obtenha tanto o canvas quanto o contexto
  const historyLength = imageHistory.undo(canvas, { canvas, context }).length
  updateUndoButtonState(historyLength) // Atualiza o estado do botão "Undo"
}

const renderImage = (image, canvasDimensions) => {
  const { width, height, maxWidth, maxHeight } = canvasDimensions

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const ratio = Math.min(widthRatio, heightRatio)
    return {
      width: width * ratio,
      height: height * ratio
    }
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

// Abre o Input de arquivo
const openInput = inputElementId => {
  document.getElementById(inputElementId).click()
}

// Verifica se teve mudança no valor do input de arquivo
const handleInputChange = (inputElement, onImageLoad) => {
  const file = inputElement.files[0]
  const image = new Image()

  image.onload = () => {
    onImageLoad(image)
  }

  image.src = URL.createObjectURL(file)
  return image
}

const applyBrightnessFilter = value => {
  const { canvas, context } = getCanvasContext('canva')
  context.filter = `brightness(${value}%) `
  context.drawImage(canvas, 0, 0)
}

const applySaturationFilter = value => {
  const { canvas, context } = getCanvasContext('canva')
  context.filter = `saturate(${value}%)`
  context.drawImage(canvas, 0, 0)
}

const applyBlurFilter = value => {
  const { canvas, context } = getCanvasContext('canva')
  context.filter = `blur(${value}px)`
  context.drawImage(canvas, 0, 0)
}

const applyContrastFilter = value => {
  const { canvas, context } = getCanvasContext('canva')
  context.filter = `contrast(${value}%)`
  context.drawImage(canvas, 0, 0)
}

const applyGrayscaleFilter = value => {
  const { canvas, context } = getCanvasContext('canva')
  context.filter = `grayscale(${value}%)`
  context.drawImage(canvas, 0, 0)
}

const saveStateOnMouseUp = canvas => {
  const historyLength = imageHistory.addState(canvas).length
  updateUndoButtonState(historyLength) // Atualiza o estado do botão "Undo"
}

const showRange = rangeId => {
  const rangeContainers = [
    'brightnessRangeContainer',
    'saturationRangeContainer',
    'blurRangeContainer',
    'contrastRangeContainer',
    'grayscaleRangeContainer'
  ]

  const name = rangeContainers.filter(containerId => {
    return containerId === rangeId && containerId
  })

  console.log(name)

  const container = document.getElementById(name)
  container.style.display = 'flex'
}

// Função para ativar e desativar o modo caneta
const togglePenMode = () => {
  const canvas = document.getElementById('canva')
  const context = canvas.getContext('2d')
  let drawing = false
  let isCropActive = false // Variável para controlar se o corte está ativo

  const startDrawing = event => {
    drawing = true
    context.lineWidth = 5
    context.lineCap = 'round'
    context.strokeStyle = 'black' // Cor da caneta

    context.beginPath()
    context.moveTo(event.offsetX, event.offsetY)
  }

  const draw = event => {
    if (!drawing) return
    context.lineTo(event.offsetX, event.offsetY)
    context.stroke()
  }

  const stopDrawing = () => {
    drawing = false
    context.closePath()
  }

  const penAction = event => {
    if (drawing) {
      draw(event)
    } else {
      startDrawing(event)
    }
  }

  // Verifica se o modo de corte está ativo antes de ativar o modo caneta
  if (!isCropActive) {
    canvas.addEventListener('mousedown', penAction)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseleave', stopDrawing)
  }

  // Retornar uma função para remover os eventos se necessário
  return () => {
    canvas.removeEventListener('mousedown', penAction)
    canvas.removeEventListener('mousemove', draw)
    canvas.removeEventListener('mouseup', stopDrawing)
    canvas.removeEventListener('mouseleave', stopDrawing)
  }
}

// exporta a imagem
const exportImage = () => {
  const canvas = document.getElementById('canva')
  const dataURL = canvas.toDataURL('image/png')

  // Cria um link temporário para download
  const link = document.createElement('a')
  link.href = dataURL
  link.download = 'imagem_editada.png' // Nome do arquivo que será baixado
  document.body.appendChild(link) // Adiciona o link ao DOM
  link.click() // Clica no link para iniciar o download
  document.body.removeChild(link) // Remove o link do DOM
}

// Função para recortar a imagem
const createCropper = () => {
  const cropImage = (canvasId, startX, startY, cropWidth, cropHeight) => {
    const { canvas, context } = getCanvasContext(canvasId)

    // Obtém a imagem cortada
    const imageData = context.getImageData(
      startX,
      startY,
      cropWidth,
      cropHeight
    )
    context.clearRect(0, 0, canvas.width, canvas.height) // Limpa o canvas
    context.putImageData(imageData, 0, 0) // Adiciona a imagem cortada

    // Adiciona a imagem cortada ao histórico
    const historyLength = imageHistory.addState(canvas).length
    updateUndoButtonState(historyLength) // Atualiza o estado do botão "Undo"
  }

  const recordStartPosition = (event, canvasId, cropWidth, cropHeight) => {
    const { offsetX, offsetY } = event // Posição do clique
    cropImage(canvasId, offsetX, offsetY, cropWidth, cropHeight)
    disableCrop(canvasId) // Desativa a função de corte após o primeiro uso
  }

  const startCrop = (canvasId, cropWidth, cropHeight) => {
    const { canvas } = getCanvasContext(canvasId)
    const handleClick = event =>
      recordStartPosition(event, canvasId, cropWidth, cropHeight)

    // Adiciona o ouvinte de evento ao canvas
    canvas.addEventListener('click', handleClick)

    // Retorna uma função para desabilitar o corte
    return () => {
      canvas.removeEventListener('click', handleClick) // Remove o ouvinte de eventos
    }
  }

  const disableCrop = canvasId => {
    const { canvas } = getCanvasContext(canvasId)
    canvas.removeEventListener('click', recordStartPosition) // Remove o ouvinte de eventos
  }

  return {
    startCrop
  }
}
const cropper = createCropper()

// Função chamada no HTML para iniciar o corte
const initiateCrop = (canvasId, x, y) => {
  cropper.startCrop(canvasId, x, y)
}

//Eventos,

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

document.getElementById('brightnessRange').addEventListener('input', event => {
  const value = event.target.value
  applyBrightnessFilter(value)
})

document.getElementById('brightnessRange').addEventListener('mouseup', () => {
  const canvas = getCanvasContext('canva').canvas
  saveStateOnMouseUp(canvas)
})
document.getElementById('saturationRange').addEventListener('input', event => {
  const value = event.target.value
  applySaturationFilter(value)
})

document.getElementById('saturationRange').addEventListener('mouseup', () => {
  const canvas = getCanvasContext('canva').canvas
  saveStateOnMouseUp(canvas)
})
document.getElementById('blurRange').addEventListener('input', event => {
  const value = event.target.value
  applyBlurFilter(value)
})

document.getElementById('blurRange').addEventListener('mouseup', () => {
  const canvas = getCanvasContext('canva').canvas
  saveStateOnMouseUp(canvas)
})
document.getElementById('contrastRange').addEventListener('input', event => {
  const value = event.target.value
  applyContrastFilter(value)
})

document.getElementById('contrastRange').addEventListener('mouseup', () => {
  const canvas = getCanvasContext('canva').canvas
  saveStateOnMouseUp(canvas)
})
document.getElementById('grayscaleRange').addEventListener('input', event => {
  const value = event.target.value
  applyGrayscaleFilter(value)
})

document.getElementById('grayscaleRange').addEventListener('mouseup', () => {
  const canvas = getCanvasContext('canva').canvas
  saveStateOnMouseUp(canvas)
})

document.getElementById('undoBtn').addEventListener('click', undoLastChange)
