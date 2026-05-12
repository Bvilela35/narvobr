## O que vou construir

Uma seção editorial no estilo Sonos (referência enviada) com blocos alternados de imagem grande + título + parágrafo curto, posicionada **logo acima do menu sticky** (Descrição/Especificações/FAQ/Avaliações), renderizada **apenas na página do N-Field** (`handle === "n-field"`).

## Conteúdo dos blocos (5 blocos, alinhados ao manifesto Narvo)

1. **Aço que silencia o ambiente** — Material  
   Estrutura em aço carbono com pintura eletrostática fosca. Densidade industrial, toque tátil, sem brilho. Projetado para durar décadas, não temporadas.

2. **A altura correta do olhar** — Ergonomia  
   O monitor à altura dos olhos elimina a tensão cervical e mantém a coluna neutra. Postura corrigida sem esforço — o corpo deixa de competir pela atenção.

3. **A mesa volta a ser mesa** — Organização  
   O espaço sob o monitor retorna como área útil. Teclado, caderno, cabos: tudo encontra seu lugar. A superfície deixa de ser depósito e volta a ser estação de trabalho.

4. **Menos ruído visual, mais foco** — Ambiente  
   Linhas retas, acabamento fosco, presença discreta. O setup deixa de gritar e o trabalho ganha o primeiro plano. Engenharia do silêncio em forma física.

5. **23 minutos por interrupção** — Tempo recuperado  
   Cada distração custa 23 minutos para o foco voltar. Um ambiente em ordem reduz interrupções visuais em até 47%. O tempo recuperado é o verdadeiro retorno.  
   *Fonte · University of California, Irvine · Princeton Neuroscience Institute*

## Imagens

Vou usar imagens reais do produto N-Field puxadas do Shopify (já disponíveis em `product.media`/`images`). Layout alternado: ímpares com imagem à esquerda, pares com imagem à direita (igual ao Sonos). No mobile, empilha (imagem em cima, texto embaixo).

Caso o produto tenha menos de 5 imagens, faço cycle reaproveitando as disponíveis. Aspect ratio das imagens: ~4:3, `object-cover`, `rounded-2xl`, fundo `#f8f8f8`.

## Estética

- Tipografia: título `text-[28px] md:text-[40px] font-semibold leading-tight`, corpo `text-base text-muted-foreground leading-relaxed`.
- Espaçamento generoso entre blocos (`py-16 md:py-24`).
- Fade/slide-up sutil ao entrar na viewport (Framer Motion, `whileInView`, once).
- Sem CTAs, sem badges, sem ícones — apenas imagem + headline + parágrafo. Editorial puro.
- Container `max-w-[1240px]`, grid `md:grid-cols-2 gap-12 md:gap-20`, alinhamento vertical centralizado.

## Detalhes técnicos

- **Arquivos:**
  - Novo componente: `src/components/produto/NFieldStory.tsx` (envolto em `DeferredSection` para não pesar no LCP).
  - Edição em `src/pages/Produto.tsx` por volta da linha 1126 — renderiza `{handle === "n-field" && <NFieldStory images={...} />}` antes do `<nav>` sticky.
- **Props:** recebe array de URLs de imagem do produto (extraídas de `product.images` ou `product.media`).
- **Sem alterações em backend, schema, ou business logic.** Frontend/apresentação apenas.
- **Responsivo:** mobile single-column (imagem topo, texto baixo, sem alternância); desktop alterna lados.

## Fora de escopo

- Não altero outras páginas de produto.
- Não mexo no menu sticky, na buybox, nas seções existentes (Descrição/Specs/FAQ/Reviews).
- Não crio reviews falsas.
