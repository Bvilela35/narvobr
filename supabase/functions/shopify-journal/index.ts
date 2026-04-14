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
    const blogHandle = url.searchParams.get("blog") || "blog";
    const articleHandle = url.searchParams.get("article");
    const first = Math.min(parseInt(url.searchParams.get("first") || "20", 10), 50);

    const listQuery = `
      query GetBlogArticles {
        blogs(first: 20) {
          edges {
            node {
              handle
              title
              articles(first: 50, reverse: true) {
                edges {
                  node {
                    id
                    title
                    handle
                    summary
                    publishedAt
                    tags
                    image {
                      url
                      altText
                    }
                    author {
                      name
                    }
                    blog {
                      handle
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const listResponse = await fetchShopify(listQuery, {}, shopifyAccessToken);
    const blogs = listResponse?.data?.blogs?.edges || [];
    const targetBlog = blogs.find((b: any) => b?.node?.handle === blogHandle);

    if (!targetBlog) {
      return jsonResponse({ articles: [], article: null, blog: { handle: blogHandle, title: null } });
    }

    const normalizedArticles = (targetBlog.node.articles?.edges || []).map((edge: any) =>
      normalizeArticle(edge.node)
    );

    if (articleHandle) {
      const articleQuery = `
        query GetArticle($blogHandle: String!, $articleHandle: String!) {
          blog(handle: $blogHandle) {
            handle
            title
            articleByHandle(handle: $articleHandle) {
              id
              title
              handle
              summary
              body
              publishedAt
              tags
              image {
                url
                altText
              }
              author {
                name
              }
              blog {
                handle
              }
            }
          }
        }
      `;

      const articleResponse = await fetchShopify(
        articleQuery,
        { blogHandle, articleHandle },
        shopifyAccessToken,
      );
      const fullArticle = articleResponse?.data?.blog?.articleByHandle
        ? normalizeArticle(articleResponse.data.blog.articleByHandle)
        : null;

      const article = fullArticle || normalizedArticles.find((item: any) => item.handle === articleHandle) || null;
      return jsonResponse({ article, articles: normalizedArticles, blog: { handle: targetBlog.node.handle, title: targetBlog.node.title } });
    }

    return jsonResponse({
      articles: normalizedArticles.slice(0, first),
      blog: { handle: targetBlog.node.handle, title: targetBlog.node.title },
    });
  } catch (error) {
    console.error("shopify-journal error:", error);
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

function normalizeArticle(article: Record<string, any>) {
  return {
    id: article.id,
    title: article.title,
    handle: article.handle,
    excerpt: article.summary || null,
    contentHtml: article.body || "",
    publishedAt: article.publishedAt,
    tags: article.tags || [],
    image: article.image || null,
    authorV2: article.author?.name ? { name: article.author.name } : null,
    seo: null,
    blog: article.blog || null,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
