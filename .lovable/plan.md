

## Banner Hero - Substituir "Engenharia do Silencio"

Substituir a secao hero atual por um banner no estilo da referencia: layout dividido em dois blocos (texto a esquerda, imagem grande a direita).

### Estrutura do Layout

- **Esquerda**: Titulo principal da Narvo, descricao curta e botao CTA ("Ver colecao")
- **Direita**: Card com cantos arredondados exibindo a imagem que voce enviar, com um badge ou label sobreposto (ex: "DESCUBRA" com seta)

### Estilo Visual

- Layout `flex` com `md:flex-row`, ocupando altura generosa (`min-h-[85vh]`)
- Card da imagem com `rounded-2xl` e `overflow-hidden`, cobrindo todo o espaco
- Animacoes de entrada com Framer Motion (fade-up no texto, scale-in no card)
- Manter a paleta Narvo: fundo off-white, texto escuro, espacamento amplo

### Detalhes Tecnicos

**Arquivo editado:** `src/pages/Index.tsx`
- Substituir a secao `{/* Hero */}` atual pelo novo banner
- O bloco esquerdo mantem titulo, subtitulo e CTA
- O bloco direito recebe a imagem via import de `src/assets/`

**Arquivo de imagem:** `src/assets/hero-banner.jpg` (ou formato que voce enviar)
- Sera copiada do upload para `src/assets/`
- Importada como modulo ES6 no componente

### Copywriting (tom Narvo)

- Titulo: "Engenharia do Silencio." (mantido, e a alma da marca)
- Subtitulo: "Acessorios premium para seu setup. Projetados para quem exige silencio visual e maxima performance."
- CTA: "Ver colecao"
- Badge no card: "DESCUBRA" com seta

### Mobile

- Em telas pequenas, o layout empilha verticalmente (imagem abaixo do texto)
- Card da imagem com altura fixa para manter proporcao

### Proximo passo

Apos aprovar o plano, envie a imagem que deseja usar no banner para que eu possa implementar.

