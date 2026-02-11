import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import insightImg from "@/assets/insight-card.jpg";
import outsightImg from "@/assets/outsight-card.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" as const }
};

const cards = [
  {
    label: "InSight™",
    caption: "Sobre a mesa.",
    copy: "Ferramentas de contato. Aço, feltro e geometria projetados para elevar sua interação e organizar o fluxo de trabalho imediato.",
    cta: "Explorar Superfície",
    link: "/colecao?categoria=insight",
    image: insightImg
  },
  {
    label: "OutSight™",
    caption: "Abaixo do horizonte.",
    copy: "Engenharia invisível. Onde os cabos desaparecem e o ruído técnico é neutralizado para liberar espaço mental.",
    cta: "Explorar Infraestrutura",
    link: "/colecao?categoria=outsight",
    image: outsightImg
  }
];

export function TheSystemSection() {
  return (
    <section className="py-12 px-6 md:px-10 md:py-[12px]">
      <div className="max-w-[1400px] mx-auto">
        <motion.div {...fadeUp} className="mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-light leading-tight mb-2">
            A arquitetura do foco.
          </h2>
          <p className="text-sm text-muted-foreground">
            Dois planos. Um único objetivo: o silêncio visual absoluto.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link
                to={card.link}
                className="group relative block rounded-2xl overflow-hidden aspect-[16/9]"
              >
                {/* Background image */}
                <img
                  src={card.image}
                  alt={card.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Dark overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Text content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8">
                  <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/70">
                    {card.label}
                  </span>
                  <h3 className="text-xl md:text-2xl font-light text-white mt-1 mb-2">
                    {card.caption}
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed max-w-md mb-5">
                    {card.copy}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-white border border-white/40 rounded-full px-5 py-2.5 w-fit group-hover:bg-white/10 transition-colors duration-300">
                    {card.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
