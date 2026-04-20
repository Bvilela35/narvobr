import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");
const SITE_URL = "https://narvo.com.br";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "efxqrr-1y.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "9645130db6cf2b0f59c6feeb3f76f3b9";

const PRODUCTS_QUERY = `
  query GetPublishedProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          description
          handle
          seo {
            title
            description
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          options {
            name
            values
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                barcode
                availableForSale
                image {
                  url
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          faqMeta: metafield(namespace: "custom", key: "faq") {
            value
          }
        }
      }
    }
  }
`;

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeBarcode(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  return [8, 12, 13, 14].includes(digits.length) ? digits : null;
}

function mapGtinFields(barcode) {
  const normalized = normalizeBarcode(barcode);
  if (!normalized) return {};
  if (normalized.length === 8) return { gtin8: normalized };
  if (normalized.length === 12) return { gtin12: normalized };
  if (normalized.length === 13) return { gtin13: normalized };
  return { gtin14: normalized };
}

function formatSchemaPrice(value) {
  const amount = Number(value || 0);
  return amount.toFixed(2);
}

function getPriceValidUntil(daysFromNow = 30) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

async function storefrontApiRequest(query, variables = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed with ${response.status}`);
  }

  const data = await response.json();
  if (data.errors?.length) {
    throw new Error(data.errors.map((error) => error.message).join(", "));
  }

  return data?.data;
}

async function fetchAllProducts() {
  const products = [];
  let after = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 100, after });
    const connection = data?.products;
    const edges = connection?.edges || [];
    for (const edge of edges) {
      if (edge?.node?.handle) {
        products.push(edge.node);
      }
    }
    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    after = connection?.pageInfo?.endCursor || null;
  }

  return products;
}

function buildVariantSchema(product, variant, imageUrls, seoTitle, seoDescription, productUrl, priceValidUntil) {
  const variantName = variant.title && variant.title !== "Default Title"
    ? `${seoTitle} - ${variant.title}`
    : seoTitle;
  const variantImage = variant.image?.url ? [variant.image.url] : imageUrls;

  return {
    "@type": "Product",
    name: variantName,
    description: seoDescription,
    image: variantImage,
    sku: variant.sku || undefined,
    mpn: variant.sku ? undefined : `${product.handle}-${String(variant.id).split("/").pop()}`,
    brand: { "@type": "Brand", name: "Narvo" },
    ...mapGtinFields(variant.barcode),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: variant.price?.currencyCode || "BRL",
      price: formatSchemaPrice(variant.price?.amount),
      availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil,
    },
  };
}

function buildProductMetadata(product) {
  const seoTitle = product.seo?.title || product.title;
  const seoDescription = stripHtml(product.seo?.description || product.description || "");
  const imageUrls = (product.images?.edges || [])
    .map((edge) => edge?.node?.url)
    .filter((url, index, array) => Boolean(url) && array.indexOf(url) === index);
  const primaryImageUrl = imageUrls[0] || `${SITE_URL}/images/og-narvo.jpg`;
  const productUrl = `${SITE_URL}/produto/${product.handle}`;
  const priceValidUntil = getPriceValidUntil();
  const variants = (product.variants?.edges || []).map((edge) => edge.node);
  const options = product.options || [];

  const productJsonLd =
    variants.length > 1
      ? {
          "@context": "https://schema.org/",
          "@type": "ProductGroup",
          name: seoTitle,
          description: seoDescription,
          image: imageUrls,
          url: productUrl,
          brand: { "@type": "Brand", name: "Narvo" },
          variesBy: options.map((option) => option.name).filter(Boolean),
          hasVariant: variants.map((variant) =>
            buildVariantSchema(product, variant, imageUrls, seoTitle, seoDescription, productUrl, priceValidUntil)
          ),
        }
      : {
          "@context": "https://schema.org/",
          ...buildVariantSchema(product, variants[0], imageUrls, seoTitle, seoDescription, productUrl, priceValidUntil),
          url: productUrl,
        };

  return {
    seoTitle,
    seoDescription,
    primaryImageUrl,
    productUrl,
    productJsonLd,
  };
}

function injectHead(html, metadata) {
  const {
    seoTitle,
    seoDescription,
    primaryImageUrl,
    productUrl,
    productJsonLd,
  } = metadata;

  const headInjection = `
    <title>${escapeHtml(seoTitle)}</title>
    <meta name="description" content="${escapeHtml(seoDescription)}" />
    <link rel="canonical" href="${escapeHtml(productUrl)}" />
    <meta property="og:title" content="${escapeHtml(seoTitle)}" />
    <meta property="og:description" content="${escapeHtml(seoDescription)}" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${escapeHtml(productUrl)}" />
    <meta property="og:image" content="${escapeHtml(primaryImageUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seoTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(seoDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(primaryImageUrl)}" />
    <link rel="preload" as="image" href="${escapeHtml(primaryImageUrl)}" />
    <script type="application/ld+json">${JSON.stringify(productJsonLd)}</script>
  `;

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta name="description"[\s\S]*?>/i, "")
    .replace(/<meta property="og:title"[\s\S]*?>/i, "")
    .replace(/<meta property="og:description"[\s\S]*?>/i, "")
    .replace(/<meta property="og:type"[\s\S]*?>/i, "")
    .replace(/<meta property="og:image"[\s\S]*?>/i, "")
    .replace(/<meta name="twitter:card"[\s\S]*?>/i, "")
    .replace(/<meta name="twitter:image"[\s\S]*?>/i, "")
    .replace("</head>", `${headInjection}\n  </head>`);
}

function buildRedirectHtml(targetUrl) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=${targetUrl}" />
    <link rel="canonical" href="${targetUrl}" />
    <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
    <title>Redirecionando...</title>
  </head>
  <body>
    <p>Redirecionando para <a href="${targetUrl}">${targetUrl}</a>.</p>
  </body>
</html>`;
}

async function writeHtmlFile(filePath, html) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");
}

async function main() {
  const [template, products] = await Promise.all([
    readFile(DIST_INDEX, "utf8"),
    fetchAllProducts(),
  ]);

  await writeFile(path.join(DIST_DIR, "products-manifest.json"), JSON.stringify(products.map((product) => product.handle), null, 2));

  for (const product of products) {
    const metadata = buildProductMetadata(product);
    const productHtml = injectHead(template, metadata);

    await writeHtmlFile(path.join(DIST_DIR, "produto", product.handle, "index.html"), productHtml);
    await writeHtmlFile(path.join(DIST_DIR, "p", product.handle, "index.html"), buildRedirectHtml(metadata.productUrl));
    await writeHtmlFile(path.join(DIST_DIR, "products", product.handle, "index.html"), buildRedirectHtml(metadata.productUrl));
  }

  console.log(`Prerendered ${products.length} product pages.`);
}

main().catch((error) => {
  console.error("postbuild-prerender-products failed:", error);
  process.exitCode = 1;
});
