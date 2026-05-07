/*
  Narvo — Shopify Custom Pixel (checkout)

  Instalação:
  1. Shopify Admin > Settings > Customer events
  2. Add custom pixel
  3. Cole este script

  Objetivo:
  - Fallback browser-side para Purchase
  - Server event para AddPaymentInfo via Supabase Edge Function
  - Dedup consistente com event_id = purchase_<order.id>
*/

const META_PIXEL_ID = "1655767658947895";
const META_SECONDARY_PIXEL_ID = "2494555084309837";
const META_CONVERSIONS_URL = "https://uttnlfgoxwgzogtsskbk.supabase.co/functions/v1/meta-conversions";

function loadMetaPixel() {
  if (window.fbq) return;

  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', META_PIXEL_ID);
  fbq('init', META_SECONDARY_PIXEL_ID);
}

function normalizeAmount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function toMetaContents(lineItems) {
  return (lineItems || []).map((item) => ({
    id: String(item.variant?.id || item.product?.id || item.id || ""),
    quantity: Number(item.quantity || 0),
    item_price: normalizeAmount(item.finalLinePrice?.amount || item.cost?.totalAmount?.amount || item.variant?.price?.amount),
  })).filter((item) => item.id);
}

function toContentIds(lineItems) {
  return toMetaContents(lineItems).map((item) => item.id);
}

function postMetaServerEvent(payload) {
  return fetch(META_CONVERSIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch((error) => {
    console.warn("[Narvo custom pixel] meta-conversions failed:", error);
  });
}

loadMetaPixel();

analytics.subscribe("payment_info_submitted", async (event) => {
  const checkout = event?.data?.checkout;
  if (!checkout) return;

  const eventId = `api_${checkout.token || Date.now()}`;
  const lineItems = checkout.lineItems || [];
  const value = normalizeAmount(checkout.totalPrice?.amount);
  const currency = checkout.currencyCode || "BRL";

  await postMetaServerEvent({
    event_name: "AddPaymentInfo",
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: checkout.orderStatusUrl || checkout.checkoutUrl || "https://narvo.com.br/carrinho",
    custom_data: {
      currency,
      value,
      content_type: "product",
      content_ids: toContentIds(lineItems),
      num_items: lineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      contents: toMetaContents(lineItems),
    },
    user_data: {
      email: checkout.email || undefined,
      phone: checkout.phone || undefined,
      first_name: checkout.billingAddress?.firstName || undefined,
      last_name: checkout.billingAddress?.lastName || undefined,
      city: checkout.billingAddress?.city || undefined,
      state: checkout.billingAddress?.provinceCode || undefined,
      zip: checkout.billingAddress?.zip || undefined,
      country: checkout.billingAddress?.countryCode || "BR",
    },
  });
});

analytics.subscribe("checkout_completed", (event) => {
  const checkout = event?.data?.checkout;
  const order = event?.data?.order;
  if (!checkout || !order?.id) return;

  const eventId = `purchase_${order.id}`;
  const lineItems = checkout.lineItems || [];
  const value = normalizeAmount(checkout.totalPrice?.amount);
  const currency = checkout.currencyCode || "BRL";

  if (window.fbq) {
    window.fbq("track", "Purchase", {
      currency,
      value,
      content_type: "product",
      content_ids: toContentIds(lineItems),
      num_items: lineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      contents: toMetaContents(lineItems),
      order_id: String(order.id),
    }, { eventID: eventId });
  }
});
