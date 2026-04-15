import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export function HeroBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    return (
    <section ref={sectionRef} className="relative min-h-[150vw] md:min-h-[85vh] flex items-end overflow-hidden mx-3 md:mx-6 mt-3 md:mt-4 rounded-2xl bg-black">
      <div className="absolute inset-0" />

      <div className="absolute inset-0 z-10 px-6 md:px-10 flex items-center justify-center">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            O ambiente onde você trabalha
            <br />
            não é decoração.
          </motion.h1>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <Button asChild className="h-12 px-10 rounded-full text-sm font-medium tracking-wide bg-white text-black hover:bg-black hover:text-white transition-colors duration-500 ease-in-out border border-transparent hover:border-white/30">
              <Link to="/colecao">
                Conheça a coleção <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
