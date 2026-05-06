/**
 * Narvo Analytics — Sprint 1
 *
 * Responsabilidades:
 * - Captura de UTMs e click IDs na entrada (first-touch / last-touch)
 * - Geração e persistência do attribution_id
 * - Helpers de dataLayer para GTM Web
 * - Funções de tracking: page_viewed, view_item, add_to_cart, begin_checkout
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = '_narvo_attribution';
const AID_KEY = '_narvo_aid';
const META_FBP_COOKIE = '_fbp';
const META_FBC_COOKIE = '_fbc';
const COOKIE_DAYS = 730; // ~2 anos — sobrevive entre subdomínios (handoff p/ checkout Shopify)
const SESSION_GAP_MS = 30 * 60 * 1000; // 30 min sem atividade = nova sessão last-touch

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

const CLICK_ID_KEYS = ['gclid', 'fbclid', 'ttclid'] as const;

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────

export interface AttributionTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  touch_at: string;
}

export interface Attribution {
  attribution_id: string;
  ga_client_id?: string;
  meta_fbp?: string;
  meta_fbc?: string;
  first_touch: AttributionTouch;
  last_touch: AttributionTouch;
  last_seen_at?: string;
}

type MetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase';

interface MetaServerEventPayload {
  event_name: MetaEventName;
  event_id: string;
  event_time?: number;
  event_source_url: string;
  custom_data?: Record<string, unknown>;
  user_data?: Record<string, unknown>;
  attribution_data?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────
// Utilitários internos
// ─────────────────────────────────────────────────────────────

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Gera event_id padronizado: "<event_name>_<timestamp>_<random>" */
function makeEventId(eventName: string): string {
  const rand = Math.random().toString(36).slice(2, 6);
  return `${eventName}_${Date.now()}_${rand}`;
}

/** Extrai o ID numérico de um GID do Shopify: gid://shopify/Product/123 → "123" */
export function gidToNumericId(gid: string): string {
  const parts = gid.split('/');
  return parts[parts.length - 1];
}

function parseTouchFromUrl(): Omit<AttributionTouch, 'touch_at'> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const touch: Record<string, string> = {};

  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) touch[key] = v;
  }
  for (const key of CLICK_ID_KEYS) {
    const v = params.get(key);
    if (v) touch[key] = v;
  }

  touch.landing_page = window.location.href;
  if (document.referrer) touch.referrer = document.referrer;

  return touch;
}

