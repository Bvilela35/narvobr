import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ProductCard } from "@/components/ProductCard";
import { useCollectionByHandle } from "@/hooks/useShopify";

const SITE_URL = "https://narvobr.lovable.app";

export default function ColecaoHandle() {
  const { handle } = useParams<{ handle: string }>();
  const { data: collection, isLoading: loading } = useCollectionByHandle(handle);

  const title = collection?.title || "Coleção";
  const description = collection?.description || "Peças do sistema Narvo.";
  const products = collection?.products || [];
  const seoTitle = `${title} | Narvo`;
  const seoDescription = `${description} Explore a colecao ${title} da Narvo com foco em funcionalidade, ergonomia e acabamento premium.`.slice(0, 160);
  const canonicalUrl = `${SITE_URL}/colecao/${handle}`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
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
            {title}.{" "}
            <span className="font-light text-muted-foreground">
              {description}
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
    </>
  );
}
