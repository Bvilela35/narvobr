

## Product Highlights inside "Detalhes" Section

### Overview
Replace the placeholder "Detalhes" section on the PDP with the dynamic highlights component that consumes `custom.highlight_de_produto` metafield (list of metaobject references) from Shopify. Renders up to 5 entries with Z-pattern alternating layout on desktop and stacked centered layout on mobile.

### Files to modify/create

**1. `src/lib/shopify.ts`** — Add metafield to GraphQL query + parse highlights

- Add to `ShopifyProduct` interface: `highlights?: Array<{ titulo: string; descricao: string; midiaUrl: string; tipoMidia: 'image' | 'video'; videoSources?: ShopifyVideoSource[] }>`
- Add to `PRODUCT_BY_HANDLE_QUERY`:
  ```graphql
  highlightsMeta: metafield(namespace: "custom", key: "highlight_de_produto") {
    references(first: 5) {
      edges {
        node {
          ... on Metaobject {
            fields { key value reference { ... on MediaImage { image { url altText } } ... on Video { sources { url mimeType } previewImage { url } } } }
          }
        }
      }
    }
  }
  ```
- Parse metaobject fields in `fetchProductByHandle` — extract `titulo`, `descricao`, and media from each entry's `fields` array. Clean up `highlightsMeta` from raw object.

**2. `src/components/ProductHighlights.tsx`** — New component

- Props: `highlights` array
- Returns `null` if empty
- Desktop (md+): Two-column grid per entry. Index 0, 2, 4 → media left, text right. Index 1, 3 → text left, media right.
- Mobile: Stacked — title → description → media, all centered
- Media: `rounded-2xl`, supports image and auto-play muted video
- Typography: Title ~28-36px bold, description ~16px muted, generous spacing between entries

**3. `src/pages/Produto.tsx`** — Replace "Detalhes" placeholder (lines 1032-1038)

- Extract `highlights` from `product.node`
- Import `ProductHighlights`
- Inside `secao-detalhes`, render `<ProductHighlights highlights={highlights} />` instead of the placeholder text. If no highlights, keep the existing placeholder.