function buildMetaFbc(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`;
}

function hasTrafficSource(touch: Omit<AttributionTouch, 'touch_at'>): boolean {
  return !!(
    touch.utm_source ||
    touch.gclid ||
    touch.fbclid ||
    touch.ttclid
  );
}

// Cookies first-party no domínio .narvo.com.br
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const hostname = window.location.hostname;
  const isNarvo =
    hostname === 'narvo.com.br' || hostname.endsWith('.narvo.com.br');
  const domainPart = isNarvo ? '; domain=.narvo.com.br' : '';
  document.cookie =
    `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/` +
    domainPart +
    '; SameSite=Lax';
}

function readMetaCookie(name: string): string | undefined {
  const value = getCookie(name);
  return value || undefined;
}

function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function writeAttribution(attribution: Attribution): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // localStorage blocked (private mode edge case) — silent
  }
}

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage blocked (private mode edge case) — silent
  }
}

function syncMetaIdentifiers(attribution: Attribution, currentTouch?: Omit<AttributionTouch, 'touch_at'>): Attribution {
  const updates: Partial<Attribution> = {};
  const metaFbp = readMetaCookie(META_FBP_COOKIE);
  const existingFbc = readMetaCookie(META_FBC_COOKIE);
  const fbclid = currentTouch?.fbclid || attribution.last_touch.fbclid || attribution.first_touch.fbclid;

  if (metaFbp && attribution.meta_fbp !== metaFbp) {
    updates.meta_fbp = metaFbp;
  }

  if (existingFbc && attribution.meta_fbc !== existingFbc) {
    updates.meta_fbc = existingFbc;
  } else if (!existingFbc && fbclid) {
    const generatedFbc = buildMetaFbc(fbclid);
    setCookie(META_FBC_COOKIE, generatedFbc, COOKIE_DAYS);
    if (attribution.meta_fbc !== generatedFbc) {
      updates.meta_fbc = generatedFbc;
    }
  }

  if (!updates.meta_fbp && !updates.meta_fbc) {
    return attribution;
  }

  const next = { ...attribution, ...updates };
  writeAttribution(next);
  return next;
}

function currentUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : '';
}

function buildMetaUserData(attribution: Attribution | null, extraUserData?: Record<string, unknown>) {
  const payload: Record<string, unknown> = {
    external_id: attribution?.attribution_id,
    fbp: attribution?.meta_fbp,
    fbc: attribution?.meta_fbc,
    client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  return {
    ...payload,
    ...(extraUserData || {}),
  };
}

async function sendMetaServerEvent(payload: MetaServerEventPayload): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.functions.invoke('meta-conversions', {
      body: payload,
    });

    if (error) {
      console.warn('[Meta CAPI] invoke failed:', error.message);
    }
  } catch (error) {
    console.warn('[Meta CAPI] invoke failed:', error);
  }
}

// ─────────────────────────────────────────────────────────────
// API pública: atribuição
// ─────────────────────────────────────────────────────────────

/**
 * Inicializa a atribuição no primeiro carregamento do site.
 * - Cria uma nova session (first-touch) se nenhuma existir
 * - Atualiza last-touch se chegou com UTM/click ID ou após 30min sem atividade
 * Deve ser chamado uma vez, no mount do <App>.
 */
export function initAttribution(): Attribution {
  const existingId =
    getCookie(AID_KEY) || safeGetLocalStorage(AID_KEY);
  const existing = readAttribution();
  const now = new Date().toISOString();
  const currentTouch = parseTouchFromUrl();

  if (existingId && existing) {
    // Atualiza last-touch se nova UTM ou nova sessão (gap de 30min)
    const lastSeen = existing.last_seen_at
      ? new Date(existing.last_seen_at).getTime()
      : 0;
    const isNewSession = Date.now() - lastSeen > SESSION_GAP_MS;

    if (hasTrafficSource(currentTouch) || isNewSession) {
      existing.last_touch = { ...currentTouch, touch_at: now };
    }
    existing.last_seen_at = now;
    writeAttribution(existing);
    return syncMetaIdentifiers(existing, currentTouch);
  }

  // Nova session
  const attribution_id = generateUUID();
  const touch: AttributionTouch = { ...currentTouch, touch_at: now };
  const attribution: Attribution = {
    attribution_id,
    first_touch: touch,
    last_touch: touch,
    last_seen_at: now,
  };

  safeSetLocalStorage(AID_KEY, attribution_id);
  setCookie(AID_KEY, attribution_id, COOKIE_DAYS);
  writeAttribution(attribution);

  return syncMetaIdentifiers(attribution, currentTouch);
}

/** Lê a atribuição atual sem modificá-la. */
export function getAttribution(): Attribution | null {
  return readAttribution();
}

/**
 * Atualiza identificadores cross-platform após o GA4/Meta pixel carregar.
 * Útil para enriquecer os dados antes de enviar ao checkout-bridge.
 */
export function updateAttributionIdentifiers(
  updates: Partial<Pick<Attribution, 'ga_client_id' | 'meta_fbp' | 'meta_fbc'>>
): void {
  const existing = readAttribution();
  if (!existing) return;
  writeAttribution({ ...existing, ...updates });
}

// ─────────────────────────────────────────────────────────────
// dataLayer helpers
// ─────────────────────────────────────────────────────────────

function dlPush(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // Sempre limpa o ecommerce antes de cada evento (padrão GA4 + GTM)
  if (payload.ecommerce) {
    window.dataLayer.push({ ecommerce: null });
  }
  window.dataLayer.push(payload);
}

// ─────────────────────────────────────────────────────────────
// Funções de tracking
// ─────────────────────────────────────────────────────────────

export function trackPageViewed(path: string): string {
  const attribution = getAttribution();
  const eventId = makeEventId('page_view');

  dlPush({
    event: 'page_view',
    event_id: eventId,
    page_path: path,
    page_location: currentUrl(),
    attribution_id: attribution?.attribution_id ?? null,
  });

  void sendMetaServerEvent({
    event_name: 'PageView',
    event_id: eventId,
    event_source_url: currentUrl(),
    user_data: buildMetaUserData(attribution),
  });

  return eventId;
}

export interface TrackViewItemParams {
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  price: number;
}

export function trackViewItem(params: TrackViewItemParams): string {
  const { productId, productTitle, variantId, variantTitle, price } = params;
  const itemId = gidToNumericId(productId);
  const attribution = getAttribution();
  const eventId = makeEventId('view_item');
  const variantNumId = variantId ? gidToNumericId(variantId) : undefined;

  dlPush({
    event: 'view_item',
    event_id: eventId,
    attribution_id: attribution?.attribution_id ?? null,
    ecommerce: {
      currency: 'BRL',
      value: price,
      items: [
        {
          item_id: itemId,
          item_name: productTitle,
          item_variant: variantTitle,
          item_variant_id: variantNumId,
          price,
          quantity: 1,
        },
      ],
    },
  });

  void sendMetaServerEvent({
    event_name: 'ViewContent',
    event_id: eventId,
    event_source_url: currentUrl(),
    user_data: buildMetaUserData(attribution),
    custom_data: {
      currency: 'BRL',
      value: price,
      content_type: 'product',
      content_name: productTitle,
      content_ids: [itemId],
      contents: [
        {
          id: variantNumId || itemId,
          quantity: 1,
          item_price: price,
        },
      ],
    },
  });

  return eventId;
}

export interface TrackAddToCartParams {
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle?: string;
  price: number;
  quantity: number;
}

export function trackAddToCart(params: TrackAddToCartParams): string {
  const { productId, variantId, productTitle, variantTitle, price, quantity } =
    params;
  const itemId = gidToNumericId(productId);
  const variantNumId = gidToNumericId(variantId);
  const attribution = getAttribution();
  const eventId = makeEventId('add_to_cart');

  dlPush({
    event: 'add_to_cart',
    event_id: eventId,
    attribution_id: attribution?.attribution_id ?? null,
    ecommerce: {
      currency: 'BRL',
      value: price * quantity,
      items: [
        {
          item_id: itemId,
          item_name: productTitle,
          item_variant: variantTitle,
          item_variant_id: variantNumId,
          price,
          quantity,
        },
      ],
    },
  });

  void sendMetaServerEvent({
    event_name: 'AddToCart',
    event_id: eventId,
    event_source_url: currentUrl(),
    user_data: buildMetaUserData(attribution),
    custom_data: {
      currency: 'BRL',
      value: price * quantity,
      content_type: 'product',
      content_name: productTitle,
      content_ids: [itemId],
      contents: [
        {
          id: variantNumId,
          quantity,
          item_price: price,
        },
      ],
      num_items: quantity,
    },
  });

  return eventId;
}

export interface BeginCheckoutItem {
  productId: string;
  productTitle: string;
  variantTitle?: string;
  price: number;
  quantity: number;
}

export function trackBeginCheckout(params: {
  cartId?: string | null;
  items: BeginCheckoutItem[];
  value: number;
  coupon?: string | null;
}): string {
  const { cartId, items, value, coupon } = params;
  const attribution = getAttribution();
  const eventId = makeEventId('begin_checkout');
  void cartId; // mantido na assinatura para compat
  const contentIds = items.map((item) => gidToNumericId(item.productId));
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);

  dlPush({
    event: 'begin_checkout',
    event_id: eventId,
    attribution_id: attribution?.attribution_id ?? null,
    ecommerce: {
      currency: 'BRL',
      value,
      coupon: coupon ?? undefined,
      items: items.map((item) => ({
        item_id: gidToNumericId(item.productId),
        item_name: item.productTitle,
        item_variant: item.variantTitle,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });

  void sendMetaServerEvent({
    event_name: 'InitiateCheckout',
    event_id: eventId,
    event_source_url: currentUrl(),
    user_data: buildMetaUserData(attribution),
    custom_data: {
      currency: 'BRL',
      value,
      coupon: coupon ?? undefined,
      content_type: 'product',
      content_ids: contentIds,
      num_items: numItems,
      contents: items.map((item) => ({
        id: gidToNumericId(item.productId),
        quantity: item.quantity,
        item_price: item.price,
      })),
    },
  });

  return eventId;
}

export interface TrackAddPaymentInfoItem extends BeginCheckoutItem {}

export function trackAddPaymentInfo(params: {
  items: TrackAddPaymentInfoItem[];
  value: number;
  coupon?: string | null;
}): string {
  const { items, value, coupon } = params;
  const attribution = getAttribution();
  const eventId = makeEventId('add_payment_info');
  const contentIds = items.map((item) => gidToNumericId(item.productId));
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);

  dlPush({
    event: 'add_payment_info',
    event_id: eventId,
    attribution_id: attribution?.attribution_id ?? null,
    ecommerce: {
      currency: 'BRL',
      value,
      coupon: coupon ?? undefined,
      items: items.map((item) => ({
        item_id: gidToNumericId(item.productId),
        item_name: item.productTitle,
        item_variant: item.variantTitle,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });

  void sendMetaServerEvent({
    event_name: 'AddPaymentInfo',
    event_id: eventId,
    event_source_url: currentUrl(),
    user_data: buildMetaUserData(attribution),
    custom_data: {
      currency: 'BRL',
      value,
      coupon: coupon ?? undefined,
      content_type: 'product',
      content_ids: contentIds,
      num_items: numItems,
      contents: items.map((item) => ({
        id: gidToNumericId(item.productId),
        quantity: item.quantity,
        item_price: item.price,
      })),
    },
  });

  return eventId;
}

export interface TrackPurchaseItem {
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  price: number;
  quantity: number;
}

/**
 * GA4 standard `purchase` event. Disparar na página de confirmação do pedido.
 * `transaction_id` é obrigatório para deduplicação no GA4.
 */
export function trackPurchase(params: {
  transactionId: string;
  items: TrackPurchaseItem[];
  value: number;
  tax?: number;
  shipping?: number;
  coupon?: string | null;
}): string {
  const { transactionId, items, value, tax, shipping, coupon } = params;
  const attribution = getAttribution();
  const eventId = makeEventId('purchase');

  dlPush({
    event: 'purchase',
    event_id: eventId,
    attribution_id: attribution?.attribution_id ?? null,
    ecommerce: {
      transaction_id: transactionId,
      currency: 'BRL',
      value,
      tax: tax ?? undefined,
      shipping: shipping ?? undefined,
      coupon: coupon ?? undefined,
      items: items.map((item) => ({
        item_id: gidToNumericId(item.productId),
        item_name: item.productTitle,
        item_variant: item.variantTitle,
        item_variant_id: item.variantId ? gidToNumericId(item.variantId) : undefined,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });

  void sendMetaServerEvent({
    event_name: 'Purchase',
    event_id: eventId,
    event_source_url: currentUrl(),
    user_data: buildMetaUserData(attribution),
    custom_data: {
      currency: 'BRL',
      value,
      order_id: transactionId,
      content_type: 'product',
      content_ids: items.map((item) => gidToNumericId(item.productId)),
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      contents: items.map((item) => ({
        id: item.variantId ? gidToNumericId(item.variantId) : gidToNumericId(item.productId),
        quantity: item.quantity,
        item_price: item.price,
      })),
      tax: tax ?? undefined,
      shipping: shipping ?? undefined,
      coupon: coupon ?? undefined,
    },
  });

  return eventId;
}
