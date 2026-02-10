import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Target, Zap, ChevronLeft, ChevronRight } from "lucide-react";
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

function ProductCarousel({ products }: { products: ShopifyProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth || 300;
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  return (
    <div className="relative group/carousel">
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div key={product.node.id} className="min-w-[260px] md:min-w-[300px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card-elevated shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card-elevated shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Próximo"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      )}
    </div>
  );
}

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
            className="text-base md:text-lg text-muted-foreground mt-6 max-w-lg leading-relaxed"
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
            <Link to="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
              Como funciona
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Por que Narvo */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2 {...fadeUp} className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-16">
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
                <p.icon className="h-5 w-5 mb-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-lg font-medium mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-12">
            <motion.div {...fadeUp}>
              <h2 className="text-2xl md:text-3xl font-semibold">
                Produtos. <span className="font-light text-muted-foreground">Peças essenciais para o seu setup.</span>
              </h2>
            </motion.div>
            <Link to="/colecao" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 flex-shrink-0 ml-4">
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[260px] md:min-w-[300px] flex-shrink-0">
                  <div className="bg-card-elevated rounded-2xl p-6 space-y-4">
                    <div className="aspect-square bg-accent rounded-xl animate-pulse" />
                    <div className="h-3 bg-accent rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-accent rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-muted-foreground">Nada encontrado. Menos, é mais.</p>
            </div>
          ) : (
            <ProductCarousel products={products} />
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
            <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
              Cada peça Narvo foi projetada como parte de um sistema coeso. 
              Nada é decorativo — tudo tem função, propósito e lugar. 
              Organização sem esforço. Foco sem distração.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-t border-border">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2 {...fadeUp}>
            <span className="text-2xl md:text-3xl font-semibold">Depoimentos. </span>
            <span className="text-2xl md:text-3xl font-light text-muted-foreground">O que dizem sobre a Narvo.</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-5 mt-16">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-card-elevated rounded-2xl p-8"
              >
                <p className="text-sm text-muted-foreground italic leading-relaxed">
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
