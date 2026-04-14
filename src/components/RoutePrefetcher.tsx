import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { fetchProductByHandle, fetchCollectionByHandle, fetchProducts } from "@/lib/shopify";
import { shopifyKeys } from "@/hooks/useShopify";

/**
 * Route-level data prefetcher.
 * 
 * Watches URL changes and immediately starts Shopify API fetches
 * BEFORE the lazy-loaded page component mounts. This makes the
 * data fetch run in parallel with the JS chunk download instead
 * of sequentially (chunk download → mount → useQuery → fetch).
 * 
 * Impact: reduces LCP/FCP by ~300-500ms (Shopify API latency).
 */
export function RoutePrefetcher() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const lastPath = useRef("");

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    // /produto/:handle — prefetch product data
    const productMatch = path.match(/^\/produto\/([^/]+)$/);
    if (productMatch) {
      const handle = productMatch[1];
      queryClient.prefetchQuery({
        queryKey: shopifyKeys.product(handle),
        queryFn: () => fetchProductByHandle(handle),
        staleTime: 5 * 60 * 1000,
      });
      return;
    }

    // /colecao/:handle — prefetch collection
    const collectionMatch = path.match(/^\/colecao\/([^/]+)$/);
    if (collectionMatch) {
      const handle = collectionMatch[1];
      queryClient.prefetchQuery({
        queryKey: shopifyKeys.collection(handle, 40),
        queryFn: () => fetchCollectionByHandle(handle, 40),
        staleTime: 5 * 60 * 1000,
      });
      return;
    }

    // /colecao — prefetch all products
    if (path === "/colecao") {
      queryClient.prefetchQuery({
        queryKey: shopifyKeys.products(20, undefined),
        queryFn: () => fetchProducts(20),
        staleTime: 5 * 60 * 1000,
      });
      return;
    }
  }, [location.pathname, queryClient]);

  return null;
}
