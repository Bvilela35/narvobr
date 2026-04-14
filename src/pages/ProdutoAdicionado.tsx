import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, ShoppingCart, Loader2 } from "lucide-react";
import { fetchProductRecommendations, optimizeShopifyImage } from "@/lib/shopify";
import { shopifyKeys, useProductByHandle } from "@/hooks/useShopify";
import { useCartStore } from "@/stores/cartStore";
import { ProductCard } from "@/components/ProductCard";

export default function ProdutoAdicionado() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { data: product } = useProductByHandle(handle);
  const [openCart, setOpenCart] = useState(false);

  const productId = product?.node?.id;

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: shopifyKeys.recommendations(productId!),
    queryFn: () => fetchProductRecommendations(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  // If no recommendations, go back and open cart
  useEffect(() => {
    if (!isLoading && productId && recommendations.length === 0) {
      // Navigate back and signal to open cart
      navigate(`/produto/${handle}`, { state: { openCart: true }, replace: true });
    }
  }, [isLoading, productId, recommendations, navigate, handle]);

  const productImage = optimizeShopifyImage(product?.node?.images?.edges?.[0]?.node?.url, 96);
  const productTitle = product?.node?.title;

  if (isLoading || !productId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin opacity-30" />
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="added-page">
      <style>{`
        .added-page {
          --added-font: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          font-family: var(--added-font);
          min-height: 80vh;
        }

        .added-page__bar {
          background: #F3F4F6;
          border-bottom: 1px solid #E5E7EB;
          padding: 16px 24px;
        }

        .added-page__bar-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .added-page__bar-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .added-page__bar-img {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          object-fit: cover;
          background: #E5E7EB;
        }

        .added-page__bar-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .added-page__bar-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .added-page__cart-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0f3d2e;
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 500;
          font-family: var(--added-font);
          cursor: pointer;
          transition: opacity 0.15s;
          text-decoration: none;
        }
        .added-page__cart-btn:hover { opacity: 0.88; }

        .added-page__content {
          max-width: 1240px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        .added-page__heading {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 32px;
          color: #111827;
        }

        .added-page__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 768px) {
          .added-page__grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .added-page__bar-inner {
            flex-wrap: wrap;
          }
        }
      `}</style>

      {/* Top bar */}
      <div className="added-page__bar">
        <div className="added-page__bar-inner">
          <div className="added-page__bar-left">
            {productImage && (
              <img src={productImage} alt={productTitle || ""} className="added-page__bar-img" />
            )}
            <div className="added-page__bar-status">
              <span className="added-page__bar-check">
                <Check size={12} color="#fff" strokeWidth={3} />
              </span>
              Adicionado
            </div>
          </div>
          <Link to={`/produto/${handle}`} state={{ openCart: true }} className="added-page__cart-btn">
            Ir para o carrinho
          </Link>
        </div>
      </div>

      {/* Related products */}
      <div className="added-page__content">
        <h2 className="added-page__heading">Combine com</h2>
        <div className="added-page__grid">
          {recommendations.slice(0, 6).map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
