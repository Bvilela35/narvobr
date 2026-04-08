import { useQuery } from "@tanstack/react-query";
import { fetchBlogArticles, fetchBlogArticleByHandle, type ShopifyArticle } from "@/lib/shopify";

export function useBlogArticles(blogHandle = "blog", first = 20) {
  return useQuery<ShopifyArticle[]>({
    queryKey: ["blog-articles", blogHandle, first],
    queryFn: () => fetchBlogArticles(blogHandle, first),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogArticle(articleHandle: string | undefined, blogHandle = "blog") {
  return useQuery<ShopifyArticle | null>({
    queryKey: ["blog-article", blogHandle, articleHandle],
    queryFn: () => fetchBlogArticleByHandle(articleHandle!, blogHandle),
    enabled: !!articleHandle,
    staleTime: 5 * 60 * 1000,
  });
}
