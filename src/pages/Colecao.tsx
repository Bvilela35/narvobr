import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ProductCard } from "@/components/ProductCard";
import { FundamentosNarvo } from "@/components/FundamentosNarvo";
import { useProducts } from "@/hooks/useShopify";

const SITE_URL = "https://narvo.com.br";

export default function Colecao() {
  const { data: products = [], isLoading: loading } = useProducts(20);
  const title = "Colecao Narvo: acessorios premium para setup e home office";
  const description = "Explore a colecao completa da Narvo com acessorios premium para organizacao, ergonomia e setups intencionais.";
  const canonicalUrl = `${SITE_URL}/colecao`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
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
    </>
  );
}
