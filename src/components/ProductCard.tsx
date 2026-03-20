import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShopifyProduct } from "@/lib/shopify";
import { usePrefetchProduct } from "@/hooks/useShopify";
import { formatInstallmentText } from "@/lib/installments";

const COLOR_MAP: Record<string, string> = {
  preto: "#1a1a1a",
  branco: "#f5f5f5",
  cinza: "#9e9e9e",
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

export function ProductCard({ product, disableAnimation }: ProductCardProps) {
  const { title, handle, priceRange, images, options } = product.node;
  const image = images.edges[0]?.node;
  const price = priceRange.minVariantPrice;
  const prefetchProduct = usePrefetchProduct();

  const colorOption = options?.find(
    (o) => o.name.toLowerCase() === "cor" || o.name.toLowerCase() === "color"
  );
  const colorValues = colorOption?.values ?? [];

  const Wrapper = disableAnimation ? "div" : motion.div;
  const wrapperProps = disableAnimation
    ? { className: "h-full" }
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: { duration: 0.6, ease: "easeOut" },
        className: "h-full",
      };

  return (
    <Wrapper {...(wrapperProps as any)}>
      <Link
        to={`/produto/${handle}`}
        className="group block h-full"
        onMouseEnter={() => prefetchProduct(handle)}
      >
        <div className="h-full flex flex-col">
          {/* Image container with rounded corners and grey bg */}
          <div className="relative w-full pt-[100%] overflow-hidden rounded-2xl bg-card-elevated">
            {image ? (
              <img
                src={image.url}
                alt={image.altText || title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-20">
                <span className="text-xs tracking-widest uppercase">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Text info below the image, no card background */}
          <div className="pt-4 pb-2 space-y-0.5">
            <h3 className="text-base md:text-lg font-semibold text-foreground leading-snug">{title}</h3>
            <p className="text-base text-foreground">
              R${parseFloat(price.amount) % 1 === 0 ? parseFloat(price.amount).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : parseFloat(price.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {(() => {
              const { count, value } = calcInstallments(parseFloat(price.amount));
              if (count <= 1) return null;
              const formatted = value % 1 === 0
                ? value.toLocaleString("pt-BR")
                : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return <p className="text-xs text-muted-foreground">{count}x {formatted} sem juros</p>;
            })()}
            {colorValues.length > 1 && (
              <div className="flex items-center gap-1.5 pt-1">
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
    </Wrapper>
  );
}
