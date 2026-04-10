import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ── images ── */
const gridImages = [
  { src: "/assets/gallery-setup-1.jpg", alt: "Setup minimalista com monitor e acessórios" },
  { src: "/assets/gallery-setup-2.jpg", alt: "Acessórios de alumínio em desk pad escuro" },
  { src: "/assets/gallery-setup-3.jpg", alt: "Vista aérea de workspace organizado" },
  { src: "/assets/gallery-setup-4.jpg", alt: "Pessoa trabalhando em setup elevado" },
  { src: "/assets/gallery-setup-5.jpg", alt: "Suporte articulado para monitor" },
  { src: "/assets/gallery-setup-6.jpg", alt: "Desk pad de feltro com acessórios premium" },
];

const carouselImages = [
  { src: "/assets/insight-card.jpg", alt: "InSight — organização interna" },
  { src: "/assets/outsight-card.jpg", alt: "OutSight — estética externa" },
  { src: "/assets/before-desk.jpg", alt: "Antes — setup desorganizado" },
  { src: "/assets/after-desk.jpg", alt: "Depois — setup Narvo" },
  { src: "/assets/gallery-setup-1.jpg", alt: "Setup completo" },
  { src: "/assets/gallery-setup-5.jpg", alt: "Monitor arm detail" },
];

const revealText =
  "Acessórios projetados com precisão industrial para transformar seu espaço de trabalho. Alumínio, aço e feltro denso — materiais que ancoram seu setup e silenciam o caos visual. Cada peça resolve um problema real.";

/* ── Component ── */
export function GalleryRevealSection() {
  return (
    <section>
      {/* Part 1 — Dark image grid */}
      <ImageGrid />

      {/* Part 2 — Text reveal on scroll */}
      <TextReveal />

      {/* Part 3 — Horizontal carousel */}
      <HorizontalCarousel />
    </section>
  );
}

/* ═══════ Dark Image Grid ═══════ */
function ImageGrid() {
  return (
    <div className="bg-[hsl(0,0%,5%)] py-8 md:py-12 px-3 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-3 gap-3 md:gap-4">
        {gridImages.map((img, i) => (
          <motion.div
            key={i}
            className={`overflow-hidden rounded-2xl ${i === 1 || i === 3 ? "row-span-2" : ""}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              width={800}
              height={i === 1 || i === 3 ? 1000 : 600}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ Word-by-word Scroll Reveal ═══════ */
function TextReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.2"],
  });

  const words = revealText.split(" ");

  return (
    <div ref={ref} className="bg-background py-24 md:py-40 px-6 md:px-10">
      <div className="max-w-[1100px] mx-auto">
        <p className="text-[24px] sm:text-[32px] md:text-[44px] lg:text-[52px] font-semibold leading-[1.25] tracking-tight">
          {words.map((word, i) => (
            <Word
              key={i}
              word={word}
              index={i}
              total={words.length}
              progress={scrollYProgress}
            />
          ))}
        </p>
      </div>
    </div>
  );
}

interface WordProps {
  word: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function Word({ word, index, total, progress }: WordProps) {
  const start = index / total;
  const end = start + 1 / total;

  const color = useTransform(
    progress,
    [start, end],
    ["hsl(0,0%,82%)", "hsl(0,0%,8%)"]
  );

  return (
    <motion.span style={{ color }} className="inline-block mr-[0.3em]">
      {word}
    </motion.span>
  );
}

/* ═══════ Horizontal Carousel ═══════ */
function HorizontalCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <div ref={ref} className="bg-background overflow-hidden py-12 md:py-20">
      <motion.div
        className="flex gap-4 md:gap-6 pl-6 md:pl-10"
        style={{ x }}
      >
        {carouselImages.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[300px] md:w-[500px] lg:w-[650px] rounded-2xl overflow-hidden"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-[220px] md:h-[360px] lg:h-[440px] object-cover"
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
