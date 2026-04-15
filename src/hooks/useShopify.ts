import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  fetchProducts,
  fetchProductByHandle,
  fetchCollectionByHandle,
  fetchProductRecommendations,
  ShopifyProduct,
} from "@/lib/shopify";

// Query keys
export const shopifyKeys = {
  products: (first: number, query?: string) => ["shopify", "products", first, query] as const,
  product: (handle: string) => ["shopify", "product", handle] as const,
  collection: (handle: string, first: number) => ["shopify", "collection", handle, first] as const,
  recommendations: (productId: string) => ["shopify", "recommendations", productId] as const,
};

// Hooks
export function useProducts(first = 20, query?: string, enabled = true) {
  return useQuery({
    queryKey: shopifyKeys.products(first, query),
    queryFn: () => fetchProducts(first, query),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useProductByHandle(handle: string | undefined) {
  return useQuery({
    queryKey: shopifyKeys.product(handle!),
    queryFn: () => fetchProductByHandle(handle!),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCollectionByHandle(handle: string | undefined, first = 40) {
  return useQuery({
    queryKey: shopifyKeys.collection(handle!, first),
    queryFn: () => fetchCollectionByHandle(handle!, first),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useProductRecommendations(productId: string | undefined) {
  return useQuery({
    queryKey: shopifyKeys.recommendations(productId!),
    queryFn: () => fetchProductRecommendations(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Prefetch helpers
export function usePrefetchProduct() {
  const qc = useQueryClient();
  return useCallback(
    (handle: string) => {
      qc.prefetchQuery({
        queryKey: shopifyKeys.product(handle),
        queryFn: () => fetchProductByHandle(handle),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      });
    },
    [qc]
  );
}

export function usePrefetchCollection() {
  const qc = useQueryClient();
  return useCallback(
    (handle: string, first = 40) => {
      qc.prefetchQuery({
        queryKey: shopifyKeys.collection(handle, first),
        queryFn: () => fetchCollectionByHandle(handle, first),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      });
    },
    [qc]
  );
}
