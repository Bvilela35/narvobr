import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import garantiaImg from "@/assets/fundamentos-garantia.jpg";
import financeiroImg from "@/assets/fundamentos-financeiro.jpg";
import robustezImg from "@/assets/fundamentos-robustez.jpg";

const cards = [
  {
    label: "Garantia",
    headline: "12 Meses de Garantia.",
    body: "Ciclo de vida estendido. Projetado para longevidade estrutural. Cobertura total contra falhas de fabricação.",
    image: garantiaImg,
  },
  {
    label: "Financeiro",
    headline: "10x Sem Juros.",
    body: "Acesso viabilizado. Investimento fragmentado em dez parcelas fixas. Sem acréscimo, sem ruído financeiro.",
    image: financeiroImg,
  },
  {
    label: "Robustez",
    headline: "Construção Industrial.",
    body: "Aço carbono de alta densidade. Pintura eletrostática microtexturizada. Resistência absoluta ao uso contínuo.",
    image: robustezImg,
  },
];

export function FundamentosNarvo() {
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
    const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth || 360;
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
  }, []);

  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 md:mb-10"
        >
          <h2 className="text-xl md:text-2xl">
            <span className="font-semibold">Fundamentos Narvo.</span>{" "}
            <span className="font-light text-muted-foreground">
              Fabricado no Brasil. Padrão Narvo.
            </span>
          </h2>
        </motion.div>

        <div className="relative group/carousel">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="min-w-[280px] w-[80vw] md:w-[380px] flex-shrink-0 rounded-2xl overflow-hidden flex flex-col"
                style={{ backgroundColor: "#0D0D0D" }}
              >
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <span
                    className="text-xs tracking-widest uppercase mb-4"
                    style={{ color: "#808080" }}
                  >
                    {card.label}
                  </span>
                  <h3
                    className="text-xl md:text-2xl font-semibold leading-tight mb-3"
                    style={{ color: "#E0E0E0" }}
                  >
                    {card.headline}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#999999" }}
                  >
                    {card.body}
                  </p>
                </div>
                <div className="px-6 md:px-8 pb-6 md:pb-8">
                  <img
                    src={card.image}
                    alt={card.headline}
                    className="w-full aspect-square object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              aria-label="Próximo"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
