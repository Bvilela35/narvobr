import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const JUDGEME_API_URL = "https://judge.me/api/v1/reviews";
const SHOP_DOMAIN = "efxqrr-1y.myshopify.com";

interface JudgeMeReview {
  id: number;
  rating: number;
  title: string;
  body: string;
  reviewer: { name: string; email?: string };
  created_at: string;
  pictures?: Array<{ urls: { original: string; compact: string; small: string } }>;
  product_handle?: string;
}

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
  const handle = url.searchParams.get("handle");
  const page = url.searchParams.get("page") || "1";
  const perPage = url.searchParams.get("per_page") || "20";

  const params = new URLSearchParams({
    api_token: apiToken,
    shop_domain: SHOP_DOMAIN,
    per_page: perPage,
    page,
  });

  if (handle) {
    params.set("handle", handle);
  }

  try {
    const res = await fetch(`${JUDGEME_API_URL}?${params.toString()}`);

    if (!res.ok) {
      const text = await res.text();
      console.error(`[judgeme-reviews] status=${res.status} body=${text}`);
      return new Response(
        JSON.stringify({ ok: false, error: `Judge.me returned ${res.status}` }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const reviews: JudgeMeReview[] = data.reviews || [];

    // Normalize reviews for frontend consumption
    const normalized = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title || "",
      body: r.body || "",
      reviewer: r.reviewer?.name || "Anônimo",
      created_at: r.created_at,
      product_handle: r.product_handle || "",
      pictures: (r.pictures || []).map((p) => ({
        original: p.urls?.original || "",
        compact: p.urls?.compact || "",
        small: p.urls?.small || "",
      })),
    }));

    // Filter by handle server-side if provided (Judge.me may not filter correctly)
    const filtered = handle
      ? normalized.filter((r) => r.product_handle === handle)
      : normalized;

    // Calculate average from filtered reviews
    const avg = filtered.length > 0
      ? filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length
      : null;

    return new Response(
      JSON.stringify({
        ok: true,
        reviews: filtered,
        current_page: data.current_page || parseInt(page),
        per_page: parseInt(perPage),
        total_count: filtered.length,
        average_rating: avg,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(`[judgeme-reviews] error`, err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
