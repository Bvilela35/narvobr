

# Página "Quanto Custa Sua Distração?" — Calculadora de Foco

## Resumo

Criar uma página interativa de calculadora de custo de distração em `/calculadora`, seguindo a estética Narvo (minimalista, industrial, Apple-like). A página terá 4 sliders de input, motor de cálculo baseado na pesquisa de Gloria Mark, output visual com breakdown em barras, e 3 CTAs de conversão.

## Estrutura da Página

A página opera em 2 estados: **input** (sliders + cálculo em tempo real) e **resultado** (output completo com CTAs). Transição animada via Framer Motion.

### Camada 1 — Inputs (4 sliders)

| Slider | Range | Default (ICP) | Formato |
|--------|-------|---------------|---------|
| Renda mensal | R$ 3.000–60.000 | R$ 18.000 | R$ X.XXX |
| Horas de trabalho/dia | 4–14h | 9h | Xh |
| % tempo em tarefas de baixo valor | 10–80% | 30% | XX% |
| Interrupções por dia | 0–30 | 8 | X interrupções |

Sliders com estilo Narvo (track escuro, thumb minimalista). Valores pré-preenchidos para gerar impacto imediato.

### Camada 2 — Motor de Cálculo

Fórmula defensável:
```text
custoHora = rendaMensal / (horasDia × 22)
custoDist = interrupções × (23/60) × 5 × 48 × custoHora
custoBaixo = horasDia × (pctBaixoValor/100) × 0.30 × custoHora × 12 × 22
custoAnual = custoDist + custoBaixo
```

Score de foco (0–10) derivado dos inputs com rótulos: Crítico (<4), Regular (4–6), Bom (6–8), Alto Desempenho (>8).

Footnote: "Baseado em pesquisa da UC Irvine (Gloria Mark, 2008)."

### Camada 3 — Output Visual

1. **Número grande** — custo anual formatado em R$, animação countUp
2. **Breakdown em 3 barras** — Vermelho (distrações), Âmbar (overhead/baixo valor), Verde (foco profundo)
3. **Ganho potencial** — "+20% de foco recupera R$ X.XXX/ano"
4. **Score de foco** com rótulo qualitativo

### Camada 4 — CTAs (3 saídas paralelas)

1. **Ver produtos recomendados** — Link para `/colecao` segmentado por score
2. **Recalcular** — Reset dos sliders
3. **Compartilhar resultado** — Gera card visual (fundo escuro, tipografia Narvo, número + score) para download via html2canvas

## Arquivos a Criar/Editar

1. **`src/pages/Calculadora.tsx`** — Página completa com sliders, cálculo, output e CTAs
2. **`src/lib/focusCalculator.ts`** — Lógica de cálculo isolada (fórmula + score)
3. **`src/App.tsx`** — Adicionar rota `/calculadora`

## Detalhes Técnicos

- Sliders usam o componente `@radix-ui/react-slider` existente, estilizado com cores Narvo
- Cálculo reativo via `useMemo` — atualiza em tempo real conforme sliders mudam
- Animação countUp no número grande com Framer Motion
- Barras de breakdown com largura proporcional animada
- Card de compartilhamento gerado client-side com `html2canvas` (instalar dependência)
- Sem dependência de backend — tudo client-side
- Framer Motion para transições entre estados (input → resultado)
- Responsivo: sliders empilhados no mobile, layout lado a lado no desktop

