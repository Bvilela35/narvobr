# Narvo — Tracking Plan Master

**Versão:** 1.0  
**Data:** 2026-04-16  
**Domínios:** narvo.com.br (Lovable/Vite) + efxqrr-1y.myshopify.com (Shopify)

---

## Princípios

1. Source of truth = webhook `orders/paid` do Shopify — nunca o pixel
2. `order_id` é o ID canônico de toda compra (= `transaction_id` no GA4, `event_id` na Meta CAPI)
3. Atribuição capturada na **entrada** (UTMs/click IDs no primeiro acesso), não no checkout
4. First-touch **e** last-touch salvos separadamente
5. Schema canônico interno → tradutores por plataforma (GA4, Meta, Google Ads, TikTok)
6. Deduplicação via `event_id` entre browser e server (evita inflação de 30-40%)

---

## Fontes de eventos

| Fonte | Camada | Consentimento obrigatório? |
|-------|--------|---------------------------|
| narvobr (Lovable/Vite) | client-side via dataLayer → GTM Web | analytics_storage |
| Shopify Custom Pixel | client-side dentro do checkout (sandbox) | ad_storage |
| Shopify Webhooks | server-side (nossa Attribution API) | não (B2B) |

---

## Eventos — Site Lovable (narvobr)

### `page_viewed`

| Campo | Valor | Notas |
|-------|-------|-------|
| **Onde dispara** | Toda mudança de rota (React Router) | hook `useAnalytics` no `<App>` |
| **event_id** | `pv_${uuid()}` | não precisa dedup cross-channel |
| **Consent required** | analytics_storage | |
| **Destinos** | GA4 | não enviar pra Meta/Ads |

**Payload mínimo:**
```json
{
  "event": "page_viewed",
  "event_id": "pv_uuid",
  "page_location": "https://narvo.com.br/produto/mousepad-silicone",
  "page_title": "Mousepad Silicone — Narvo",
  "attribution_id": "uuid"
}
```

---

### `view_item`

| Campo | Valor | Notas |
|-------|-------|-------|
| **Onde dispara** | Página `/produto/:handle` ao montar | `<Produto>` component |
| **event_id** | `vi_${productId}_${sessionId}` | |
| **Consent required** | analytics_storage | |
| **Destinos** | GA4, Meta (ViewContent), TikTok (ViewContent) | |

**Payload:**
```json
{
  "event": "view_item",
  "event_id": "vi_gid://shopify/Product/123_sess456",
  "items": [{
    "item_id": "gid://shopify/Product/123",
    "item_name": "Mousepad Silicone PRO",
    "item_category": "Mousepads",
    "item_variant": "Preto / G",
    "price": 129.90,
    "currency": "BRL",
    "quantity": 1
  }],
  "value": 129.90,
  "currency": "BRL"
}
```

---

### `add_to_cart`

| Campo | Valor | Notas |
|-------|-------|-------|
| **Onde dispara** | Clique em "Adicionar ao Carrinho" (Produto + ProdutoAdicionado) | |
| **event_id** | `atc_${variantId}_${timestamp}` | |
| **Consent required** | ad_storage | |
| **Destinos** | GA4, Meta (AddToCart), Google Ads, TikTok | |

**Payload:**
```json
{
  "event": "add_to_cart",
  "event_id": "atc_gid://shopify/ProductVariant/456_1713200000",
  "items": [{
    "item_id": "gid://shopify/Product/123",
    "item_name": "Mousepad Silicone PRO",
    "item_variant": "Preto / G",
    "price": 129.90,
    "quantity": 1
  }],
  "value": 129.90,
  "currency": "BRL"
}
```

---

### `view_cart`

| Campo | Valor | Notas |
|-------|-------|-------|
| **Onde dispara** | Página `/carrinho` ao montar | |
| **event_id** | `vc_${cartId}_${timestamp}` | |
| **Consent required** | analytics_storage | |
| **Destinos** | GA4 | |

---

### `begin_checkout`

