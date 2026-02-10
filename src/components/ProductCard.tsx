import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShopifyProduct } from "@/lib/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { title, handle, priceRange, images } = product.node;
  const image = images.edges[0]?.node;
  const price = priceRange.minVariantPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full"
    >
      <Link to={`/produto/${handle}`} className="group block h-full">
        <div className="bg-card-elevated rounded-2xl overflow-hidden transition-shadow duration-300 group-hover:shadow-lg h-full flex flex-col">
          <div className="aspect-square w-full overflow-hidden p-4 md:p-6">
            {image ? (
              <img
                src={image.url}
                alt={image.altText || title}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <span className="text-xs tracking-widest uppercase">Sem imagem</span>
              </div>
            )}
          </div>
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
