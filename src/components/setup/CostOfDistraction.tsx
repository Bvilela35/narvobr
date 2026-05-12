import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

type Stat = {
  value: string; // raw display "23", "47", "2.1"
  prefix?: string;
  suffix: string;
  numeric: number; // for count-up
  decimals?: number;
  highlight: string; // word in legend to accent in lime
  legend: string;
  source: string;
};

const STATS: Stat[] = [
  {
    value: "23",
    suffix: "min",
    numeric: 23,
    highlight: "recuperar",
    legend: "para recuperar o foco após uma única interrupção.",
    source: "University of California, Irvine",
  },
  {
    value: "47",
    suffix: "%",
    numeric: 47,
    highlight: "produtividade",
    legend: "de queda na produtividade em ambientes visualmente poluídos.",
    source: "Princeton Neuroscience Institute",
  },
  {
    value: "2.1",
    suffix: "h",
    numeric: 2.1,
    decimals: 1,
    highlight: "procurando",
    legend: "perdidas por dia procurando algo na própria mesa.",
    source: "Harvard Business Review",
  },
  {
    value: "0",
    prefix: "R$ ",
    suffix: "",
    numeric: 0,
    highlight: "ordem",
    legend: "é o que sua atenção custa quando o ambiente está em ordem.",
    source: "Narvo · Engenharia do Silêncio",
  },
];

function CountUp({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30%" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(stat.numeric * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat.numeric]);

  const formatted =
    stat.decimals != null
      ? val.toFixed(stat.decimals).replace(".", ",")
      : Math.round(val).toString();

  return (
    <span ref={ref} className="tabular-nums">
      {stat.prefix}
      {formatted}
      {stat.suffix}
    </span>
  );
}

function highlightLegend(legend: string, word: string) {
  const idx = legend.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return legend;
  return (
    <>
      {legend.slice(0, idx)}
      <span className="text-[#0f3d2e] font-medium">
        {legend.slice(idx, idx + word.length)}
      </span>
      {legend.slice(idx + word.length)}
    </>
  );
}

export function CostOfDistraction() {
  return (
    <section className="bg-background py-20 md:py-32 px-6 md:px-10 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          className="max-w-3xl mb-14 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            O custo invisível
          </motion.p>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              A distração tem preço.
            </motion.span>{" "}
            <motion.span
              className="font-light text-muted-foreground inline-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Mas é fácil de eliminar.
            </motion.span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-px bg-foreground/10 rounded-3xl overflow-hidden">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ backgroundColor: "rgba(182, 227, 109, 0.06)" }}
              className="relative bg-background p-8 md:p-14 flex flex-col justify-between min-h-[260px] md:min-h-[340px] group transition-colors"
            >
              {/* Sweep accent on enter */}
              <motion.div
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] bg-[#b6e36d] origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, delay: i * 0.12 + 0.3, ease: "easeOut" }}
              />

              <motion.p
                className="text-[5rem] md:text-[8rem] leading-[0.9] font-semibold tracking-tight text-foreground"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: i * 0.12 + 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <CountUp stat={stat} />
              </motion.p>
              <motion.div
                className="mt-8 max-w-sm"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.12 + 0.55 }}
              >
                <p className="text-base md:text-lg text-muted-foreground leading-snug">
                  {highlightLegend(stat.legend, stat.highlight)}
                </p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                  Fonte · {stat.source}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
