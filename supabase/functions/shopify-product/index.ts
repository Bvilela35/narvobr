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

  const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  if (!shopifyAccessToken) {
    return jsonResponse({ error: "SHOPIFY_ACCESS_TOKEN not configured" }, 500);
  }

  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get("handle");

    if (!handle) {
      return jsonResponse({ error: "Missing product handle" }, 400);
    }

    const query = `
      query GetProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          description
          handle
          seo {
            title
            description
          }
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
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                  altText
                }
              }
            }
          }
          options {
            name
            values
          }
          videoStoriesMeta: metafield(namespace: "custom", key: "video_stories") {
            references(first: 10) {
              edges {
                node {
                  ... on Video {
                    mediaContentType
                    alt
                    sources {
                      url
                      mimeType
                    }
                    previewImage {
                      url
                    }
                  }
                }
              }
            }
          }
          bulletPointsMeta: metafield(namespace: "custom", key: "bullet_points") {
            value
          }
          tituloDescricaoMeta: metafield(namespace: "custom", key: "titulo_descricao") {
            value
          }
          descricaoCompletaMeta: metafield(namespace: "custom", key: "descricao_completa") {
            value
          }
          fotoDescricaoMeta: metafield(namespace: "custom", key: "foto_descricao") {
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
              ... on Video {
                sources {
                  url
                  mimeType
                }
                previewImage {
                  url
                }
              }
            }
          }
          specMateriaisMeta: metafield(namespace: "custom", key: "materiais") {
            value
          }
          specTamanhoMeta: metafield(namespace: "custom", key: "tamanho") {
            value
          }
          specOQueAcompanhaMeta: metafield(namespace: "custom", key: "o_que_acompanha") {
            value
          }
          specDetalhesMeta: metafield(namespace: "custom", key: "detalhes") {
            value
          }
          specFotoMeta: metafield(namespace: "custom", key: "foto_ficha_tecnica") {
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
            }
          }
          faqMeta: metafield(namespace: "custom", key: "faq") {
            value
          }
          highlightsMeta: metafield(namespace: "custom", key: "highlight_de_produto") {
            references(first: 10) {
              edges {
                node {
                  ... on Metaobject {
                    handle
                    titulo: field(key: "titulo") {
                      value
                    }
                    descricao: field(key: "descricao") {
                      value
                    }
                    foto_video: field(key: "foto_video") {
                      reference {
                        ... on MediaImage {
                          image {
                            url
                            altText
                          }
                        }
                        ... on Video {
                          sources {
                            url
                            mimeType
                          }
                          previewImage {
                            url
                          }
                        }
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

    const data = await fetchShopify(query, { handle }, shopifyAccessToken);
    return jsonResponse(data);
  } catch (error) {
    console.error("shopify-product error:", error);
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