| Campo | Valor | Notas |
|-------|-------|-------|
| **Onde dispara** | Clique em "Finalizar Compra" (Carrinho) — **antes** do redirect para Shopify | CRÍTICO: é aqui que salvamos a atribuição via checkout-bridge |
| **event_id** | `bc_${cartToken}_${timestamp}` | `cartToken` vem da Storefront API |
| **Consent required** | ad_storage | |
| **Destinos** | GA4, Meta (InitiateCheckout), Google Ads, TikTok | |

**Payload:**
```json
{
  "event": "begin_checkout",
  "event_id": "bc_cart123_1713200000",
  "cart_token": "cart123",
  "attribution_id": "uuid",
  "items": [...],
  "value": 259.80,
  "currency": "BRL",
  "coupon": "NARVO10"
}
```

> **Ação paralela:** antes de redirecionar, chamar `POST /checkout-bridge` com attribution_id + cart snapshot + UTMs atuais (last-touch). Isso salva como cart attribute na Shopify Storefront API.

---

## Eventos — Shopify Custom Pixel

Registrado via Admin > Customer Events > Add Custom Pixel. Roda em sandbox isolado.

### `checkout_started` → mapeia para `begin_checkout` (complemento)

| Campo | Valor |
|-------|-------|
| **Subscribe** | `analytics.subscribe('checkout_started', ...)` |
| **event_id** | `bc_${checkout.token}` |
| **Destinos** | GA4, Meta (InitiateCheckout dedup), Google Ads |

> Serve como fallback caso o evento do Lovable não tenha disparado (usuário acessou checkout direto).

---

### `checkout_completed` → mapeia para `purchase` (browser fallback)

| Campo | Valor |
|-------|-------|
| **Subscribe** | `analytics.subscribe('checkout_completed', ...)` |
| **event_id** | `purchase_${checkout.order.id}` |
| **Destinos** | GA4, Meta (Purchase), Google Ads (Conversion) |

> **Atenção:** este evento pode não disparar em fluxos com upsell pós-compra ou se a thank-you page falhar. **O webhook `orders/paid` é a source of truth.** Este evento é apenas para latência baixa.

---

### Outros eventos Shopify Custom Pixel

| Evento Shopify | Evento Canônico | Destinos |
|----------------|-----------------|----------|
| `product_viewed` | `view_item` | GA4 (dedup com Lovable) |
| `product_added_to_cart` | `add_to_cart` | GA4, Meta (dedup) |
| `cart_viewed` | `view_cart` | GA4 |
| `checkout_contact_info_submitted` | (interno) | — |
| `checkout_address_info_submitted` | (interno) | — |
| `checkout_shipping_info_submitted` | (interno) | — |
| `payment_info_submitted` | `add_payment_info` | GA4, Meta |

---

## Eventos — Server-side (Shopify Webhooks)

### `orders/paid` → `purchase` (SOURCE OF TRUTH)

| Campo | Valor |
|-------|-------|
| **Handler** | `POST /webhooks/shopify/orders-paid` |
| **event_id** | `purchase_${order.id}` |
| **Dedup** | `UNIQUE(event_id, platform)` na tabela `event_delivery_log` |
| **Destinos** | GA4 MP, Meta CAPI, Google Ads Conversion, TikTok Events API |
| **Ação** | Grava em `fact_orders`, reconstitui atribuição via `note_attributes`/`cart.attributes` |

---

### `orders/cancelled`

| Campo | Valor |
|-------|-------|
| **Handler** | `POST /webhooks/shopify/orders-cancelled` |
| **event_id** | `refund_${order.id}` |
| **Ação** | Atualiza `fact_orders.financial_status`, dispara evento `refund` no GA4 MP |

---

## Mapa de Atribuição

### Parâmetros capturados na entrada (primeiro acesso ao site)

| Parâmetro | Cookie | Descrição |
|-----------|--------|-----------|
| `utm_source` | `narvo_utm_source` | Canal (google, facebook, instagram...) |
| `utm_medium` | `narvo_utm_medium` | Mídia (cpc, email, social...) |
| `utm_campaign` | `narvo_utm_campaign` | Nome da campanha |
| `utm_content` | `narvo_utm_content` | Variação de criativo |
| `utm_term` | `narvo_utm_term` | Palavra-chave |
| `gclid` | `narvo_gclid` | Google Click ID |
| `fbclid` | `narvo_fbclid` | Facebook Click ID |
| `ttclid` | `narvo_ttclid` | TikTok Click ID |
| `landing_page` | `narvo_landing` | URL da primeira página |
| `referrer` | `narvo_referrer` | document.referrer |

