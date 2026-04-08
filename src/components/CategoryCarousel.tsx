import { Link } from "react-router-dom";
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
  return (
    <section className="py-8 md:py-12 px-6 md:px-10 border-b border-border">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-center gap-8 md:gap-14 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              className="flex flex-col items-center gap-2 min-w-[80px] md:min-w-[100px] group transition-opacity hover:opacity-70"
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
