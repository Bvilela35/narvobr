const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
};

const SHOPIFY_API_VERSION = "2025-07";
const SHOP_DOMAIN = "efxqrr-1y.myshopify.com";

interface BannerMedia {
  type: "image" | "video";
  url: string;
  altText: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  posterUrl?: string | null;
}

interface BannerHomeEntry {
  id: string;
  title: string;
  ctaLabel: string;
  link: string;
  media: BannerMedia | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN") || Deno.env.get("SHOPIFY_ADMIN_TOKEN");
  if (!shopifyAccessToken) {
    return jsonResponse({ banners: [], error: "Shopify admin token not configured" });
  }

  try {
    const query = `
      query GetHomeBanners($type: String!) {
        metaobjects(type: $type, first: 20) {
          edges {
            node {
              id
              handle
              fields {
                key
                value
                reference {
                  __typename
                  ... on MediaImage {
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }
                  ... on Video {
                    sources {
                      url
                      mimeType
                      width
                      height
                    }
                    preview {
                      image {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                  ... on GenericFile {
                    url
                    mimeType
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await fetchShopify(query, { type: "banner_home" }, shopifyAccessToken);
    const edges = data?.data?.metaobjects?.edges || [];
    const banners = edges
      .map((edge: any) => normalizeBanner(edge.node))
      .filter((banner: BannerHomeEntry | null): banner is BannerHomeEntry => banner !== null);

    return jsonResponse({ banners });
  } catch (error) {
    console.error("shopify-home-banners error:", error);
    return jsonResponse({ banners: [], error: "Internal server error" });
  }
});

async function fetchShopify(query: string, variables: Record<string, unknown>, token: string) {
  const response = await fetch(`https://${SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Shopify API error [${response.status}]:`, text);
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    console.error("Shopify GraphQL errors:", JSON.stringify(data.errors));
    throw new Error(data.errors[0]?.message || "GraphQL error");
  }

  return data;
}

function normalizeBanner(metaobject: any): BannerHomeEntry | null {
  const fields = Array.isArray(metaobject?.fields) ? metaobject.fields : [];
  const fieldMap = new Map(fields.map((field: any) => [field.key, field]));

  const fileField = fieldMap.get("arquivo") || fieldMap.get("file");
  const titleField = fieldMap.get("titulo") || fieldMap.get("title");
  const ctaField = fieldMap.get("cta_botao") || fieldMap.get("cta") || fieldMap.get("cta_label");
  const linkField = fieldMap.get("link") || fieldMap.get("url");

  const media = normalizeMedia(fileField);
  const title = titleField?.value?.trim() || "";
  const ctaLabel = ctaField?.value?.trim() || "";
  const link = linkField?.value?.trim() || "";

  if (!media || !title || !ctaLabel || !link) {
    return null;
  }

  return {
    id: metaobject.id,
    title,
    ctaLabel,
    link,
    media,
  };
}

function normalizeMedia(field: any): BannerMedia | null {
  const reference = field?.reference;

  if (reference?.__typename === "MediaImage" && reference.image?.url) {
    return {
      type: "image",
      url: reference.image.url,
      altText: reference.image.altText || null,
      width: reference.image.width ?? null,
      height: reference.image.height ?? null,
      mimeType: "image/jpeg",
    };
  }

  if (reference?.__typename === "Video" && Array.isArray(reference.sources) && reference.sources.length > 0) {
    const source = reference.sources.find((item: any) => typeof item?.url === "string") || reference.sources[0];
    return {
      type: "video",
      url: source.url,
      altText: reference.preview?.image?.altText || null,
      width: source.width ?? reference.preview?.image?.width ?? null,
      height: source.height ?? reference.preview?.image?.height ?? null,
      mimeType: source.mimeType || "video/mp4",
      posterUrl: reference.preview?.image?.url || null,
    };
  }

  if (reference?.__typename === "GenericFile" && reference.url) {
    const mimeType = reference.mimeType || inferMimeType(reference.url);
    return {
      type: mimeType.startsWith("video/") ? "video" : "image",
      url: reference.url,
      altText: null,
      mimeType,
    };
  }

  const rawValue = field?.value?.trim();
  if (!rawValue) return null;

  const inferredMimeType = inferMimeType(rawValue);
  const type = inferredMimeType.startsWith("video/") ? "video" : "image";

  return {
    type,
    url: rawValue,
    altText: null,
    mimeType: inferredMimeType,
  };
}

function inferMimeType(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith(".mp4")) return "video/mp4";
  if (lowerUrl.endsWith(".webm")) return "video/webm";
  if (lowerUrl.endsWith(".mov")) return "video/quicktime";
  if (lowerUrl.endsWith(".avif")) return "image/avif";
  if (lowerUrl.endsWith(".webp")) return "image/webp";
  if (lowerUrl.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
