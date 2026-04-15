import { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Target, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { HeroBanner } from "@/components/HeroBanner";
import { BrandDifferentials } from "@/components/BrandDifferentials";
import { BlogSection } from "@/components/BlogSection";
import { EssentialsSection } from "@/components/EssentialsSection";
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

      {/* Produtos em destaque */}
      <section className="py-14 px-6 md:px-10 md:py-[53px]">
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

      {/* Banner Calculadora */}
      <section className="px-6 md:px-10 py-10 md:py-14">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-2xl bg-foreground text-background px-8 py-14 md:px-16 md:py-20 flex flex-col items-center text-center gap-6"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Calcule seu foco.
            </h2>
            <p className="text-sm md:text-base opacity-70 max-w-md">
              Descubra quanto a distração custa no seu dia — e como recuperar o controle.
            </p>
            <Link
              to="/calculadora"
              className="mt-2 inline-flex items-center gap-2 px-8 py-3.5 bg-background text-foreground font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
            >
              Fazer o teste
            </Link>
          </motion.div>
        </div>
      </section>

      <BeforeAfter />

      {/* Diferenciais de Marca */}
      <BrandDifferentials />

      {/* Essenciais */}
      <EssentialsSection />

      {/* Blog */}
      <BlogSection />

      {/* Vendas Corporativas */}
      <CorporateSection />

      {/* Depoimentos */}
      <section className="py-16 md:py-20 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <ReviewsSection />
        </div>
      </section>
    </>;
}