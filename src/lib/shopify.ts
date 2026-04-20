import { toast } from "sonner";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'efxqrr-1y.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = '9645130db6cf2b0f59c6feeb3f76f3b9';
const CANONICAL_SUPABASE_URL = "https://uttnlfgoxwgzogtsskbk.supabase.co";

export function resolveSupabaseUrl() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (typeof envUrl === "string" && envUrl.includes("uttnlfgoxwgzogtsskbk.supabase.co")) {
    return envUrl;
  }

  return CANONICAL_SUPABASE_URL;
}

const SUPABASE_FUNCTIONS_URL = `${resolveSupabaseUrl()}/functions/v1`;
const PRODUCT_EDGE_FUNCTION_URL = `${SUPABASE_FUNCTIONS_URL}/shopify-product`;
const COLLECTION_EDGE_FUNCTION_URL = `${SUPABASE_FUNCTIONS_URL}/shopify-collection`;
const PRODUCTS_EDGE_FUNCTION_URL = `${SUPABASE_FUNCTIONS_URL}/shopify-products`;
const HOME_BANNERS_EDGE_FUNCTION_URL = `${SUPABASE_FUNCTIONS_URL}/shopify-home-banners`;
const USE_EDGE_CATALOG = false;

export interface ShopifyVideoSource {
  url: string;
  mimeType: string;
}

export interface ShopifyVideo {
  mediaContentType: string;
  alt: string | null;
  sources: ShopifyVideoSource[];
  previewImage?: { url: string } | null;
}

export interface HomeBanner {
  id: string;
  title: string;
  ctaLabel: string;
  link: string;
  media: {
    type: "image" | "video";
    url: string;
    altText: string | null;
    width?: number | null;
    height?: number | null;
    mimeType?: string | null;
    posterUrl?: string | null;
  };
}

