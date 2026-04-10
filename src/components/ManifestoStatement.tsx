import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const phrases = [
  "Engenharia do Silêncio.",
  "Materiais que duram.",
  "Ordem sobre o caos.",
];

export function ManifestoStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative" style={{ height: `${(phrases.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Background image with progressive darken */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/assets/hero-banner.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <motion.div
            className="absolute inset-0 bg-black"
            style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [0.3, 0.7]) }}
          />
        </motion.div>

        {/* Phrases */}
        <div className="relative z-10 flex flex-col items-center gap-4 md:gap-6 px-6">
          {phrases.map((phrase, i) => {
            const start = (i + 0.5) / (phrases.length + 1);
            const peak = (i + 1) / (phrases.length + 1);
            const end = (i + 1.5) / (phrases.length + 1);

            return (
              <PhraseItem
                key={i}
                phrase={phrase}
                scrollYProgress={scrollYProgress}
                start={start}
                peak={peak}
                end={end}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface PhraseItemProps {
  phrase: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  peak: number;
  end: number;
}

function PhraseItem({ phrase, scrollYProgress, start, peak, end }: PhraseItemProps) {
  const opacity = useTransform(scrollYProgress, [start, peak, end], [0, 1, 1]);
  const y = useTransform(scrollYProgress, [start, peak], [40, 0]);
  const blur = useTransform(scrollYProgress, [start, peak], [8, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.p
      className="text-[28px] sm:text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white text-center leading-[1.15] tracking-tight"
      style={{ opacity, y, filter }}
    >
      {phrase}
    </motion.p>
  );
}
