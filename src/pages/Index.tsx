import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { HeroBanner } from "@/components/HeroBanner";
import { DeferredSection } from "@/components/DeferredSection";
import { ShopifyProduct } from "@/lib/shopify";
import { useProducts } from "@/hooks/useShopify";

const BeforeAfter = lazy(() =>
  import("@/components/BeforeAfter").then((module) => ({ default: module.BeforeAfter }))
);
const BrandDifferentials = lazy(() =>
  import("@/components/BrandDifferentials").then((module) => ({ default: module.BrandDifferentials }))
);
const BlogSection = lazy(() =>
  import("@/components/BlogSection").then((module) => ({ default: module.BlogSection }))
);
const CorporateSection = lazy(() =>
  import("@/components/CorporateSection").then((module) => ({ default: module.CorporateSection }))
);
const ReviewsSection = lazy(() =>
  import("@/components/ReviewsSection").then((module) => ({ default: module.ReviewsSection }))
);

function SectionPlaceholder({ minHeight }: { minHeight: number }) {
  return <div aria-hidden="true" style={{ minHeight }} />;
}

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
    el.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
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
            <ProductCard product={product} disableAnimation />
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
  const [shouldLoadProducts, setShouldLoadProducts] = useState(false);
  const { data: products = [], isLoading: loading } = useProducts(8, undefined, shouldLoadProducts);
  const isProductsLoading = !shouldLoadProducts || loading;

  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const enableProducts = () => setShouldLoadProducts(true);

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(enableProducts, { timeout: 1200 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(enableProducts, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <HeroBanner />

      <section className="py-14 px-6 md:px-10 md:py-[53px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-semibold md:text-4xl text-3xl">
                Produtos.{" "}
                <span className="text-muted-foreground font-extralight text-3xl">
                  Peças essenciais para o seu setup.
                </span>
              </h2>
            </div>
            <Link
              to="/colecao"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 flex-shrink-0 ml-4"
            >
              Ver todos
            </Link>
          </div>

          {isProductsLoading ? (
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

      <section className="mx-3 md:mx-6 my-4">
        <div className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden flex items-center justify-center bg-[#f8f8f8]">
          <div className="relative z-10 px-6 md:px-10">
            <div className="flex flex-col items-center text-center gap-4">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-black">
                Você se sente produtivo?
              </h2>
              <p className="text-sm md:text-base text-black/60 mt-1">
                Descubra quantas horas você perde com distrações e como isso diminui sua produtividade.
              </p>
              <Link
                to="/calculadora"
                className="mt-3 inline-flex items-center gap-2 px-7 py-2.5 border border-black text-black font-medium text-sm rounded-full hover:bg-black hover:text-white transition-all duration-300"
              >
                Fazer o teste
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DeferredSection minHeight={700}>
        <Suspense fallback={<SectionPlaceholder minHeight={700} />}>
          <BeforeAfter />
        </Suspense>
      </DeferredSection>

      <DeferredSection minHeight={520}>
        <Suspense fallback={<SectionPlaceholder minHeight={520} />}>
          <BrandDifferentials />
        </Suspense>
      </DeferredSection>

      <DeferredSection minHeight={700}>
        <Suspense fallback={<SectionPlaceholder minHeight={700} />}>
          <BlogSection />
        </Suspense>
      </DeferredSection>

      <DeferredSection minHeight={420}>
        <Suspense fallback={<SectionPlaceholder minHeight={420} />}>
          <CorporateSection />
        </Suspense>
      </DeferredSection>

      <section className="py-16 md:py-20 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <DeferredSection minHeight={520}>
            <Suspense fallback={<SectionPlaceholder minHeight={520} />}>
              <ReviewsSection />
            </Suspense>
          </DeferredSection>
        </div>
      </section>
    </>
  );
}
