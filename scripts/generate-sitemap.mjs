import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://narvo.com.br";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "efxqrr-1y.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "9645130db6cf2b0f59c6feeb3f76f3b9";

const ROOT = "/Users/bernardosanches/narvobr";
const PUBLIC_DIR = path.join(ROOT, "public");
const JOURNAL_PATH = path.join(PUBLIC_DIR, "journal.json");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");

async function storefrontRequest(query, variables = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  return payload.data;
}

function toAbsolute(urlPath) {
  return `${SITE_URL}${urlPath}`;
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildUrlEntry(loc, lastmod, priority) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function loadJournalArticles() {
  const raw = await fs.readFile(JOURNAL_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.articles) ? parsed.articles : [];
}

async function fetchProducts() {
  const data = await storefrontRequest(`
    query SitemapProducts {
      products(first: 100) {
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }
  `);

  return data.products.edges.map(({ node }) => node);
}

async function fetchCollections() {
  const data = await storefrontRequest(`
    query SitemapCollections {
      collections(first: 20) {
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }
  `);

  return data.collections.edges
    .map(({ node }) => node)
    .filter((collection) => collection.handle && collection.handle !== "frontpage");
}

async function main() {
  const [products, collections, articles] = await Promise.all([
    fetchProducts(),
    fetchCollections(),
    loadJournalArticles(),
  ]);

  const staticUrls = [
    { path: "/", priority: "1.0" },
    { path: "/colecao", priority: "0.9" },
    { path: "/journal", priority: "0.8" },
    { path: "/sobre", priority: "0.6" },
    { path: "/suporte", priority: "0.6" },
    { path: "/trocas", priority: "0.5" },
    { path: "/envio", priority: "0.5" },
    { path: "/privacidade", priority: "0.3" },
    { path: "/termos-de-servico", priority: "0.3" },
  ];

  const entries = [
    ...staticUrls.map((entry) => buildUrlEntry(toAbsolute(entry.path), null, entry.priority)),
    ...collections.map((collection) =>
      buildUrlEntry(toAbsolute(`/colecao/${collection.handle}`), collection.updatedAt?.slice(0, 10), "0.8")
    ),
    ...products.map((product) =>
      buildUrlEntry(toAbsolute(`/produto/${product.handle}`), product.updatedAt?.slice(0, 10), "0.8")
    ),
    ...articles.map((article) =>
      buildUrlEntry(toAbsolute(`/journal/${article.handle}`), article.publishedAt?.slice(0, 10), "0.7")
    ),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  await fs.writeFile(SITEMAP_PATH, xml, "utf8");
  console.log(`sitemap generated with ${entries.length} URLs`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
