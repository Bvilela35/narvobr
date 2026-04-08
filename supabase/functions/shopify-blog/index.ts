const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_API_VERSION = '2025-07';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
  if (!SHOPIFY_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'SHOPIFY_ACCESS_TOKEN not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const SHOP_DOMAIN = 'efxqrr-1y.myshopify.com';
  const ADMIN_URL = `https://${SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const url = new URL(req.url);
    const blogHandle = url.searchParams.get('blog') || 'blog';
    const articleHandle = url.searchParams.get('article');
    const first = Math.min(parseInt(url.searchParams.get('first') || '20', 10), 50);

    const query = `
      query GetBlogArticles($first: Int!) {
        blogs(first: 10) {
          edges {
            node {
              handle
              title
              articles(first: $first, reverse: true) {
                edges {
                  node {
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
            }
          }
        }
      }
    `;

    const response = await fetchShopify(ADMIN_URL, SHOPIFY_ACCESS_TOKEN, query, { first: articleHandle ? 50 : first });
    if (response instanceof Response) return response;

    const blogs = response?.data?.blogs?.edges || [];
    const targetBlog = blogs.find((b: any) => b.node.handle === blogHandle);

    if (articleHandle) {
      const articles = targetBlog?.node?.articles?.edges || [];
      const article = articles.find((a: any) => a.node.handle === articleHandle);

      return new Response(JSON.stringify({
        article: article ? normalizeArticle(article.node) : null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const edges = targetBlog?.node?.articles?.edges || [];
      const articles = edges.map((e: any) => normalizeArticle(e.node));

      return new Response(JSON.stringify({ articles }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchShopify(url: string, token: string, query: string, variables: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Shopify Admin API error [${response.status}]:`, text);
    return new Response(JSON.stringify({ error: `Shopify API error: ${response.status}` }), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const data = await response.json();

  if (data.errors) {
    console.error('Shopify GraphQL errors:', JSON.stringify(data.errors));
    return new Response(JSON.stringify({ error: data.errors[0]?.message || 'GraphQL error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return data;
}

function normalizeArticle(article: Record<string, unknown>) {
  const author = article.author as { name?: string } | null;
  const authorName = author?.name || null;
  return {
    id: article.id,
    title: article.title,
    handle: article.handle,
    excerpt: (article.summary as string) || null,
    contentHtml: article.body || '',
    publishedAt: article.publishedAt,
    tags: article.tags || [],
    image: article.image || null,
    authorV2: authorName ? { name: authorName } : null,
    seo: null,
    blog: article.blog || null,
  };
}
