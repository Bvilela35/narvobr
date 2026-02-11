import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { fetchCollectionByHandle, ShopifyProduct } from "@/lib/shopify";

export default function ColecaoHandle() {
  const { handle } = useParams<{ handle: string }>();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchCollectionByHandle(handle, 40)
      .then((col) => {
        if (col) {
          setTitle(col.title);
          setDescription(col.description);
          setProducts(col.products);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [handle]);

  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-2xl md:text-3xl font-semibold">
            {title || "Coleção"}.{" "}
            <span className="font-light text-muted-foreground">
              {description || "Peças do sistema Narvo."}
            </span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="bg-card-elevated rounded-2xl p-6 space-y-4">
                  <div className="aspect-square bg-accent rounded-xl animate-pulse" />
                  <div className="h-3 bg-accent rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-accent rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-sm text-muted-foreground">Nenhum produto nesta coleção.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
