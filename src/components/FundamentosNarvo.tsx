import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cards = [
  {
    label: "Garantia",
    headline: "12 Meses de Garantia.",
    body: "Ciclo de vida estendido. Projetado para longevidade estrutural. Cobertura total contra falhas de fabricação.",
    image: "/assets/fundamentos-garantia.jpg",
  },
  {
    label: "Financeiro",
    headline: "10x Sem Juros.",
    body: "Acesso viabilizado. Investimento fragmentado em dez parcelas fixas. Sem acréscimo, sem ruído financeiro.",
    image: "/assets/fundamentos-financeiro.jpg",
  },
  {
    label: "Robustez",
    headline: "Construção Industrial.",
    body: "Aço carbono de alta densidade. Pintura eletrostática microtexturizada. Resistência absoluta ao uso contínuo.",
    image: "/assets/fundamentos-robustez.jpg",
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
                className="min-w-[260px] w-[75vw] md:w-[340px] flex-shrink-0 rounded-2xl overflow-hidden bg-card-elevated"
              >
                <div className="p-5 md:p-6">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground">
                    {card.label}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold leading-tight mt-2 text-foreground">
                    {card.headline}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    {card.body}
                  </p>
                </div>
                <div className="px-5 md:px-6 pb-5 md:pb-6">
                  <img
                    src={card.image}
                    alt={card.headline}
                    className="w-full aspect-[4/3] object-cover rounded-xl"
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
