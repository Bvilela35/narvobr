import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { FundamentosNarvo } from "@/components/FundamentosNarvo";
import { useProducts } from "@/hooks/useShopify";

export default function Colecao() {
  const { data: products = [], isLoading: loading } = useProducts(20);

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
            Coleção. <span className="font-light text-muted-foreground">Todas as peças do sistema Narvo.</span>
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
            <p className="text-sm text-muted-foreground">Nada encontrado. Menos, é mais.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <FundamentosNarvo />
    </section>
  );
}
