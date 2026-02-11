import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

export function HeroBanner() {
  return (
    <section className="min-h-[85vh] flex items-center px-6 md:px-10 py-12 md:py-0">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row items-center gap-10 md:gap-16">
        {/* Text block */}
        <motion.div
          className="flex-1 max-w-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
            Engenharia<br />do Silêncio.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-6 max-w-lg leading-relaxed">
            Acessórios premium para seu setup. Projetados para quem exige
            silêncio visual e máxima performance.
          </p>
          <div className="flex items-center gap-6 mt-10">
            <Button asChild className="h-12 px-8 rounded text-sm font-medium tracking-wide">
              <Link to="/colecao">
                Ver coleção <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link
              to="/sobre"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Como funciona
            </Link>
          </div>
        </motion.div>

        {/* Image card */}
        <motion.div
          className="flex-1 w-full md:max-w-[55%]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[16/10]">
            <img
              src={heroBanner}
              alt="Setup minimalista com acessórios Narvo"
              className="w-full h-full object-cover"
              loading="eager"
            />
            {/* Badge */}
            <Link
              to="/colecao"
              className="absolute bottom-5 right-5 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium tracking-[0.2em] uppercase px-5 py-3 rounded-full flex items-center gap-2 hover:bg-background transition-colors"
            >
              Descubra <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
