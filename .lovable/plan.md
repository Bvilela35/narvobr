
# Plan: Consistent Price Formatting — Strip ".00" Decimals

## Problem
`src/pages/Produto.tsx` uses `toFixed(2)` which always shows decimals (e.g., "R$ 49,00"). The `ProductCard` and `Carrinho` already strip decimals for round numbers. Need to align `Produto.tsx`.

## Changes

### `src/pages/Produto.tsx`
- Update `formatPrice()` (line 16-18): use `% 1 === 0` check — if round, show no decimals; otherwise show 2 decimals.
- Update `installmentValue` (line 526): same logic for the "10x de R$..." text.

### No changes needed
- `ProductCard.tsx` — already correct
- `Carrinho.tsx` — already correct  
- `CartDrawer.tsx` — already correct
