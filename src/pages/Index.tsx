import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

const principles = [
  { icon: Layers, title: "Materiais sólidos.", desc: "Alumínio, madeira, aço. Nada descartável." },
  { icon: Target, title: "Precisão industrial.", desc: "Tolerâncias mínimas. Acabamento impecável." },
  { icon: Zap, title: "Menos distração. Mais entrega.", desc: "Cada peça resolve um problema real." },
];

export default function Index() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(8).then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="min-h-[85vh] flex items-center px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto w-full">
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Engenharia<br />do Silêncio.
          </motion.h1>
          <motion.p
            className="text-base md:text-lg opacity-50 mt-6 max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Acessórios premium para seu setup. Projetados para quem exige silêncio visual e máxima performance.
          </motion.p>
          <motion.div
            className="flex items-center gap-6 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <Button asChild className="h-12 px-8 rounded text-sm font-medium tracking-wide">
              <Link to="/colecao">Ver coleção <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Link to="/sobre" className="text-sm opacity-50 hover:opacity-100 transition-opacity underline underline-offset-4">
              Como funciona
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Por que Narvo */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2 {...fadeUp} className="text-xs font-medium tracking-[0.3em] uppercase opacity-40 mb-16">
            Por que Narvo
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {principles.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <p.icon className="h-5 w-5 mb-4 opacity-40" strokeWidth={1.5} />
                <h3 className="text-lg font-medium mb-2">{p.title}</h3>
                <p className="text-sm opacity-50 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-12">
            <motion.h2 {...fadeUp} className="text-xs font-medium tracking-[0.3em] uppercase opacity-40">
              Produtos
            </motion.h2>
            <Link to="/colecao" className="text-sm opacity-50 hover:opacity-100 transition-opacity underline underline-offset-4">
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-accent rounded animate-pulse" />
                  <div className="h-3 bg-accent rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-accent rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm opacity-40">Nada encontrado. Menos, é mais.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-light leading-tight mb-6">
              Sistema, não enfeite.
            </h2>
            <p className="text-base opacity-50 leading-relaxed max-w-lg">
              Cada peça Narvo foi projetada como parte de um sistema coeso. 
              Nada é decorativo — tudo tem função, propósito e lugar. 
              Organização sem esforço. Foco sem distração.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-t border-border">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2 {...fadeUp} className="text-xs font-medium tracking-[0.3em] uppercase opacity-40 mb-16">
            Depoimentos
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border border-border rounded p-8"
              >
                <p className="text-sm opacity-40 italic leading-relaxed">
                  Ainda sem avaliações.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
