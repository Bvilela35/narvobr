import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ManifestoStatement() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.4, 0.7],
    ["#f0f0f0", "#f0f0f0", "#0A0A0A"]
  );

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.4, 0.7],
    ["#1a1a1a", "#1a1a1a", "#F5F3EF"]
  );

  const subtextColor = useTransform(
    scrollYProgress,
    [0, 0.4, 0.7],
    ["#888780", "#888780", "#999"]
  );

  return (
    <section className="w-full px-3 md:px-6">
      <motion.div
        ref={sectionRef}
        className="w-full rounded-b-3xl py-6 md:py-8 px-6 md:px-10"
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-[800px] mx-auto text-center">
          <motion.p
            className="text-[32px] md:text-[48px] font-bold leading-[1.3]"
            style={{ color: textColor }}
          >
            É infraestrutura pessoal.
          </motion.p>

          <motion.p
            className="mt-8 text-base md:text-[20px] font-normal leading-[1.6]"
            style={{ color: subtextColor }}
          >
            Cada objeto sobre a sua mesa comunica algo
            <br />
            — antes de você abrir a boca em qualquer call.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
