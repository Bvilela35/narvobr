

## Secao "The System: InSight & OutSight"

Nova secao de categorias posicionada logo abaixo do HeroBanner, antes da secao "Por que Narvo".

### Posicao na Home

```text
HeroBanner
   |
   v
[NOVA SECAO - The System]  <-- aqui
   |
   v
Por que Narvo
   |
   v
Produtos em destaque
...
```

### Estrutura Visual

- **Headline**: "A arquitetura do foco." (font-light, texto grande)
- **Subheadline**: "Dois planos. Um unico objetivo: o silencio visual absoluto." (text-muted-foreground)
- **Grid de 2 cards** lado a lado (`grid md:grid-cols-2 gap-5`), inspirado na referencia com fundo `bg-card-elevated` e `rounded-2xl`

### Conteudo dos Cards

**Card InSight:**
- Label: "InSight(TM)"
- Legenda: "Sobre a mesa."
- Copy tecnica sobre ferramentas de contato, aco, feltro e geometria
- CTA: "Explorar Superficie" com seta (Link para `/colecao?categoria=insight` ou `/colecao`)
- Area de imagem placeholder (icone/ilustracao minimalista representando superficie de mesa)

**Card OutSight:**
- Label: "OutSight(TM)"
- Legenda: "Abaixo do horizonte."
- Copy sobre engenharia invisivel e organizacao de cabos
- CTA: "Explorar Infraestrutura" com seta (Link para `/colecao?categoria=outsight` ou `/colecao`)
- Area de imagem placeholder (icone/ilustracao minimalista representando infraestrutura)

### Detalhes Tecnicos

**Novo arquivo:** `src/components/TheSystemSection.tsx`
- Componente isolado com framer-motion para animacoes de entrada (fade-up)
- Cards com layout vertical: area de imagem placeholder no topo (aspect-ratio 4:3, fundo neutro com icone SVG minimalista), texto e CTA embaixo
- Responsivo: cards empilham verticalmente em mobile

**Arquivo editado:** `src/pages/Index.tsx`
- Importar `TheSystemSection`
- Inserir `<TheSystemSection />` entre `<HeroBanner />` e a secao "Por que Narvo"

### Estilo

- Espacamento: `py-16 md:py-24 px-6 md:px-10`
- Cards: `bg-card-elevated rounded-2xl p-6 md:p-8`
- Tipografia sem serifa, tracking amplo nos labels
- Imagens placeholder com fundo levemente mais claro e icones em stroke fino (Lucide) representando cada categoria ate que imagens reais sejam fornecidas
- Hover sutil nos cards (scale ou shadow transition)

### Mobile

- Cards empilham verticalmente com gap de 4
- Headline e subheadline centralizados ou alinhados a esquerda conforme padrao existente