export function optimizeShopifyImage(url: string | undefined, width = 800): string {
  if (!url) return "";
  if (!url.includes("cdn.shopify.com")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}width=${width}`;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    seo?: {
      title: string | null;
      description: string | null;
    };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          sku?: string | null;
          barcode?: string | null;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
          image?: {
            url: string;
            altText: string | null;
          } | null;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
    videoStories?: ShopifyVideo[];
    bulletPoints?: string[];
    tituloDescricao?: string;
    descricaoCompleta?: string;
    fotoDescricao?: { type: 'image'; url: string; altText?: string | null } | { type: 'video'; sources: ShopifyVideoSource[]; previewImage?: string | null } | null;
    specMateriais?: string;
    specTamanho?: string;
    specOQueAcompanha?: string;
    specDetalhes?: string;
    specFoto?: { url: string; altText?: string | null } | null;
    faq?: Array<{ pergunta: string; resposta?: string }>;
    highlights?: Array<{ titulo: string; descricao: string; midiaUrl: string; tipoMidia: 'image' | 'video'; videoSources?: ShopifyVideoSource[] }>;
  };
}

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables }),
    keepalive: true,
  });

  if (response.status === 402) {
    toast.error("Shopify: Plano de pagamento necessário", {
      description: "A API do Shopify requer um plano ativo. Visite admin.shopify.com para atualizar.",
    });
    return;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(`Shopify error: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

async function fetchEdgeJson(url: string) {
  try {
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const response = await fetch(url, {
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
      },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function fetchHomeBanners(): Promise<HomeBanner[]> {
  const data = await fetchEdgeJson(HOME_BANNERS_EDGE_FUNCTION_URL);
  const banners = Array.isArray(data?.banners) ? data.banners : [];

  return banners.filter((banner: any): banner is HomeBanner => {
    return Boolean(
      banner &&
      typeof banner.id === "string" &&
      typeof banner.title === "string" &&
      typeof banner.ctaLabel === "string" &&
      typeof banner.link === "string" &&
      banner.media &&
      (banner.media.type === "image" || banner.media.type === "video") &&
      typeof banner.media.url === "string"
    );
  });
}

function isProductEdgeList(value: unknown): value is ShopifyProduct[] {
  return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null && "node" in item);
}

function normalizeCollectionResponse(collection: any) {
  if (!collection) return null;

  const products = collection.products?.edges;
  if (!Array.isArray(products)) return null;

  return {
    title: collection.title as string,
    description: collection.description as string,
    products: products as ShopifyProduct[],
  };
}

function normalizeProductResponse(product: any): ShopifyProduct | null {
  if (!product) return null;

  // Parse video stories metafield
  const videoEdges = product.videoStoriesMeta?.references?.edges || [];
  const videoStories: ShopifyVideo[] = videoEdges
    .map((e: { node: ShopifyVideo }) => e.node)
    .filter((v: ShopifyVideo) => v.sources && v.sources.length > 0);

  // Parse bullet points metafield (JSON list of strings)
  let bulletPoints: string[] = [];
  try {
    if (product.bulletPointsMeta?.value) {
      bulletPoints = JSON.parse(product.bulletPointsMeta.value);
    }
  } catch { /* ignore parse errors */ }

  // Parse description metafields
  const tituloDescricao = product.tituloDescricaoMeta?.value || undefined;
  const descricaoCompleta = product.descricaoCompletaMeta?.value || undefined;

  // Parse foto/video description metafield
  let fotoDescricao: ShopifyProduct['node']['fotoDescricao'] = null;
  const fotoRef = product.fotoDescricaoMeta?.reference;
  if (fotoRef?.image) {
    fotoDescricao = { type: 'image', url: fotoRef.image.url, altText: fotoRef.image.altText };
  } else if (fotoRef?.sources) {
    fotoDescricao = { type: 'video', sources: fotoRef.sources, previewImage: fotoRef.previewImage?.url };
  }

  // Parse spec metafields
  const specMateriais = product.specMateriaisMeta?.value || undefined;
  const specTamanho = product.specTamanhoMeta?.value || undefined;
  const specOQueAcompanha = product.specOQueAcompanhaMeta?.value || undefined;
  const specDetalhes = product.specDetalhesMeta?.value || undefined;
  let specFoto: ShopifyProduct['node']['specFoto'] = null;
  if (product.specFotoMeta?.reference?.image) {
    specFoto = { url: product.specFotoMeta.reference.image.url, altText: product.specFotoMeta.reference.image.altText };
  }

  // Parse FAQ metafield
  let faq: Array<{ pergunta: string; resposta?: string }> = [];
  try {
    if (product.faqMeta?.value) {
      const parsed = JSON.parse(product.faqMeta.value);
      if (Array.isArray(parsed)) {
        faq = parsed.filter((item: any) => item?.pergunta);
      }
    }
  } catch { /* ignore parse errors */ }

  // Parse highlights metafield (list of metaobject references)
  const highlightEdges = product.highlightsMeta?.references?.edges || [];
  const highlights = highlightEdges
    .map((edge: any) => {
      const node = edge.node;
      const titulo = node.titulo?.value || '';
      let descricao = '';
      try {
        const raw = node.descricao?.value || '';
        const parsed = JSON.parse(raw);
        if (parsed?.type === 'root' && Array.isArray(parsed.children)) {
          descricao = parsed.children
            .map((block: any) => {
              if (block.type === 'paragraph' && Array.isArray(block.children)) {
                return block.children.map((c: any) => c.value || '').join('');
              }
              return '';
            })
            .filter(Boolean)
            .join('\n');
        }
      } catch {
        descricao = node.descricao?.value || '';
      }
      const mediaRef = node.foto_video?.reference;
      let midiaUrl = '';
      let tipoMidia: 'image' | 'video' = 'image';
      let videoSources: ShopifyVideoSource[] | undefined;
      if (mediaRef?.image) {
        midiaUrl = mediaRef.image.url;
        tipoMidia = 'image';
      } else if (mediaRef?.sources) {
        midiaUrl = mediaRef.previewImage?.url || '';
        tipoMidia = 'video';
        videoSources = mediaRef.sources;
      }
      return { titulo, descricao, midiaUrl, tipoMidia, videoSources };
    })
    .filter((h: { titulo: string }) => h.titulo);

  const {
    videoStoriesMeta,
    bulletPointsMeta,
    tituloDescricaoMeta,
    descricaoCompletaMeta,
    fotoDescricaoMeta,
    specMateriaisMeta,
    specTamanhoMeta,
    specOQueAcompanhaMeta,
    specDetalhesMeta,
    specFotoMeta,
    faqMeta,
    highlightsMeta,
    ...cleanProduct
  } = product;

  return {
    node: {
      ...cleanProduct,
      videoStories,
      bulletPoints,
      tituloDescricao,
      descricaoCompleta,
      fotoDescricao,
      specMateriais,
      specTamanho,
      specOQueAcompanha,
      specDetalhes,
      specFoto,
      faq,
      highlights,
    },
  } as ShopifyProduct;
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
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
                sku
                barcode
                price {
                  amount
                  currencyCode
                }
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
`;

const PRODUCT_BY_HANDLE_QUERY = `
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
            sku
            barcode
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

const COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
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
                  price {
                    amount
                    currencyCode
                  }
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
`;

export async function fetchProducts(first = 20, query?: string) {
  if (USE_EDGE_CATALOG) {
    const edgeParams = new URLSearchParams({ first: String(first) });
    if (query) edgeParams.set("query", query);

    const edgeData = await fetchEdgeJson(`${PRODUCTS_EDGE_FUNCTION_URL}?${edgeParams.toString()}`);
    const edgeProducts =
      edgeData?.data?.products?.edges ??
      edgeData?.products?.edges ??
      edgeData?.products ??
      edgeData?.data?.products;

    if (isProductEdgeList(edgeProducts)) {
      return edgeProducts;
    }
  }

  const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query });
  return (data?.data?.products?.edges || []) as ShopifyProduct[];
}

async function fetchProductByHandleCached(handle: string) {
  const response = await fetch(
    `${PRODUCT_EDGE_FUNCTION_URL}?handle=${encodeURIComponent(handle)}`
  );
  if (!response.ok) throw new Error(`Cache fetch error: ${response.status}`);
  return response.json();
}

async function fetchProductByHandleDirect(handle: string) {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.data?.product ?? null;
}

export async function fetchProductByHandle(handle: string) {
  if (USE_EDGE_CATALOG) {
    try {
      const data = await fetchProductByHandleCached(handle);
      const normalized = normalizeProductResponse(data?.data?.product);
      if (normalized) return normalized;
    } catch {
      // Falls back to direct Shopify fetch below.
    }
  }

  const product = await fetchProductByHandleDirect(handle);
  return normalizeProductResponse(product);
}

export async function fetchCollectionByHandle(handle: string, first = 20) {
  if (USE_EDGE_CATALOG) {
    const edgeData = await fetchEdgeJson(
      `${COLLECTION_EDGE_FUNCTION_URL}?handle=${encodeURIComponent(handle)}&first=${first}`
    );
    const edgeCollection = normalizeCollectionResponse(
      edgeData?.data?.collection ?? edgeData?.collection
    );
    if (edgeCollection) return edgeCollection;
  }

  const data = await storefrontApiRequest(COLLECTION_BY_HANDLE_QUERY, { handle, first });
  return normalizeCollectionResponse(data?.data?.collection);
}

const PRODUCT_RECOMMENDATIONS_QUERY = `
  query GetProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId, intent: RELATED) {
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
      images(first: 3) {
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
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

const PRODUCT_METAFIELD_REFS_QUERY = `
  query GetProductMetafieldRefs($productId: ID!) {
    product(id: $productId) {
      relatedProducts: metafield(namespace: "shopify--discovery--product_recommendation", key: "related_products") {
        references(first: 10) {
          edges {
            node {
              ... on Product {
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
                images(first: 3) {
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
      complementaryProducts: metafield(namespace: "shopify--discovery--product_recommendation", key: "complementary_products") {
        references(first: 10) {
          edges {
            node {
              ... on Product {
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
                images(first: 3) {
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
`;

export async function fetchProductRecommendations(productId: string): Promise<ShopifyProduct[]> {
  // Try metafield-based recommendations first (manually set in Shopify admin)
  try {
    const metaData = await storefrontApiRequest(PRODUCT_METAFIELD_REFS_QUERY, { productId });
    const product = metaData?.data?.product;
    const relatedEdges = product?.relatedProducts?.references?.edges || [];
    const complementaryEdges = product?.complementaryProducts?.references?.edges || [];
    const metafieldProducts = [...complementaryEdges, ...relatedEdges];
    
    if (metafieldProducts.length > 0) {
      // Deduplicate by id
      const seen = new Set<string>();
      return metafieldProducts
        .filter((e: { node: ShopifyProduct['node'] }) => {
          if (seen.has(e.node.id)) return false;
          seen.add(e.node.id);
          return true;
        })
        .map((e: { node: ShopifyProduct['node'] }) => ({ node: e.node }));
    }
  } catch (err) {
    console.warn('Metafield recommendations query failed, falling back:', err);
  }

  // Fallback to algorithmic recommendations
  const data = await storefrontApiRequest(PRODUCT_RECOMMENDATIONS_QUERY, { productId });
  const recs = data?.data?.productRecommendations || [];
  return recs.map((node: ShopifyProduct['node']) => ({ node }));
}

const CART_QUERY = `query cart($id: ID!) { 
  cart(id: $id) { 
    id 
    totalQuantity 
    checkoutUrl
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
    discountCodes { code applicable }
  } 
}`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: Array<{ field: string[] | null; message: string }>): boolean {
  return userErrors.some(e => e.message.toLowerCase().includes('cart not found') || e.message.toLowerCase().includes('does not exist'));
}

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

export async function createShopifyCart(item: CartItem): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });
  if (data?.data?.cartCreate?.userErrors?.length > 0) return null;
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;
  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

export async function addLineToShopifyCart(cartId: string, item: CartItem): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });
  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  return { success: true };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });
  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  return { success: true };
}

