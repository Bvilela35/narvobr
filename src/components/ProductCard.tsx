import { memo } from "react";
import { Link } from "react-router-dom";
import { optimizeShopifyImage, ShopifyProduct } from "@/lib/shopify";
import { usePrefetchProduct } from "@/hooks/useShopify";
import { calcInstallments } from "@/lib/installments";

const COLOR_MAP: Record<string, string> = {
  preto: "#1a1a1a",
  "preto fosco": "#1a1a1a",
  branco: "#f5f5f5",
  "off-white": "#f5f0e8",
  cinza: "#9e9e9e",
  "cinza claro": "#c0c0c0",
  grafite: "#4a4a4a",
  chumbo: "#3d3d3d",
  prata: "#c0c0c0",
  natural: "#d4c5a9",
  caramelo: "#8B5E3C",
  marrom: "#5C3A1E",
  "marrom escuro": "#3B2314",
  bege: "#D4C4A8",
  verde: "#0f3d2e",
};

function getColorHex(name: string): string | null {
  return COLOR_MAP[name.toLowerCase().trim()] ?? null;
}

interface ProductCardProps {
  product: ShopifyProduct;
  disableAnimation?: boolean;
}

export const ProductCard = memo(function ProductCard({ product, disableAnimation }: ProductCardProps) {
  const { title, handle, priceRange, images, options } = product.node;
  const image = images.edges[0]?.node;
  const price = priceRange?.minVariantPrice ?? { amount: "0", currencyCode: "BRL" };
  const prefetchProduct = usePrefetchProduct();
  const priceAmount = Number.parseFloat(price.amount || "0");
  const safePriceAmount = Number.isFinite(priceAmount) ? priceAmount : 0;

  const colorOption = options?.find(
    (o) => o.name.toLowerCase() === "cor" || o.name.toLowerCase() === "color"
  );
  const colorValues = colorOption?.values ?? [];

  return (
    <div className="h-full">
      <Link
        to={`/produto/${handle}`}
        className="group block h-full"
        onMouseEnter={() => prefetchProduct(handle)}
      >
        <div className="h-full flex flex-col rounded-2xl overflow-hidden bg-card-elevated">
          {/* Image container with rounded corners and grey bg */}
          <div className="relative w-full pt-[100%] overflow-hidden rounded-t-2xl bg-card-elevated">
            {image ? (
              <img
                src={optimizeShopifyImage(image.url, 600)}
                alt={image.altText || title}
                width={600}
                height={600}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-20">
                <span className="text-xs tracking-widest uppercase">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Text info below the image, no card background */}
          <div className="pt-5 pb-4 px-4 space-y-1 text-center rounded-b-2xl bg-card-elevated">
            <h3 className="text-base md:text-lg font-semibold text-foreground leading-snug mb-3">{title}</h3>
            <p className="text-sm text-foreground">
              R${safePriceAmount % 1 === 0 ? safePriceAmount.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : safePriceAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {(() => {
              const { count, value } = calcInstallments(safePriceAmount);
              if (count <= 1) return null;
              const formatted = value % 1 === 0
                ? value.toLocaleString("pt-BR")
                : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return <p className="text-xs text-muted-foreground">{count}x {formatted} sem juros</p>;
            })()}
            {colorValues.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {colorValues.map((color) => {
                  const hex = getColorHex(color);
                  if (!hex) return null;
                  return (
                    <span
                      key={color}
                      title={color}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});
