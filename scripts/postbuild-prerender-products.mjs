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
const JUDGEME_API_URL = "https://judge.me/api/v1/reviews";
const JUDGEME_SHOP_DOMAIN = "efxqrr-1y.myshopify.com";
const FAQ_SCHEMA_TEST_HANDLES = new Set(["n-field"]);

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
      videoStoriesMeta: metafield(namespace: "custom", key: "video_stories") {
        references(first: 10) {
          edges {
            node {
              ... on Video {
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
      videoUploadDateMeta: metafield(namespace: "custom", key: "video_upload_date") {
        value
      }
      variants(first: 50) {
        edges {
          node {
                id
                title
                sku
                barcode
                availableForSale
                selectedOptions {
                  name
                  value
                }
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

function buildFaqJsonLd(items) {
  const validItems = Array.isArray(items)
    ? items.filter((item) => item?.pergunta && item?.resposta)
    : [];
  if (validItems.length === 0) return null;

  return {
    "@context": "https://schema.org/",
    "@type": "FAQPage",
    mainEntity: validItems.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.resposta,
      },
    })),
  };
}

function buildBreadcrumbJsonLd(productUrl, productName) {
  return {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Coleção",
        item: `${SITE_URL}/colecao`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productName,
        item: productUrl,
      },
    ],
  };
}

function buildVideoJsonLd(videos, productUrl, productName, description, uploadDateValue) {
  const uploadDate =
    typeof uploadDateValue === "string" && !Number.isNaN(Date.parse(uploadDateValue))
      ? new Date(uploadDateValue).toISOString()
      : null;

  return (Array.isArray(videos) ? videos : [])
    .map((video, index) => {
      const source = Array.isArray(video?.sources) ? video.sources.find((item) => item?.url) : null;
      const thumbnailUrl = video?.previewImage?.url;
      if (!source?.url || !thumbnailUrl || !uploadDate) return null;

      return {
        "@context": "https://schema.org/",
        "@type": "VideoObject",
        name: video.alt || `${productName} - vídeo ${index + 1}`,
        description,
        thumbnailUrl: [thumbnailUrl],
        contentUrl: source.url,
        embedUrl: productUrl,
        ...(uploadDate ? { uploadDate } : {}),
      };
    })
    .filter(Boolean);
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

async function fetchJudgeMeReviews(handle) {
  const apiToken =
    process.env.JUDGEME_PRIVATE_API_TOKEN ||
    process.env.JUDGEME_API_TOKEN;
  if (!apiToken || !handle) return null;

  const params = new URLSearchParams({
    api_token: apiToken,
    shop_domain: JUDGEME_SHOP_DOMAIN,
    handle,
    per_page: "20",
    page: "1",
  });

  const response = await fetch(`${JUDGEME_API_URL}?${params.toString()}`);
  if (!response.ok) {
    console.warn(`Judge.me reviews unavailable for ${handle}: ${response.status}`);
    return null;
  }

  const data = await response.json();
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  const filtered = reviews.filter((review) => review?.product_handle === handle && review?.rating);

  if (filtered.length === 0) return null;

  const averageRating = filtered.reduce((sum, review) => sum + Number(review.rating || 0), 0) / filtered.length;

  const reviewSchema = filtered
    .slice(0, 5)
    .map((review) => {
      const authorName = review?.reviewer?.name || "Cliente verificado";
      const body = stripHtml(review?.body || "");
      const title = stripHtml(review?.title || "");
      const createdAt = review?.created_at ? new Date(review.created_at).toISOString().slice(0, 10) : undefined;

      return {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: authorName,
        },
        datePublished: createdAt,
        name: title || undefined,
        reviewBody: body || undefined,
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(review.rating),
          bestRating: "5",
          worstRating: "1",
        },
      };
    });

  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount: String(filtered.length),
    },
    review: reviewSchema,
  };
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
  const videoStories = (product.videoStoriesMeta?.references?.edges || [])
    .map((edge) => edge?.node)
    .filter((node) => Array.isArray(node?.sources) && node.sources.length > 0);
  const videoUploadDate = product.videoUploadDateMeta?.value || null;
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
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(productUrl, seoTitle);
  const videoJsonLd = buildVideoJsonLd(videoStories, productUrl, seoTitle, seoDescription, videoUploadDate);
  let faqJsonLd = null;
  if (FAQ_SCHEMA_TEST_HANDLES.has(product.handle)) {
    try {
      const parsedFaq = JSON.parse(product.faqMeta?.value || "[]");
      faqJsonLd = buildFaqJsonLd(parsedFaq);
    } catch {
      faqJsonLd = null;
    }
  }

  return {
    seoTitle,
    seoDescription,
    primaryImageUrl,
    productUrl,
    productJsonLd,
    breadcrumbJsonLd,
    videoJsonLd,
    faqJsonLd,
  };
}

