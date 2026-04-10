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
    <section ref={containerRef} className="relative bg-background" style={{ height: `${(phrases.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="relative w-full flex items-center justify-center">
          {phrases.map((phrase, i) => (
            <PhraseItem
              key={i}
              phrase={phrase}
              index={i}
              total={phrases.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PhraseItemProps {
  phrase: string;
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function PhraseItem({ phrase, index, total, scrollYProgress }: PhraseItemProps) {
  const segmentSize = 1 / (total + 1);
  const fadeInStart = index * segmentSize;
  const activeStart = fadeInStart + segmentSize * 0.3;
  const activeEnd = (index + 1) * segmentSize;
  const fadeOutEnd = activeEnd + segmentSize * 0.3;

  // Opacity: fade in → fully visible → fade out
  const opacity = useTransform(
    scrollYProgress,
    [fadeInStart, activeStart, activeEnd, Math.min(fadeOutEnd, 1)],
    [0, 1, 1, index === total - 1 ? 1 : 0]
  );

  // Scale: slightly smaller → normal → slightly smaller
  const scale = useTransform(
    scrollYProgress,
    [fadeInStart, activeStart, activeEnd, Math.min(fadeOutEnd, 1)],
    [0.85, 1, 1, index === total - 1 ? 1 : 0.95]
  );

  // Color transition: light gray italic → dark black bold
  // We use fontWeight and color interpolation
  const color = useTransform(
    scrollYProgress,
    [fadeInStart, activeStart],
    ["hsl(0, 0%, 75%)", "hsl(0, 0%, 5%)"]
  );

  // Font weight via a mapped value
  const fontWeight = useTransform(
    scrollYProgress,
    [fadeInStart, activeStart],
    [300, 700]
  );

  // Italic → normal: use skewX as a proxy for italic feel
  const skewX = useTransform(
    scrollYProgress,
    [fadeInStart, activeStart],
    [-8, 0]
  );

  return (
    <motion.p
      className="absolute text-[28px] sm:text-[40px] md:text-[56px] lg:text-[72px] text-center leading-[1.1] tracking-tight px-6"
      style={{
        opacity,
        scale,
        color,
        fontWeight,
        skewX,
      }}
    >
      {phrase}
    </motion.p>
  );
}