const CART_DISCOUNT_CODES_UPDATE = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { 
        id 
        cost {
          totalAmount { amount currencyCode }
          subtotalAmount { amount currencyCode }
        }
        discountCodes { code applicable }
      }
      userErrors { field message }
    }
  }
`;

export async function applyDiscountToCart(cartId: string, discountCode: string): Promise<{ success: boolean; applicable?: boolean; totalAmount?: string; discountCodes?: Array<{ code: string; applicable: boolean }> }> {
  try {
    const codes = discountCode ? [discountCode] : [];
    const data = await storefrontApiRequest(CART_DISCOUNT_CODES_UPDATE, {
      cartId,
      discountCodes: codes,
    });
    const userErrors = data?.data?.cartDiscountCodesUpdate?.userErrors || [];
    if (userErrors.length > 0) {
      console.error('Apply discount failed:', userErrors);
      return { success: false };
    }
    const cart = data?.data?.cartDiscountCodesUpdate?.cart;
    const discountCodesResult = cart?.discountCodes || [];
    const totalAmount = cart?.cost?.totalAmount?.amount;
    // Check if the code was applicable
    const applicable = discountCode ? discountCodesResult.some((dc: { code: string; applicable: boolean }) => dc.code === discountCode && dc.applicable) : true;
    return { success: true, applicable, totalAmount, discountCodes: discountCodesResult };
  } catch (error) {
    console.error('Failed to apply discount:', error);
    return { success: false };
  }
}

export { CART_QUERY };

// ─── Blog / Articles ────────────────────────────────────────────

export interface ShopifyArticle {
  id: string;
  title: string;
  handle: string;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  image: { url: string; altText: string | null } | null;
  authorV2: { name: string } | null;
  seo: { title: string | null; description: string | null } | null;
  blog: { handle: string } | null;
}

const BLOG_EDGE_FUNCTION_URL = `${SUPABASE_FUNCTIONS_URL}/shopify-journal`;

async function fetchJournalSnapshot(): Promise<ShopifyArticle[]> {
  try {
    const response = await fetch("/journal.json");
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.articles) ? data.articles : [];
  } catch {
    return [];
  }
}

function normalizeSnapshotArticle(article: any, blogHandle = "blog"): ShopifyArticle {
  return {
    id: article.id,
    title: article.title,
    handle: article.handle,
    excerpt: article.excerpt || null,
    contentHtml: article.contentHtml || article.content || "",
    publishedAt: article.publishedAt,
    tags: Array.isArray(article.tags) ? article.tags : [],
    image: article.image || null,
    authorV2: article.authorV2 || (article.author?.name ? { name: article.author.name } : null),
    seo: article.seo || null,
    blog: article.blog || { handle: blogHandle },
  };
}

export async function fetchBlogArticles(blogHandle = "blog", first = 10): Promise<ShopifyArticle[]> {
  const snapshot = await fetchJournalSnapshot();
  const snapshotArticles = snapshot
    .filter((article) => article.blog?.handle ? article.blog.handle === blogHandle : true)
    .map((article) => normalizeSnapshotArticle(article, blogHandle));

  if (snapshotArticles.length > 0) {
    return snapshotArticles.slice(0, first);
  }

  try {
    const response = await fetch(
      `${BLOG_EDGE_FUNCTION_URL}?blog=${encodeURIComponent(blogHandle)}&first=${first}`
    );
    if (response.ok) {
      const data = await response.json();
      const articles = data?.articles ?? data?.data?.blog?.articles?.edges?.map((e: any) => e.node) ?? [];
      if (Array.isArray(articles) && articles.length > 0) {
        return articles;
      }
    }
  } catch {
    // Falls back to an empty state below.
  }

  return [];
}

export async function fetchBlogArticleByHandle(articleHandle: string, blogHandle = "blog"): Promise<ShopifyArticle | null> {
  const snapshot = await fetchJournalSnapshot();
  const snapshotArticle = snapshot.find((item) => item.handle === articleHandle);
  if (snapshotArticle) {
    return normalizeSnapshotArticle(snapshotArticle, blogHandle);
  }

  try {
    const response = await fetch(
      `${BLOG_EDGE_FUNCTION_URL}?blog=${encodeURIComponent(blogHandle)}&article=${encodeURIComponent(articleHandle)}`
    );
    if (response.ok) {
      const data = await response.json();
      const article = data?.article
        ?? data?.articles?.find((e: any) => e?.handle === articleHandle)
        ?? data?.data?.blog?.articles?.edges?.find((e: any) => e?.node?.handle === articleHandle)?.node
        ?? data?.data?.blog?.articles?.edges?.[0]?.node
        ?? null;

      if (article) {
        return normalizeSnapshotArticle(article, blogHandle);
      }
    }
  } catch {
    // Falls back to null below.
  }

  return null;
}
