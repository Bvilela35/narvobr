import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import categorySetup from "@/assets/category-montar-setup.png";
import categoryInsight from "@/assets/category-insight.png";
import categoryOutsight from "@/assets/category-outsight.png";
import categoryAcessorios from "@/assets/category-acessorios.png";
import categoryDecoracao from "@/assets/category-decoracao.png";

const categories = [
  { label: "Montar Setup", img: categorySetup, href: "/colecao" },
  { label: "InSight", img: categoryInsight, href: "/colecao/narvo-insight" },
  { label: "OutSight", img: categoryOutsight, href: "/colecao/narvo-outsight" },
  { label: "Acessórios", img: categoryAcessorios, href: "/colecao" },
  { label: "Decoração", img: categoryDecoracao, href: "/colecao" },
];

export function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const check = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  return (
    <section className="py-8 md:py-12 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto relative">
        {/* Mobile arrows */}
        {canLeft && (
          <button
            onClick={() => scroll("left")}
            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/80 shadow flex items-center justify-center"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4 text-foreground/60" />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scroll("right")}
            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/80 shadow flex items-center justify-center"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4 text-foreground/60" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex justify-start md:justify-center gap-8 md:gap-14 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              className="flex flex-col items-center gap-2 min-w-[72px] md:min-w-[100px] group transition-opacity hover:opacity-70"
            >
              <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] flex items-center justify-center">
                <img
                  src={cat.img}
                  alt={cat.label}
                  loading="lazy"
                  width={88}
                  height={88}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs md:text-sm text-foreground whitespace-nowrap">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
