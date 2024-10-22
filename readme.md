# Projeto de Programação Funcional


## Explicação do Código

O código apresentado é um editor de imagens que implementa várias funcionalidades, como aplicação de filtros (brilho, saturação, blur, contraste e escala de cinza), desfazer ações, desenho no canvas e exportação da imagem editada. A estrutura do código segue o paradigma funcional, que enfatiza o uso de funções puras e a imutabilidade de dados. Aqui estão os principais componentes do código:

## Gerenciador de Histórico (`createHistory`)
Esta função cria um objeto que gerencia o histórico de estados da imagem. O histórico é armazenado em uma lista que é atualizada sempre que uma nova alteração é feita no canvas. As funções `addState` e `undo` são responsáveis por adicionar um estado ao histórico e desfazer a última alteração, respectivamente.

## Funções de Carregamento e Desenho
As funções `loadImage`, `renderImage` e `drawImageOnCanvas` são responsáveis por carregar uma imagem no canvas e garantir que ela seja desenhada nas dimensões apropriadas. A função `loadImage` chama a função `onImageLoad` quando a imagem é carregada.

## Filtros de Imagem
Cada filtro (brilho, saturação, blur, contraste e escala de cinza) é aplicado por funções dedicadas. Essas funções utilizam o contexto do canvas para alterar a aparência da imagem. O valor do filtro é obtido a partir de elementos de entrada (ranges) no HTML.

## Desenho no Canvas
A funcionalidade de desenho é gerida pela função `togglePenMode`, que ativa o modo caneta e permite que o usuário desenhe diretamente sobre a imagem.

## Recorte de Imagem
A função `createCropper` permite que uma área selecionada da imagem seja cortada e colocada de volta no canvas.

## Exportação de Imagem
A função `exportImage` converte o canvas em um Data URL e cria um link para download, permitindo que o usuário salve a imagem editada.

## Eventos e Controle
Os eventos são conectados a elementos HTML para permitir interações, como o ajuste de filtros e desfazer alterações.
