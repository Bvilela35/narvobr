import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Truck, Pencil, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

const items = [
{ icon: Shield, text: "Garantia de 12 meses em todos os produtos." },
{ icon: Truck, text: "Entrega rápida para todo o Brasil." },
{ icon: Pencil, text: "Design autoral. Geometria exclusiva Narvo." },
{ icon: CreditCard, text: "Parcele em até 10x sem juros." }];


export function BrandDifferentials() {
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
    const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth || 280;
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
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-xl md:text-2xl mb-8 md:mb-10">

          <span className="font-semibold">Na Narvo, é diferente.</span>{" "}
          <span className="font-light text-muted-foreground">
            Ainda mais motivos para escolher a gente.
          </span>
        </motion.h2>

        <div className="relative group/carousel">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>

            {items.map((item, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl p-6 md:p-8 flex flex-col justify-between aspect-square min-w-[200px] w-[42vw] md:w-[260px] flex-shrink-0 bg-[#ebebeb]">

                <item.icon className="h-9 w-9 text-muted-foreground" strokeWidth={1.4} />
                <p className="text-base md:text-lg font-semibold leading-snug text-foreground">
                  {item.text}
                </p>
              </motion.div>
            )}
          </div>

          {canScrollLeft &&
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card-elevated shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            aria-label="Anterior">

              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          }
          {canScrollRight &&
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card-elevated shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            aria-label="Próximo">

              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          }
        </div>
      </div>
    </section>);

}