## Objetivo

Aprofundar a LP `/setup-organizar` com 3 novas seções que respeitam o tom "Engenharia do Silêncio": educar sobre o custo da distração antes da decisão de compra, e sustentar a decisão com prova de design + especificações depois.

## Nova ordem da página

```
1.  Hero
2.  Stories Bar
3.  Before/After
4.  Combo Anatomy (N-Field + N-Spine)
5.  ▸ Custo da Distração          ← NOVO (stats grandes)
6.  Material (verde escuro — já existe)
7.  Buy-Box
─── tudo abaixo é "quem rolou, aprofunda" ───
8.  ▸ Design                        ← NOVO
9.  ▸ Especificações & Uso          ← NOVO (dimensões + como usar)
10. Logos
11. Reviews
12. FAQ
13. Final CTA
```

## Seção 5 — Custo da Distração

**Tom:** editorial, fundo off-white, números colossais em peso `font-semibold`, lime green (#b6e36d) como acento sutil em uma palavra-chave por stat.

**Layout (desktop):** 4 stats em grid 2×2; cada stat ocupa muito espaço vertical, com número de ~7rem-9rem e legenda curta de 2 linhas embaixo, separador fino `border-foreground/10` entre eles.

**Layout (mobile, 390px):** stack vertical, 1 por viewport, snap-y opcional — sensação cinematográfica.

**Conteúdo proposto (ajustável):**
- **23min** — Tempo médio para recuperar o foco após uma interrupção (fonte: UC Irvine).
- **47%** — Queda de produtividade em ambientes visualmente poluídos (fonte: Princeton Neuroscience Inst.).
- **2.1h** — Horas perdidas por dia procurando coisas na mesa (Harvard Business Review).
- **R$ 0** — O que sua atenção custa quando o ambiente está em ordem.

**Header da seção:**
- Eyebrow: `O custo invisível`
- H2: `A distração tem preço.` + linha leve "Mas é fácil de eliminar."

**Animação:** count-up suave (framer-motion `useInView` + `animate`) ao entrar no viewport, uma vez. Sem loop.

## Seção 8 — Design

**Tom:** Apple-product-page. Fotos grandes, microcopy mínima, foco em forma e ângulos.

**Estrutura:**
- **Bloco A — Linhas que somem:** imagem full-bleed do N-Field em ângulo cerrado mostrando a dobra do aço. Texto sobreposto curto à esquerda: "Linhas retas. Zero parafusos à vista."
- **Bloco B — Cores em contexto:** grid de 2 fotos lado a lado mostrando os 2 produtos nas 2 cores disponíveis (preto + verde). Swatches abaixo de cada imagem com nome da cor.
- **Bloco C — Detalhe que não aparece:** macro do encaixe do N-Spine ou do pé do N-Field. Texto: "Os detalhes que ninguém vê são os que mais importam."

Tudo em background `#f8f8f8`, cards `rounded-3xl`, gaps generosos, sem ícones — só imagem e texto.

## Seção 9 — Especificações & Uso

**Header:** Eyebrow `Engenharia` · H2 `Feito para durar uma carreira.`

**Estrutura em 2 colunas (md+):**

**Coluna esquerda — Especificações (estilo PDP Apple):**
Lista de pares chave/valor, divididos por linha sutil:
- Material: Aço carbono 1,5mm
- Acabamento: Pintura eletrostática fosca
- Dimensões N-Field: 60 × 22 × 11 cm
- Dimensões N-Spine: 45 × 6 × 4 cm
- Peso combo: ~3,8 kg
- Capacidade N-Field: até 25 kg / monitor 32"
- Garantia: 12 meses
- Origem: Brasil

**Coluna direita — Como usar (3 passos):**
Cards numerados 01 / 02 / 03, cada um com 1 linha de instrução:
- 01 — Apoie o N-Field sobre a mesa. Sem furos.
- 02 — Prenda o N-Spine atrás do monitor com as presilhas inclusas.
- 03 — Recolha os cabos pela coluna. Pronto.

Imagem ilustrativa pequena (1:1) por passo, opcional — IA gerada se necessário.

## Implementação técnica

**Arquivos a criar:**
- `src/components/setup/CostOfDistraction.tsx` — stats com count-up animado
- `src/components/setup/DesignSection.tsx` — 3 blocos visuais
- `src/components/setup/SpecsSection.tsx` — specs + how-to-use

**Arquivo a editar:**
- `src/pages/SetupOrganizar.tsx` — importar e inserir as 3 seções nas posições corretas

**Assets:**
- Reutilizar `nField.images` e `nSpine.images` do Shopify quando possível.
- Gerar 2 imagens via `imagegen` se faltar material:
  - `src/assets/setup/design-detail.jpg` — macro do encaixe
  - `src/assets/setup/design-context.jpg` — combo nas duas cores em contexto de escritório

**Padrões já existentes a respeitar:**
- Cores: `#0f3d2e` (primário), `#b6e36d` (acento), `#f8f8f8` (BG card)
- Spacing: `py-20 md:py-28 px-6 md:px-10`, container `max-w-[1400px] mx-auto`
- Tipografia: H2 `text-3xl md:text-5xl font-semibold leading-tight`, eyebrow `text-xs uppercase tracking-[0.25em] text-muted-foreground`
- Animação: framer-motion `whileInView` com `viewport={{ once: true, margin: "-80px" }}`
- Cards: `rounded-3xl`, sem sombras pesadas

**Performance:** todas as imagens com `loading="lazy"`, exceto se houver alguma acima do fold (não é o caso). Count-up usa `requestAnimationFrame`, executa só uma vez.

**SEO:** sem novos JSON-LD necessários — FAQ já cobre. Apenas semântica HTML correta (`<section>`, `<h2>`, `<dl>` para specs).

## Fora do escopo

- Não tocar no Hero, Stories Bar, Before/After, Buy-Box, Material, Reviews, FAQ ou CTA final.
- Não criar variantes interativas (tabs/accordion) — todas as seções são scroll-revealed.
- Não adicionar reviews ou números fabricados — stats têm fonte real citada em texto pequeno.
