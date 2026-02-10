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
    >
      <Link to={`/produto/${handle}`} className="group block">
        <div className="aspect-square bg-accent rounded overflow-hidden mb-4">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <span className="text-xs tracking-widest uppercase">Sem imagem</span>
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm opacity-50 mt-1">
          {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
        </p>
      </Link>
    </motion.div>
  );
}