function mergeReviewSchema(productJsonLd, reviewSchema) {
  if (!reviewSchema) return productJsonLd;

  return {
    ...productJsonLd,
    aggregateRating: reviewSchema.aggregateRating,
    review: reviewSchema.review,
  };
}

function injectHead(html, metadata) {
  const {
    seoTitle,
    seoDescription,
    primaryImageUrl,
    productUrl,
    productJsonLd,
    breadcrumbJsonLd,
    videoJsonLd,
    faqJsonLd,
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
    <script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>
    ${videoJsonLd.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n    ")}
    ${faqJsonLd ? `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>` : ""}
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

function buildMerchantItem(product, variant) {
  const baseTitle = product.seo?.title || product.title;
  const variantSuffix = variant?.title && variant.title !== "Default Title" ? ` - ${variant.title}` : "";
  const title = `${baseTitle}${variantSuffix}`;
  const description = stripHtml(product.seo?.description || product.description || "");
  const productUrl = `${SITE_URL}/produto/${product.handle}`;
  const imageUrls = (product.images?.edges || [])
    .map((edge) => edge?.node?.url)
    .filter((url, index, array) => Boolean(url) && array.indexOf(url) === index);
  const primaryImage = variant?.image?.url || imageUrls[0] || `${SITE_URL}/images/og-narvo.jpg`;
  const additionalImages = imageUrls.filter((url) => url !== primaryImage).slice(0, 10);
  const normalizedBarcode = normalizeBarcode(variant?.barcode);
  const variantId = String(variant?.id || "").split("/").pop() || product.handle;
  const itemId = variant?.sku || `${product.handle}-${variantId}`;
  const selectedOptions = Array.isArray(variant?.selectedOptions) ? variant.selectedOptions : [];
  const sizeOption = selectedOptions.find((option) => /^(size|tamanho)$/i.test(option?.name || ""));
  const colorOption = selectedOptions.find((option) => /^(color|cor)$/i.test(option?.name || ""));
  const priceAmount = formatSchemaPrice(variant?.price?.amount);
  const currency = variant?.price?.currencyCode || "BRL";

  const fields = [
    ["g:id", itemId],
    ["title", title],
    ["description", description],
    ["link", productUrl],
    ["g:image_link", primaryImage],
    ...additionalImages.map((url) => ["g:additional_image_link", url]),
    ["g:availability", variant?.availableForSale ? "in_stock" : "out_of_stock"],
    ["g:price", `${priceAmount} ${currency}`],
    ["g:condition", "new"],
    ["g:brand", "Narvo"],
    ["g:item_group_id", product.handle],
    ["g:mpn", variant?.sku || undefined],
    ["g:gtin", normalizedBarcode || undefined],
    ["g:size", sizeOption?.value || undefined],
    ["g:color", colorOption?.value || undefined],
  ];

  if (!normalizedBarcode && !variant?.sku) {
    fields.push(["g:identifier_exists", "false"]);
  }

  const xmlFields = fields
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([tag, value]) => `      <${tag}>${escapeHtml(String(value))}</${tag}>`)
    .join("\n");

  return `    <item>
${xmlFields}
    </item>`;
}

function buildMerchantFeed(products) {
  const items = products.flatMap((product) => {
    const variants = (product.variants?.edges || []).map((edge) => edge?.node).filter(Boolean);
    if (variants.length === 0) {
      return [];
    }

    return variants.map((variant) => buildMerchantItem(product, variant));
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Narvo Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Feed de produtos da Narvo para Google Merchant Center.</description>
${items.join("\n")}
  </channel>
</rss>
`;
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
  await writeFile(path.join(DIST_DIR, "feed.xml"), buildMerchantFeed(products), "utf8");

  for (const product of products) {
    const metadata = buildProductMetadata(product);
    const reviewSchema = await fetchJudgeMeReviews(product.handle);
    metadata.productJsonLd = mergeReviewSchema(metadata.productJsonLd, reviewSchema);
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
