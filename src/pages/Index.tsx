import { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Target, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { HeroBanner } from "@/components/HeroBanner";
import { BrandDifferentials } from "@/components/BrandDifferentials";
import { BlogSection } from "@/components/BlogSection";
import { BeforeAfter } from "@/components/BeforeAfter";
import { CorporateSection } from "@/components/CorporateSection";
import { TheSystemSection } from "@/components/TheSystemSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ManifestoStatement } from "@/components/ManifestoStatement";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { ShopifyProduct } from "@/lib/shopify";
import { useProducts } from "@/hooks/useShopify";
const fadeUp = {
  initial: {
    opacity: 0,
    y: 30
  },
  whileInView: {
    opacity: 1,
    y: 0
  },
  viewport: {
    once: true,
    margin: "-80px"
  },
  transition: {
    duration: 0.8,
    ease: "easeOut" as const
  }
};
const principles = [{
  icon: Layers,
  title: "Materiais sólidos.",
  desc: "Alumínio, madeira, aço. Nada descartável."
}, {
  icon: Target,
  title: "Precisão industrial.",
  desc: "Tolerâncias mínimas. Acabamento impecável."
}, {
  icon: Zap,
  title: "Menos distração. Mais entrega.",
  desc: "Cada peça resolve um problema real."
}];
function ProductCarousel({
  products


}: {products: ShopifyProduct[];}) {
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
    el.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth"
    });
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, {
      passive: true
    });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);
  return <div className="relative group/carousel">
      <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-2" style={{
      scrollbarWidth: "none",
      msOverflowStyle: "none"
    }}>
        {products.map((product) => <div key={product.node.id} className="min-w-[260px] md:min-w-[300px] flex-shrink-0">
            <ProductCard product={product} disableAnimation />
          </div>)}
      </div>

      {canScrollLeft && <button onClick={() => scroll("left")} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card-elevated shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity" aria-label="Anterior">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>}
      {canScrollRight && <button onClick={() => scroll("right")} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card-elevated shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity" aria-label="Próximo">
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>}
    </div>;
}
export default function Index() {
  const { data: products = [], isLoading: loading } = useProducts(8);
  return <>
      <Helmet>
        <link rel="preload" as="image" href="/assets/hero-banner.jpg" fetchPriority="high" />
      </Helmet>
      {/* Hero */}
      <HeroBanner />




      {/* Por que Narvo */}
      <section className="px-6 md:px-10 py-[13px] md:py-[33px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative md:hidden">
            <div id="principles-carousel" className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {principles.map((p, i) =>
            <div key={i}
            className="min-w-[260px] flex-shrink-0 aspect-[4/3] rounded-2xl p-6 flex flex-col justify-end" style={{ backgroundColor: "#f0f0f0" }}>
                  <p.icon className="h-5 w-5 mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-lg font-medium mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
            )}
            </div>
            <div className="flex gap-2 justify-end mt-3">
              <button onClick={() => {const el = document.getElementById("principles-carousel");if (el) el.scrollBy({ left: -270, behavior: "smooth" });}} className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center" aria-label="Anterior">
                <ChevronLeft className="h-5 w-5 text-foreground/60" />
              </button>
              <button onClick={() => {const el = document.getElementById("principles-carousel");if (el) el.scrollBy({ left: 270, behavior: "smooth" });}} className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center" aria-label="Próximo">
                <ChevronRight className="h-5 w-5 text-foreground/80" />
              </button>
            </div>
          </div>

          {/* Desktop: grid 3 colunas */}
          <div className="hidden md:grid md:grid-cols-3 gap-5">
            {principles.map((p, i) =>
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
          className="aspect-[4/3] rounded-2xl p-8 flex flex-col justify-end" style={{ backgroundColor: "#f0f0f0" }}>
                <p.icon className="h-5 w-5 mb-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-lg font-medium mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
          )}
          </div>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="py-24 px-6 md:px-10 md:py-[53px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-12">
            <motion.div {...fadeUp}>
              <h2 className="font-semibold md:text-4xl text-3xl">
                Produtos. <span className="text-muted-foreground font-extralight text-3xl">Peças essenciais para o seu setup.</span>
              </h2>
            </motion.div>
            <Link to="/colecao" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 flex-shrink-0 ml-4">
              Ver todos
            </Link>
          </div>

          {loading ? <div className="flex gap-5 overflow-hidden">
              {Array.from({
            length: 4
          }).map((_, i) => <div key={i} className="min-w-[260px] md:min-w-[300px] flex-shrink-0">
                  <div className="bg-card-elevated rounded-2xl p-6 space-y-4">
                    <div className="aspect-square bg-accent rounded-xl animate-pulse" />
                    <div className="h-3 bg-accent rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-accent rounded w-1/2 animate-pulse" />
                  </div>
                </div>)}
            </div> : products.length === 0 ? <div className="py-20 text-center">
              <p className="text-sm text-muted-foreground">Nada encontrado. Menos, é mais.</p>
            </div> : <ProductCarousel products={products} />}
        </div>
      </section>

      {/* Antes e Depois */}
      <BeforeAfter />

      {/* Diferenciais de Marca */}
      <BrandDifferentials />

      {/* Blog */}
      <BlogSection />

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

      {/* Vendas Corporativas */}
      <CorporateSection />

      {/* Depoimentos */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-t border-border">
        <div className="max-w-[1400px] mx-auto">
          <ReviewsSection />
        </div>
      </section>
    </>;
}