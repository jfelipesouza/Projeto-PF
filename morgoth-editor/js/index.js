// Função pura que renderiza uma imagem no canvas
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

// Função pura que retorna o contexto do canvas
const getCanvasContext = canvasId => {
  const canvas = document.getElementById(canvasId)
  return {
    canvas,
    context: canvas.getContext('2d')
  }
}

// Função pura que desenha uma imagem no canvas
const drawImageOnCanvas = (image, canvasContext, dimensions) => {
  const { canvas, context } = canvasContext
  canvas.width = dimensions.width
  canvas.height = dimensions.height
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height)
  return canvas.toDataURL() // Retorna o estado atual da imagem como string (ou outra representação)
}

// Função pura para abrir o input de imagem
const openInput = inputElementId => {
  document.getElementById(inputElementId).click()
}

// Função pura que lida com o evento de mudança do input
const handleInputChange = (inputElement, onImageLoad) => {
  const file = inputElement.files[0]
  const image = new Image()

  image.onload = () => {
    onImageLoad(image)
  }

  image.src = URL.createObjectURL(file)
  return image
}

// Função pura que reseta a imagem no canvas
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
  })
})

document.getElementById('resetBtn').addEventListener('click', () => {
  // Aqui, você deve ter acesso à imagem original, que seria fornecida pelo fluxo de dados
  // e passada como argumento, sem alterar estado global.
  const canvasContext = getCanvasContext('canva')
  const previewContent = document.querySelector('.previewContent')
  const canvasDimensions = {
    maxWidth: previewContent.clientWidth,
    maxHeight: previewContent.clientHeight
  }

  // Exemplo de como resetar a imagem (necessário que você guarde a original em algum lugar)
  resetCanvas(originalImage, canvasContext, canvasDimensions)
})
