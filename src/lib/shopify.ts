import { toast } from "sonner";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'efxqrr-1y.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = '9645130db6cf2b0f59c6feeb3f76f3b9';

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
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
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
  const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query });
  return (data?.data?.products?.edges || []) as ShopifyProduct[];
}

export async function fetchProductByHandle(handle: string) {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const product = data?.data?.product;
  if (!product) return null;
  return { node: product } as ShopifyProduct;
}

export async function fetchCollectionByHandle(handle: string, first = 20) {
  const data = await storefrontApiRequest(COLLECTION_BY_HANDLE_QUERY, { handle, first });
  const collection = data?.data?.collection;
  if (!collection) return null;
  return {
    title: collection.title as string,
    description: collection.description as string,
    products: (collection.products.edges || []) as ShopifyProduct[],
  };
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
