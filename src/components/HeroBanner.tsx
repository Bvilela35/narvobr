import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative min-h-[150vw] md:min-h-[85vh] flex items-end overflow-hidden mx-3 md:mx-6 mt-3 md:mt-4 rounded-2xl">
      <img
        src="/optimized/home/hero-banner-1600.jpg"
        srcSet="/optimized/home/hero-banner-960.jpg 960w, /optimized/home/hero-banner-1600.jpg 1600w"
        sizes="100vw"
        alt="Setup minimalista com acessórios Narvo"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        fetchPriority="high"
        width={1920}
        height={1080}
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute inset-0 z-10 px-6 md:px-10 flex items-center justify-center">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white max-w-3xl">
            Seu setup.
            <br />
            Sem concessões.
          </h1>

          <div className="mt-8">
            <Button asChild className="h-12 px-10 rounded-full text-sm font-medium tracking-wide bg-white text-black hover:bg-black hover:text-white transition-colors duration-500 ease-in-out border border-transparent hover:border-white/30">
              <Link to="/colecao">
                Conheça a coleção <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
