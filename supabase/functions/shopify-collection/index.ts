const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
};

const SHOPIFY_API_VERSION = "2025-07";
const SHOP_DOMAIN = "efxqrr-1y.myshopify.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN") || Deno.env.get("SHOPIFY_ADMIN_TOKEN");
  if (!shopifyAccessToken) {
    return jsonResponse({ error: "Shopify admin token not configured" }, 500);
  }

  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get("handle");
    const first = Math.min(parseInt(url.searchParams.get("first") || "20", 10), 50);

    if (!handle) {
      return jsonResponse({ error: "Missing collection handle" }, 400);
    }

    const query = `
      query GetCollectionByHandle($query: String!, $first: Int!) {
        collections(first: 1, query: $query) {
          edges {
            node {
          id
          title
          description
          image {
            url
            altText
          }
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                handle
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 6) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
                      availableForSale
                      selectedOptions {
                        name
                        value
                      }
                    }
                  }
                }
                options {
                  name
                  values
                }
              }
            }
          }
        }
            }
          }
        }
      }
    `;

    const data = await fetchShopify(query, { query: `handle:${handle}`, first }, shopifyAccessToken);
    return jsonResponse(normalizeCollectionResponse(data));
  } catch (error) {
    console.error("shopify-collection error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeCollectionResponse(data: any) {
  const collection = data?.data?.collections?.edges?.[0]?.node || null;
  data.data.collection = collection;
  delete data.data.collections;
  const edges = collection?.products?.edges || [];
  for (const edge of edges) {
    const product = edge?.node;
    const currencyCode = product?.priceRange?.minVariantPrice?.currencyCode || "BRL";
    for (const variantEdge of product?.variants?.edges || []) {
      const variant = variantEdge?.node;
      if (variant && typeof variant.price === "string") {
        variant.price = {
          amount: variant.price,
          currencyCode,
        };
      }
    }
  }
  return data;
}
