-- ============================================================
-- Narvo Attribution Schema
-- Sprint 2 — Attribution API foundation
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- tracking_sessions
-- Granularidade: uma linha por visita identificada
-- Salva first-touch E last-touch separadamente
-- ============================================================
CREATE TABLE IF NOT EXISTS tracking_sessions (
  attribution_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificadores cross-platform
  ga_client_id            TEXT,
  meta_fbp                TEXT,
  meta_fbc                TEXT,

  -- First-touch (imutável após criação)
  first_utm_source        TEXT,
  first_utm_medium        TEXT,
  first_utm_campaign      TEXT,
  first_utm_content       TEXT,
  first_utm_term          TEXT,
  first_landing_page      TEXT,
  first_referrer          TEXT,
  first_gclid             TEXT,
  first_fbclid            TEXT,
  first_ttclid            TEXT,
  first_touch_at          TIMESTAMPTZ,

  -- Last-touch (atualiza a cada nova sessão com UTM ou após 30min)
  last_utm_source         TEXT,
  last_utm_medium         TEXT,
  last_utm_campaign       TEXT,
  last_utm_content        TEXT,
  last_utm_term           TEXT,
  last_landing_page       TEXT,
  last_referrer           TEXT,
  last_gclid              TEXT,
  last_fbclid             TEXT,
  last_ttclid             TEXT,
  last_touch_at           TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para lookup por ga_client_id (reconciliação com GA4)
CREATE INDEX idx_tracking_sessions_ga_client_id ON tracking_sessions(ga_client_id)
  WHERE ga_client_id IS NOT NULL;

-- Índice para lookup por fbp (reconciliação com Meta)
CREATE INDEX idx_tracking_sessions_meta_fbp ON tracking_sessions(meta_fbp)
  WHERE meta_fbp IS NOT NULL;

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tracking_sessions_updated_at
  BEFORE UPDATE ON tracking_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- checkout_links
-- Ponte entre carrinho do Lovable e checkout da Shopify
-- Criado no /checkout-bridge antes do redirect
-- ============================================================
CREATE TABLE IF NOT EXISTS checkout_links (
  -- cart_token vem da Shopify Storefront API (parte do URL do checkout)
  cart_token              TEXT PRIMARY KEY,

  attribution_id          UUID NOT NULL REFERENCES tracking_sessions(attribution_id),

  -- Snapshot do carrinho no momento do bridge (para auditoria)
  cart_snapshot           JSONB NOT NULL DEFAULT '{}',

  -- Confirmação de que o cart attribute foi escrito na Shopify
  shopify_attribute_written BOOLEAN NOT NULL DEFAULT FALSE,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkout_links_attribution_id ON checkout_links(attribution_id);

-- ============================================================
-- fact_orders
-- Source of truth de pedidos reais — populado pelo webhook orders/paid
-- ============================================================
CREATE TABLE IF NOT EXISTS fact_orders (
  -- IDs
  order_id                TEXT PRIMARY KEY,   -- Shopify order ID (numérico como string)
  order_number            TEXT,               -- "#1001"
  checkout_token          TEXT REFERENCES checkout_links(cart_token),

  -- Atribuição recuperada via note_attributes/cart.attributes
  attribution_id          UUID REFERENCES tracking_sessions(attribution_id),

  -- Customer (hashed por privacidade)
  email_hash              TEXT,               -- SHA256(email.toLowerCase())
  phone_hash              TEXT,               -- SHA256(phone normalizado)

  -- Financeiro (valores em BRL, decimal preciso)
  total_price             NUMERIC(10, 2) NOT NULL,
  subtotal_price          NUMERIC(10, 2),
  shipping_price          NUMERIC(10, 2),
  total_tax               NUMERIC(10, 2),
  total_discounts         NUMERIC(10, 2),
  currency                TEXT NOT NULL DEFAULT 'BRL',

  -- Status do pedido
  financial_status        TEXT NOT NULL,      -- paid, pending, refunded, cancelled...

  -- Produtos (JSONB para evitar tabela extra no MVP)
  line_items              JSONB NOT NULL DEFAULT '[]',

  -- Timestamps da Shopify (não do nosso sistema)
  shopify_created_at      TIMESTAMPTZ,
  shopify_paid_at         TIMESTAMPTZ,
  shopify_cancelled_at    TIMESTAMPTZ,

  -- Controle interno
  webhook_received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attribution_recovered   BOOLEAN NOT NULL DEFAULT FALSE,  -- true se attribution_id foi recuperado com sucesso
  raw_webhook             JSONB                            -- payload bruto (para reprocessamento)
);

CREATE INDEX idx_fact_orders_attribution_id ON fact_orders(attribution_id)
  WHERE attribution_id IS NOT NULL;

CREATE INDEX idx_fact_orders_financial_status ON fact_orders(financial_status);

CREATE INDEX idx_fact_orders_shopify_paid_at ON fact_orders(shopify_paid_at)
  WHERE shopify_paid_at IS NOT NULL;

-- ============================================================
-- event_delivery_log
-- Log de disparo por plataforma — garante idempotência e auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS event_delivery_log (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificadores do evento
  event_id                TEXT NOT NULL,      -- ex: "purchase_12345"
  event_name              TEXT NOT NULL,      -- ex: "purchase", "refund"
  order_id                TEXT,               -- referência opcional

  -- Destino
  platform                TEXT NOT NULL,      -- ga4, meta, google_ads, tiktok

  -- Resultado
  status                  TEXT NOT NULL,      -- sent, failed, deduped, skipped
  http_status_code        INTEGER,
  response                JSONB,
  error_message           TEXT,

  -- Timestamp
  sent_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Idempotência: um evento por plataforma
  CONSTRAINT uq_event_platform UNIQUE (event_id, platform)
);

CREATE INDEX idx_event_delivery_log_order_id ON event_delivery_log(order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX idx_event_delivery_log_platform_status ON event_delivery_log(platform, status);

CREATE INDEX idx_event_delivery_log_sent_at ON event_delivery_log(sent_at);

-- ============================================================
-- Comentários de uso para o Growth OS
-- ============================================================

COMMENT ON TABLE tracking_sessions IS
  'Session de atribuição por visitante. Fonte de first-touch e last-touch para o Financial Intelligence Agent calcular CAC real por canal.';

COMMENT ON TABLE checkout_links IS
  'Ponte Lovable→Shopify: persiste attribution_id antes do redirect para que o webhook orders/paid possa recuperar a atribuição.';

COMMENT ON TABLE fact_orders IS
  'Source of truth de pedidos pagos. Populado exclusivamente via webhook orders/paid da Shopify. Alimenta o Financial Intelligence Agent do Growth OS.';

COMMENT ON TABLE event_delivery_log IS
  'Audit log de todos os disparos server-side. UNIQUE(event_id, platform) garante que cada compra gera exatamente 1 evento por plataforma (deduplicação entre browser e server).';
