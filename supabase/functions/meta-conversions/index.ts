import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";

interface MetaEventRequest {
  event_name: MetaEventName;
  event_id: string;
  event_time?: number;
  event_source_url: string;
  custom_data?: Record<string, unknown>;
  user_data?: Record<string, unknown>;
  attribution_data?: Record<string, unknown>;
  test_event_code?: string;
}

const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID") || "1655767658947895";
const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
const META_GRAPH_API_VERSION = Deno.env.get("META_GRAPH_API_VERSION") || "v25.0";
const META_TEST_EVENT_CODE = Deno.env.get("META_TEST_EVENT_CODE");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let body: MetaEventRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  if (!body?.event_name || !body?.event_id || !body?.event_source_url) {
    return json({ error: "Missing required fields: event_name, event_id, event_source_url" }, 400);
  }

  if (!META_ACCESS_TOKEN) {
    return json({ skipped: true, reason: "meta_not_configured" }, 200);
  }

  const eventTime = normalizeEventTime(body.event_time);
  if (!eventTime) {
    return json({ error: "Invalid event_time" }, 400);
  }

  try {
    const metaPayload = {
      data: [
        {
          event_name: body.event_name,
          event_time: eventTime,
          event_id: body.event_id,
          action_source: "website",
          event_source_url: body.event_source_url,
          user_data: await buildUserData(body.user_data || {}, req),
          custom_data: cleanObject(body.custom_data || {}),
          attribution_data: cleanObject(body.attribution_data || {}),
        },
      ],
      ...(body.test_event_code || META_TEST_EVENT_CODE
        ? { test_event_code: body.test_event_code || META_TEST_EVENT_CODE }
        : {}),
    };

    const endpoint =
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_PIXEL_ID}/events` +
      `?access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaPayload),
    });

    const responseText = await response.text();
    const parsed = tryParseJson(responseText);

    if (!response.ok) {
      console.error("[meta-conversions] Meta API error:", response.status, responseText);
      return json(
        {
          error: `Meta API error: ${response.status}`,
          details: parsed || responseText,
        },
        response.status,
      );
    }

    return json(parsed || { ok: true, raw: responseText }, 200);
  } catch (error) {
    console.error("[meta-conversions] unexpected error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeEventTime(eventTime?: number) {
  const now = Math.floor(Date.now() / 1000);
  if (!eventTime) return now;

  if (!Number.isFinite(eventTime)) return null;
  const parsed = Math.floor(eventTime);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60;
  if (parsed < sevenDaysAgo) return null;
  return parsed;
}

function cleanObject<T extends Record<string, unknown>>(value: T): T | undefined {
  const entries = Object.entries(value).filter(([, item]) => {
    if (item === undefined || item === null || item === "") return false;
    if (Array.isArray(item) && item.length === 0) return false;
    if (typeof item === "object" && !Array.isArray(item) && Object.keys(item).length === 0) return false;
    return true;
  });

  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries) as T;
}

function getFirstForwardedIp(req: Request): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
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

async function buildUserData(userData: Record<string, unknown>, req: Request) {
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
      : req.headers.get("user-agent") || undefined,
    client_ip_address: getFirstForwardedIp(req),
  });
}
