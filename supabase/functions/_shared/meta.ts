export type MetaServerEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";

export interface MetaServerEventInput {
  event_name: MetaServerEventName;
  event_id: string;
  event_time?: number;
  event_source_url: string;
  custom_data?: Record<string, unknown>;
  user_data?: Record<string, unknown>;
  attribution_data?: Record<string, unknown>;
  action_source?: "website";
  test_event_code?: string;
}

const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID") || "1655767658947895";
const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
const META_GRAPH_API_VERSION = Deno.env.get("META_GRAPH_API_VERSION") || "v25.0";
const META_TEST_EVENT_CODE = Deno.env.get("META_TEST_EVENT_CODE");

export function isMetaConfigured() {
  return Boolean(META_ACCESS_TOKEN);
}

export async function sendMetaServerEvent(input: MetaServerEventInput, req?: Request) {
  if (!META_ACCESS_TOKEN) {
    return { skipped: true, reason: "meta_not_configured" };
  }

  const eventTime = normalizeEventTime(input.event_time);
  if (!eventTime) {
    throw new Error("Invalid event_time");
  }

  const payload = {
    data: [
      {
        event_name: input.event_name,
        event_time: eventTime,
        event_id: input.event_id,
        action_source: input.action_source || "website",
        event_source_url: input.event_source_url,
        user_data: await buildUserData(input.user_data || {}, req),
        custom_data: cleanObject(input.custom_data || {}),
        attribution_data: cleanObject(input.attribution_data || {}),
      },
    ],
    ...(input.test_event_code || META_TEST_EVENT_CODE
      ? { test_event_code: input.test_event_code || META_TEST_EVENT_CODE }
      : {}),
  };

  const endpoint =
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_PIXEL_ID}/events` +
    `?access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const parsed = tryParseJson(text);

  if (!response.ok) {
    throw new Error(`Meta API error ${response.status}: ${text}`);
  }

  return parsed || { ok: true, raw: text };
}

export function cleanObject<T extends Record<string, unknown>>(value: T): T | undefined {
  const entries = Object.entries(value).filter(([, item]) => {
    if (item === undefined || item === null || item === "") return false;
    if (Array.isArray(item) && item.length === 0) return false;
    if (typeof item === "object" && !Array.isArray(item) && Object.keys(item).length === 0) return false;
    return true;
  });

  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries) as T;
}

export function normalizeEventTime(eventTime?: number) {
  const now = Math.floor(Date.now() / 1000);
  if (!eventTime) return now;
  if (!Number.isFinite(eventTime)) return null;
  const parsed = Math.floor(eventTime);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60;
  if (parsed < sevenDaysAgo) return null;
  return parsed;
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getFirstForwardedIp(req?: Request): string | undefined {
  const forwarded = req?.headers.get("x-forwarded-for");
  if (!forwarded) return undefined;
  return forwarded.split(",")[0]?.trim() || undefined;
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
}

function normalizePhone(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const digits = value.replace(/\D/g, "");
  return digits || undefined;
}

function normalizeZip(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const digits = value.replace(/\s+/g, "").toLowerCase();
  return digits || undefined;
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashIfPresent(value: string | undefined) {
  if (!value) return undefined;
  return [await sha256(value)];
}

async function buildUserData(userData: Record<string, unknown>, req?: Request) {
  const em = await hashIfPresent(normalizeString(userData.email || userData.em));
  const ph = await hashIfPresent(normalizePhone(userData.phone || userData.ph));
  const fn = await hashIfPresent(normalizeString(userData.first_name || userData.fn));
  const ln = await hashIfPresent(normalizeString(userData.last_name || userData.ln));
  const ct = await hashIfPresent(normalizeString(userData.city || userData.ct));
  const st = await hashIfPresent(normalizeString(userData.state || userData.st));
  const zp = await hashIfPresent(normalizeZip(userData.zip || userData.zp));
  const country = await hashIfPresent(normalizeString(userData.country || userData.country_code));
  const externalId = await hashIfPresent(normalizeString(userData.external_id));

  return cleanObject({
    em,
    ph,
    fn,
    ln,
    ct,
    st,
    zp,
    country,
    external_id: externalId,
    fbp: normalizeString(userData.fbp),
    fbc: normalizeString(userData.fbc),
    client_user_agent: typeof userData.client_user_agent === "string"
      ? userData.client_user_agent
      : req?.headers.get("user-agent") || undefined,
    client_ip_address: getFirstForwardedIp(req),
  });
}
