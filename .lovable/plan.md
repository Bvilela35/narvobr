
# Landing de alta conversão — `/setup-organizar`

Página independente, fora do menu, otimizada para tráfego pago. Foco único: vender o combo **N-Field + N-Spine** como uma única estação de trabalho silenciosa.

## Objetivo
Converter visitantes pagos em compradores do combo, com 1 ação principal: **adicionar os dois SKUs ao carrinho e abrir o checkout Shopify**.

## Rota e SEO
- Rota nova em `App.tsx`: `/setup-organizar` → `pages/SetupOrganizar.tsx` (lazy)
- Página renderiza **fora** do `Layout` padrão (sem header/menu/cart drawer/footer pesado), para reduzir vazamento de cliques. Usa um header minimal próprio (apenas logo) e um footer reduzido.
- `<Helmet>`: title focado em conversão, meta description curta, canonical, OG image, `noindex` opcional (pode ficar indexável).
- Track `view_item` + `view_item_list` no mount; `add_to_cart` no clique do CTA; `begin_checkout` no redirect.

## Estrutura visual (de cima para baixo)

```text
┌───────────────────────────────────────────────────┐
│ 1. HERO IMERSIVO                                  │
│    fullscreen · imagem do setup montado           │
│    H1 + subcopy curta + CTA primário + preço      │
├───────────────────────────────────────────────────┤
│ 2. ANTES vs DEPOIS (mesa caos → mesa silêncio)    │
│    reusa BeforeAfter.tsx                          │
├───────────────────────────────────────────────────┤
│ 3. O COMBO (2 cards lado a lado)                  │
│    N-Field · N-Spine · "juntos viram um sistema"  │
├───────────────────────────────────────────────────┤
│ 4. ENGENHARIA DO MATERIAL                         │
│    aço eletrostático · 2 cores · macro + texto    │
├───────────────────────────────────────────────────┤
│ 5. SELETOR DE COR + STICKY BUY-BOX                │
│    cor N-Field · cor N-Spine · preço · CTA        │
├───────────────────────────────────────────────────┤
│ 6. PROVA SOCIAL                                   │
│    régua Netflix/Amazon/LinkedIn + reviews real   │
├───────────────────────────────────────────────────┤
│ 7. FAQ + GARANTIA + FRETE                         │
│    accordion mínimo, 5–6 perguntas                │
├───────────────────────────────────────────────────┤
│ 8. CTA FINAL                                      │
│    full-bleed verde-escuro · botão lime           │
└───────────────────────────────────────────────────┘
+ Sticky CTA mobile no rodapé (sempre visível)
```

### 1. Hero
- Foto fullscreen do setup organizado (gerada via `imagegen` se não houver). Overlay leve.
- H1: **"Sua mesa, em silêncio."** Sub: "O combo N-Field + N-Spine organiza o físico para você dominar o digital."
- CTA primário: `Montar meu setup — R$ X` (preço dinâmico, soma das 2 variantes).
- Tag de confiança abaixo: "Aço eletrostático · 2 cores · Frete para todo Brasil".

### 2. Before/After
- Reusa `<BeforeAfter />` com as imagens já existentes (`before-desk-1280.jpg` / `after-desk-1280.jpg`).
- Headline curta: "O caos visual rouba seu foco. A engenharia devolve."

### 3. Combo (anatomia)
- Grid 2 colunas (mobile: stack). Cada card mostra produto, função e por que precisa do outro.
- N-Field: organiza superfície / N-Spine: esconde os cabos do monitor.
- Linha de conexão visual entre os dois (SVG ou Framer Motion) reforçando "sistema".

### 4. Material
- Seção dark (verde-escuro `#0f3d2e`). Macro de textura fosca do aço.
- 3 selos curtos: Aço carbono · Pintura eletrostática · Atemporal.
- Swatches das 2 cores (chips redondos clicáveis que sincronizam com o buy-box).

### 5. Buy-box sticky
- Card grande centralizado + sticky no scroll (desktop direito, mobile fundo).
- Seleção de cor para N-Field e para N-Spine (fallback: primeira variante disponível).
- Mostra: preço total, parcelamento (`calcInstallments`), frete grátis se aplicável.
- CTA: **"Comprar combo"** → executa `addItem` para os 2 variantId em sequência → abre `checkoutUrl` em nova aba (`window.open(url, '_blank')`).
- Estado de loading + tratamento de erro com toast.

### 6. Prova social
- Reaproveita régua de logos (sem texto, com imagens reais de `/optimized/home/`).
- Reviews: monta `ReviewsSection` com handle agregado dos dois produtos (ou só N-Field como base) — **sem fabricar reviews**.

### 7. FAQ
- 5–6 perguntas: prazo de entrega, garantia, instalação, compatibilidade com monitores, devolução, tamanho da mesa mínimo.
- JSON-LD `FAQPage` para SEO.

### 8. CTA final
- Bloco full-bleed verde-escuro + botão lime grande. Headline: "Pronto para silenciar a sua estação de trabalho?".

### Sticky mobile bar
- Barra fixa no rodapé mobile com preço + botão "Comprar combo". Aparece após scroll do hero (IntersectionObserver).

## Fluxo técnico de compra
1. Página carrega `useProductByHandle('n-field')` e `useProductByHandle('n-spine')` em paralelo.
2. Estado local: `{ colorNField, colorNSpine }`. Inicializa com primeira variante disponível.
3. CTA chama:
   ```ts
   await addItem(nFieldVariantPayload);
   await addItem(nSpineVariantPayload);
   const url = useCartStore.getState().getCheckoutUrl();
   trackBeginCheckout(...);
   window.open(url, '_blank');
   ```
4. Sem cupom/SKU de bundle nesta fase (combo soma os dois preços).

## Arquivos a criar / editar
- **Criar** `src/pages/SetupOrganizar.tsx` (página completa, sem `Layout` global)
- **Criar** `src/components/setup/HeroSetup.tsx`
- **Criar** `src/components/setup/ComboAnatomy.tsx`
- **Criar** `src/components/setup/MaterialSection.tsx`
- **Criar** `src/components/setup/SetupBuyBox.tsx` (sticky + seletor de cor + ação combo)
- **Criar** `src/components/setup/SetupClientsRow.tsx` (logos com imagens locais)
- **Criar** `src/components/setup/SetupFaq.tsx`
- **Criar** `src/components/setup/StickyMobileBar.tsx`
- **Editar** `src/App.tsx`: adicionar `Route` `/setup-organizar` **fora** do `<Layout>` (renderiza com header/footer próprios), lazy.
- **Gerar** 1–2 imagens (hero do setup montado, macro do aço) via `imagegen` em `src/assets/setup/`.

## Riscos / decisões já tomadas
- N-Spine handle confirmado: `n-spine`. Se a query falhar em runtime, mostro skeleton e desabilito o CTA (sem mock).
- Sem cupom — pricing é a soma direta dos dois variants.
- Sem `LeadCapturePopup`, `WhatsAppBanner` ou `TrustPillars` globais (essa página é fechada, focada em 1 ação).
- Sem reviews fabricadas — uso apenas `ReviewsSection` real do Judge.me.

## Próximo passo após aprovação
Implemento a rota, os componentes e gero as imagens necessárias. Você poderá testar em `/setup-organizar` antes de subir os anúncios.