**Cookie config:** domínio `.narvo.com.br`, SameSite=Lax, Secure, 90 dias (first-touch nunca sobrescreve; last-touch atualiza a cada sessão).

### First-touch vs Last-touch

| | First-touch | Last-touch |
|--|-------------|------------|
| **Quando** | Primeiro acesso (cookie não existe) | Cada nova sessão (nova UTM ou > 30min sem atividade) |
| **Uso** | Cálculo de CAC real (Growth OS Financial Agent) | Otimização de mídia (Meta, Google Ads) |
| **Salvo em** | `tracking_sessions.first_*` | `tracking_sessions.last_*` |

---

## Matriz de Deduplicação por Plataforma

| Plataforma | Mecanismo | Campo | Comportamento se duplicado |
|------------|-----------|-------|---------------------------|
| **GA4** | `transaction_id` no evento `purchase` | `= order_id` da Shopify | Ignora segundo evento |
| **Meta CAPI** | `event_id` no payload | `purchase_${order_id}` | Dedup por correspondência de event_id |
| **Google Ads** | `order_id` nas Enhanced Conversions | `= order_id` da Shopify | Conversão única por order_id |
| **TikTok** | `event_id` no payload | `purchase_${order_id}` | Dedup por event_id |

**Regra geral:** `event_id = purchase_${shopify_order_id}` para todos os eventos de compra.

---

## Consent Mode v2

| Consent type | Default (sem resposta) | Quando granted |
|--------------|------------------------|----------------|
| `ad_storage` | `denied` | Usuário aceita cookies de marketing |
| `analytics_storage` | `denied` | Usuário aceita cookies analíticos |
| `ad_user_data` | `denied` | Junto com ad_storage |
| `ad_personalization` | `denied` | Junto com ad_storage |

**Modelagem de conversão** (Google): ativa quando `ad_storage=denied` — Google estima conversões a partir de dados agregados. Importante para não perder volume de conversão nos relatórios mesmo com usuários que negaram.

---

## Checklist de QA (pré-produção)

### Coleta client-side
- [ ] `page_viewed` dispara em toda navegação sem duplicatas
- [ ] `view_item` dispara ao entrar em `/produto/:handle`
- [ ] `add_to_cart` dispara ao clicar no botão (não ao abrir modal)
- [ ] `begin_checkout` dispara antes do redirect (não depois)
- [ ] Cookie first-touch não sobrescreve em segundo acesso
- [ ] Cookie last-touch atualiza com nova UTM

### Cross-domain
- [ ] `_ga` cookie persiste de narvo.com.br → efxqrr-1y.myshopify.com
- [ ] `ga_client_id` igual no GA4 antes e depois do checkout

### Shopify Custom Pixel
- [ ] `checkout_completed` dispara na thank-you page
- [ ] `checkout.token` disponível no payload
- [ ] `cart.attributes` contém `attribution_id` correto

### Attribution API
- [ ] `POST /collect-attribution` retorna 200 e cria registro em `tracking_sessions`
- [ ] `POST /checkout-bridge` cria registro em `checkout_links` e atualiza cart attribute
- [ ] Webhook `orders/paid` lê `note_attributes` corretamente
- [ ] `fact_orders` criado com `attribution_id` preenchido
- [ ] `event_delivery_log` registra envio pra cada plataforma

### Deduplicação
- [ ] Compra testada: GA4 recebe exatamente 1 evento `purchase` por `order_id`
- [ ] Meta recebe exatamente 1 evento `Purchase` (browser + server não duplicam)
- [ ] Google Ads recebe exatamente 1 conversão

### Reconciliação
- [ ] Shopify orders/paid count == GA4 purchase count (tolerância 2%)
- [ ] Revenue Shopify == Revenue GA4 (tolerância 2%)
