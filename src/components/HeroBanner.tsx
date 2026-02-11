import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";
import { useRef } from "react";

export function HeroBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] md:min-h-[85vh] aspect-[3/4] md:aspect-auto flex items-end overflow-hidden">
      <motion.img
        src={heroBanner}
        alt="Setup minimalista com acessórios Narvo"
        className="absolute inset-0 w-full h-[120%] object-cover"
        loading="eager"
        style={{ y }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="relative z-10 w-full px-6 md:px-10 pb-16 md:pb-20">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-white"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Engenharia<br />do Silêncio.
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-white/70 mt-5 max-w-md leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Acessórios premium para seu setup. Projetados para quem exige
            silêncio visual e máxima performance.
          </motion.p>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <Button asChild className="h-12 px-10 rounded-full text-sm font-medium tracking-wide bg-white text-black hover:bg-white/90">
              <Link to="/colecao">
                Ver coleção <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
