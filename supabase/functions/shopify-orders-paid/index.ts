import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendMetaServerEvent } from "../_shared/meta.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain",
};

interface ShopifyNoteAttribute {
  name?: string;
  key?: string;
  value?: string;
}

interface ShopifyLineItem {
  product_id?: number | null;
  variant_id?: number | null;
  title?: string;
  quantity?: number;
  price?: string;
  sku?: string | null;
}

interface ShopifyCustomer {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  default_address?: {
    city?: string | null;
    province_code?: string | null;
    zip?: string | null;
    country_code?: string | null;
  } | null;
}

interface ShopifyOrderPayload {
  id: number | string;
  order_number?: number | string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  checkout_token?: string | null;
  financial_status?: string;
  total_price?: string;
  subtotal_price?: string;
  total_tax?: string;
  total_discounts?: string;
  total_shipping_price_set?: {
    shop_money?: { amount?: string };
  } | null;
  currency?: string;
  note_attributes?: ShopifyNoteAttribute[];
  line_items?: ShopifyLineItem[];
  customer?: ShopifyCustomer | null;
  shipping_address?: {
    city?: string | null;
    province_code?: string | null;
    zip?: string | null;
    country_code?: string | null;
  } | null;
  created_at?: string;
  processed_at?: string | null;
  cancelled_at?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const webhookSecret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return json({ error: "SHOPIFY_WEBHOOK_SECRET not configured" }, 500);
  }

  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const shopDomain = req.headers.get("x-shopify-shop-domain");
  const topic = req.headers.get("x-shopify-topic");

  if (shopDomain !== "efxqrr-1y.myshopify.com" || topic !== "orders/paid") {
    return json({ error: "Unexpected webhook origin" }, 401);
  }

  const rawBody = await req.text();
  const valid = await verifyShopifyWebhook(rawBody, webhookSecret, hmac);
  if (!valid) {
    return json({ error: "Invalid webhook signature" }, 401);
  }

  let order: ShopifyOrderPayload;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Supabase environment not configured" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const orderId = String(order.id);
  const eventId = `purchase_${orderId}`;

  const existingDelivery = await supabase
    .from("event_delivery_log")
    .select("id")
    .eq("event_id", eventId)
    .eq("platform", "meta")
    .limit(1)
    .maybeSingle();

  if (existingDelivery.data?.id) {
    return json({ order_id: orderId, deduped: true, platforms_fired: ["meta"] }, 200);
  }

  const noteMap = normalizeNoteAttributes(order.note_attributes || []);
  const attributionId = noteMap["_narvo_attribution_id"] || noteMap["narvo_sid"] || null;
  const email = order.email || order.customer?.email || null;
  const phone = order.phone || order.customer?.phone || null;
  const address = order.shipping_address || order.customer?.default_address || null;
  const currency = order.currency || "BRL";
  const totalPrice = parseAmount(order.total_price);
  const shippingPrice = parseAmount(order.total_shipping_price_set?.shop_money?.amount);
  const totalTax = parseAmount(order.total_tax);
  const totalDiscounts = parseAmount(order.total_discounts);
  const subtotalPrice = parseAmount(order.subtotal_price);
  const lineItems = Array.isArray(order.line_items) ? order.line_items : [];

  try {
    await supabase
      .from("fact_orders")
      .upsert({
        order_id: orderId,
        order_number: order.name || String(order.order_number || ""),
        checkout_token: order.checkout_token || null,
        attribution_id: attributionId,
        email_hash: email ? await sha256(email.trim().toLowerCase()) : null,
        phone_hash: phone ? await sha256(phone.replace(/\D/g, "")) : null,
        total_price: totalPrice,
        subtotal_price: subtotalPrice,
        shipping_price: shippingPrice,
        total_tax: totalTax,
        total_discounts: totalDiscounts,
        currency,
        financial_status: order.financial_status || "paid",
        line_items: lineItems,
        shopify_created_at: order.created_at || null,
        shopify_paid_at: order.processed_at || order.created_at || null,
        shopify_cancelled_at: order.cancelled_at || null,
        attribution_recovered: Boolean(attributionId),
        raw_webhook: order,
      }, { onConflict: "order_id" });

    const metaResponse = await sendMetaServerEvent({
      event_name: "Purchase",
      event_id: eventId,
      event_time: Math.floor(new Date(order.processed_at || order.created_at || Date.now()).getTime() / 1000),
      event_source_url: `https://narvo.com.br/checkout/success?order_id=${encodeURIComponent(orderId)}`,
      user_data: {
        external_id: attributionId || undefined,
        fbp: noteMap["_narvo_meta_fbp"] || undefined,
        fbc: noteMap["_narvo_meta_fbc"] || undefined,
        email: email || undefined,
        phone: phone || undefined,
        first_name: order.customer?.first_name || undefined,
        last_name: order.customer?.last_name || undefined,
        city: address?.city || undefined,
        state: address?.province_code || undefined,
        zip: address?.zip || undefined,
        country: address?.country_code || "BR",
      },
      custom_data: {
        currency,
        value: totalPrice,
        order_id: orderId,
        content_type: "product",
        content_ids: lineItems.map((item) => String(item.product_id || item.variant_id || "")).filter(Boolean),
        num_items: lineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        contents: lineItems.map((item) => ({
          id: String(item.variant_id || item.product_id || ""),
          quantity: Number(item.quantity || 0),
          item_price: parseAmount(item.price),
        })).filter((item) => item.id),
      },
    }, req);

    await supabase.from("event_delivery_log").upsert({
      event_id: eventId,
      event_name: "purchase",
      order_id: orderId,
      platform: "meta",
      status: "sent",
      http_status_code: 200,
      response: metaResponse,
    }, { onConflict: "event_id,platform" });

    return json({
      order_id: orderId,
      attribution_id: attributionId,
      platforms_fired: ["meta"],
    });
  } catch (error) {
    console.error("[shopify-orders-paid] unexpected error:", error);

    await supabase.from("event_delivery_log").upsert({
      event_id: eventId,
      event_name: "purchase",
      order_id: orderId,
      platform: "meta",
      status: "failed",
      error_message: error instanceof Error ? error.message : String(error),
    }, { onConflict: "event_id,platform" });

    return json({ error: "Internal server error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeNoteAttributes(attributes: ShopifyNoteAttribute[]) {
  return attributes.reduce<Record<string, string>>((acc, attribute) => {
    const key = attribute.name || attribute.key;
    const value = attribute.value;
    if (key && typeof value === "string") {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function parseAmount(value: string | number | undefined | null) {
  const amount = typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

async function verifyShopifyWebhook(body: string, secret: string, providedHmac: string | null) {
  if (!providedHmac) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const digest = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return timingSafeEqual(digest, providedHmac);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
