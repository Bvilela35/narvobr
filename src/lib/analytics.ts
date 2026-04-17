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
  }
}

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = '_narvo_attribution';
const AID_KEY = '_narvo_aid';
const COOKIE_DAYS = 90;
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

// ─────────────────────────────────────────────────────────────
// Utilitários internos
// ─────────────────────────────────────────────────────────────

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
    return existing;
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

  return attribution;
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

export function trackPageViewed(path: string): void {
  const attribution = getAttribution();
  dlPush({
    event: 'page_viewed',
    event_id: `pv_${Date.now()}`,
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    attribution_id: attribution?.attribution_id ?? null,
  });
}

export interface TrackViewItemParams {
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  price: number;
}

export function trackViewItem(params: TrackViewItemParams): void {
  const { productId, productTitle, variantId, variantTitle, price } = params;
  const itemId = gidToNumericId(productId);
  const attribution = getAttribution();

  dlPush({
    event: 'view_item',
    event_id: `vi_${itemId}_${Date.now()}`,
    attribution_id: attribution?.attribution_id ?? null,
    ecommerce: {
      currency: 'BRL',
      value: price,
      items: [
        {
          item_id: itemId,
          item_name: productTitle,
          item_variant: variantTitle,
          item_variant_id: variantId ? gidToNumericId(variantId) : undefined,
          price,
          quantity: 1,
        },
      ],
    },
  });
}

export interface TrackAddToCartParams {
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle?: string;
  price: number;
  quantity: number;
}

export function trackAddToCart(params: TrackAddToCartParams): void {
  const { productId, variantId, productTitle, variantTitle, price, quantity } =
    params;
  const itemId = gidToNumericId(productId);
  const variantNumId = gidToNumericId(variantId);
  const attribution = getAttribution();

  dlPush({
    event: 'add_to_cart',
    event_id: `atc_${variantNumId}_${Date.now()}`,
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
}): void {
  const { cartId, items, value, coupon } = params;
  const attribution = getAttribution();
  const cartShortId = cartId ? gidToNumericId(cartId) : String(Date.now());

  dlPush({
    event: 'begin_checkout',
    event_id: `bc_${cartShortId}`,
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
}
