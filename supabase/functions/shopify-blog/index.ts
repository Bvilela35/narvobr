import { corsHeaders } from '@supabase/supabase-js/cors'

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

    let query: string;
    let variables: Record<string, unknown>;

    if (articleHandle) {
      // Fetch single article by handle
      query = `
        query GetBlogArticle($blogHandle: String!, $articleHandle: String!) {
          blogByHandle(handle: $blogHandle) {
            articleByHandle(handle: $articleHandle) {
              id
              title
              handle
              excerpt
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
              seo {
                title
                description
              }
              blog {
                handle
              }
            }
          }
        }
      `;
      variables = { blogHandle, articleHandle };
    } else {
      // Fetch all articles
      query = `
        query GetBlogArticles($blogHandle: String!, $first: Int!) {
          blogByHandle(handle: $blogHandle) {
            title
            articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
              edges {
                node {
                  id
                  title
                  handle
                  excerpt
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
                  seo {
                    title
                    description
                  }
                  blog {
                    handle
                  }
                }
              }
            }
          }
        }
      `;
      variables = { blogHandle, first };
    }

    const response = await fetch(ADMIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
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

    // Normalize response to match frontend ShopifyArticle interface
    if (articleHandle) {
      const article = data?.data?.blogByHandle?.articleByHandle;
      if (!article) {
        return new Response(JSON.stringify({ article: null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({
        article: normalizeArticle(article),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const edges = data?.data?.blogByHandle?.articles?.edges || [];
      const articles = edges.map((e: { node: Record<string, unknown> }) => normalizeArticle(e.node));
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

// Normalize Admin API article shape to match frontend ShopifyArticle interface
function normalizeArticle(article: Record<string, unknown>) {
  return {
    id: article.id,
    title: article.title,
    handle: article.handle,
    excerpt: article.excerpt || null,
    contentHtml: article.body || '',
    publishedAt: article.publishedAt,
    tags: article.tags || [],
    image: article.image || null,
    authorV2: article.author ? { name: (article.author as { name: string }).name } : null,
    seo: article.seo || null,
    blog: article.blog || null,
  };
}
