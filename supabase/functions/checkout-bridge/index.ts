import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendMetaServerEvent } from "../_shared/meta.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "efxqrr-1y.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "9645130db6cf2b0f59c6feeb3f76f3b9";

interface CheckoutBridgeItem {
  product_id: string;
  product_title: string;
  variant_id?: string | null;
  variant_title?: string | null;
  price: number;
  quantity: number;
}

interface CheckoutBridgePayload {
  attribution_id: string;
  cart_id: string;
  cart_token?: string | null;
  value: number;
  currency?: string;
  coupon?: string | null;
  event_id?: string | null;
  items: CheckoutBridgeItem[];
  ga_client_id?: string | null;
  meta_fbp?: string | null;
  meta_fbc?: string | null;
  last_utm_source?: string | null;
  last_utm_medium?: string | null;
  last_utm_campaign?: string | null;
  last_utm_content?: string | null;
  last_utm_term?: string | null;
  last_gclid?: string | null;
  last_fbclid?: string | null;
  last_ttclid?: string | null;
}

const CART_ATTRIBUTES_UPDATE_MUTATION = `
  mutation cartAttributesUpdate($attributes: [AttributeInput!]!, $cartId: ID!) {
    cartAttributesUpdate(attributes: $attributes, cartId: $cartId) {
      cart {
        id
        checkoutUrl
      }
      userErrors { field message }
      warnings { code message }
    }
  }
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let payload: CheckoutBridgePayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  if (!payload?.attribution_id || !payload?.cart_id || !Array.isArray(payload.items) || payload.items.length === 0) {
    return json({ error: "Missing required fields: attribution_id, cart_id, items" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Supabase environment not configured" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const cartToken = payload.cart_token || payload.cart_id;
  const checkoutAttributes = buildCheckoutAttributes(payload);
  const eventId = payload.event_id || `bc_${cartToken}_${Date.now()}`;

  let attributeWriteSucceeded = false;

  try {
    await ensureTrackingSession(supabase, payload);

    const { error: checkoutLinkError } = await supabase
      .from("checkout_links")
      .upsert({
        cart_token: cartToken,
        attribution_id: payload.attribution_id,
        cart_snapshot: {
          items: payload.items,
          value: payload.value,
          currency: payload.currency || "BRL",
          coupon: payload.coupon || null,
        },
        shopify_attribute_written: false,
      }, { onConflict: "cart_token" });

    if (checkoutLinkError) {
      console.warn("[checkout-bridge] checkout_links upsert failed:", checkoutLinkError.message);
    }

    const storefrontResult = await storefrontApiRequest(CART_ATTRIBUTES_UPDATE_MUTATION, {
      cartId: payload.cart_id,
      attributes: checkoutAttributes,
    });

    const userErrors = storefrontResult?.data?.cartAttributesUpdate?.userErrors || [];
    if (userErrors.length > 0) {
      console.error("[checkout-bridge] cartAttributesUpdate errors:", JSON.stringify(userErrors));
    } else {
      attributeWriteSucceeded = true;
      await supabase
        .from("checkout_links")
        .update({ shopify_attribute_written: true })
        .eq("cart_token", cartToken);
    }

    await sendMetaServerEvent({
      event_name: "InitiateCheckout",
      event_id: eventId,
      event_source_url: buildEventSourceUrl(req, "/carrinho"),
      user_data: {
        external_id: payload.attribution_id,
        fbp: payload.meta_fbp || undefined,
        fbc: payload.meta_fbc || undefined,
      },
      custom_data: {
        currency: payload.currency || "BRL",
        value: payload.value,
        coupon: payload.coupon || undefined,
        content_type: "product",
        content_ids: payload.items.map((item) => numericId(item.product_id)),
        num_items: payload.items.reduce((sum, item) => sum + item.quantity, 0),
        contents: payload.items.map((item) => ({
          id: item.variant_id ? numericId(item.variant_id) : numericId(item.product_id),
          quantity: item.quantity,
          item_price: item.price,
        })),
      },
    }, req);

    return json({
      checkout_token: cartToken,
      attribution_id: payload.attribution_id,
      shopify_attribute_written: attributeWriteSucceeded,
      event_id: eventId,
    });
  } catch (error) {
    console.error("[checkout-bridge] unexpected error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function numericId(gid: string) {
  return gid.split("/").pop() || gid;
}

function buildEventSourceUrl(req: Request, fallbackPath: string) {
  try {
    const origin = new URL(req.url).origin.replace("uttnlfgoxwgzogtsskbk.supabase.co", "narvo.com.br");
    return `${origin}${fallbackPath}`;
  } catch {
    return `https://narvo.com.br${fallbackPath}`;
  }
}

function buildCheckoutAttributes(payload: CheckoutBridgePayload) {
  const attributes = [
    ["narvo_sid", payload.attribution_id],
    ["_narvo_attribution_id", payload.attribution_id],
    ["_narvo_value", String(payload.value)],
    ["_narvo_currency", payload.currency || "BRL"],
    ["_narvo_event_id", payload.event_id || ""],
    ["_narvo_cart_id", payload.cart_id],
    ["_narvo_cart_token", payload.cart_token || payload.cart_id],
    ["_narvo_ga_client_id", payload.ga_client_id || ""],
    ["_narvo_meta_fbp", payload.meta_fbp || ""],
    ["_narvo_meta_fbc", payload.meta_fbc || ""],
    ["_narvo_utm_source", payload.last_utm_source || ""],
    ["_narvo_utm_medium", payload.last_utm_medium || ""],
    ["_narvo_utm_campaign", payload.last_utm_campaign || ""],
    ["_narvo_utm_content", payload.last_utm_content || ""],
    ["_narvo_utm_term", payload.last_utm_term || ""],
    ["_narvo_gclid", payload.last_gclid || ""],
    ["_narvo_fbclid", payload.last_fbclid || ""],
    ["_narvo_ttclid", payload.last_ttclid || ""],
    ["_narvo_coupon", payload.coupon || ""],
  ] as const;

  return attributes
    .filter(([, value]) => value !== "")
    .map(([key, value]) => ({ key, value }));
}

async function ensureTrackingSession(supabase: ReturnType<typeof createClient>, payload: CheckoutBridgePayload) {
  const { error } = await supabase
    .from("tracking_sessions")
    .upsert({
      attribution_id: payload.attribution_id,
      ga_client_id: payload.ga_client_id || null,
      meta_fbp: payload.meta_fbp || null,
      meta_fbc: payload.meta_fbc || null,
      last_utm_source: payload.last_utm_source || null,
      last_utm_medium: payload.last_utm_medium || null,
      last_utm_campaign: payload.last_utm_campaign || null,
      last_utm_content: payload.last_utm_content || null,
      last_utm_term: payload.last_utm_term || null,
      last_gclid: payload.last_gclid || null,
      last_fbclid: payload.last_fbclid || null,
      last_ttclid: payload.last_ttclid || null,
      last_touch_at: new Date().toISOString(),
    }, { onConflict: "attribution_id" });

  if (error) {
    console.warn("[checkout-bridge] tracking_sessions upsert failed:", error.message);
  }
}

async function storefrontApiRequest(query: string, variables: Record<string, unknown>) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify Storefront API error ${response.status}: ${text}`);
  }

  return await response.json();
}
