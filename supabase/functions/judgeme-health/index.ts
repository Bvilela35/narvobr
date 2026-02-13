import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const JUDGEME_API_URL = "https://judge.me/api/v1/reviews";
const SHOP_DOMAIN = "efxqrr-1y.myshopify.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiToken = Deno.env.get("JUDGEME_API_TOKEN");
  if (!apiToken) {
    return new Response(
      JSON.stringify({ ok: false, error: "JUDGEME_API_TOKEN not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const handle = url.searchParams.get("handle") || "cabos-invisiveis";

  const params = new URLSearchParams({
    api_token: apiToken,
    shop_domain: SHOP_DOMAIN,
    handle,
    per_page: "1",
  });

  const start = Date.now();
  let status = 0;
  let rawSize = 0;

  try {
    const res = await fetch(`${JUDGEME_API_URL}?${params.toString()}`);
    status = res.status;
    const text = await res.text();
    rawSize = text.length;
    const elapsed = Date.now() - start;

    console.log(`[judgeme-health] status=${status} time=${elapsed}ms size=${rawSize}`);

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          status,
          error: status === 401 || status === 403
            ? "Invalid or unauthorized API token"
            : status === 404
            ? "Product not found or handle mismatch"
            : status === 429
            ? "Rate limited by Judge.me – try again later"
            : `Judge.me returned ${status}`,
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = JSON.parse(text);
    const reviews = data.reviews || [];
    const firstReview = reviews[0] || null;

    // Build normalized sample
    const sample: Record<string, unknown> = {
      rating: firstReview?.rating ?? null,
      total_reviews: data.total_count ?? reviews.length,
      average_rating: data.average_rating ?? null,
      review_preview: firstReview
        ? {
            id: firstReview.id,
            rating: firstReview.rating,
            title: firstReview.title,
            body: (firstReview.body || "").slice(0, 200),
            reviewer: firstReview.reviewer?.name || "Anonymous",
            created_at: firstReview.created_at,
          }
        : null,
    };

    return new Response(
      JSON.stringify({ ok: true, status, sample, raw_size: rawSize }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[judgeme-health] error time=${elapsed}ms`, err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
