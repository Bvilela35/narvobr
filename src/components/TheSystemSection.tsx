import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Cable } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

const cards = [
  {
    label: "InSight™",
    caption: "Sobre a mesa.",
    copy: "Ferramentas de contato. Aço, feltro e geometria projetados para elevar sua interação e organizar o fluxo de trabalho imediato.",
    cta: "Explorar Superfície",
    link: "/colecao?categoria=insight",
    icon: Layers,
  },
  {
    label: "OutSight™",
    caption: "Abaixo do horizonte.",
    copy: "Engenharia invisível. Onde os cabos desaparecem e o ruído técnico é neutralizado para liberar espaço mental.",
    cta: "Explorar Infraestrutura",
    link: "/colecao?categoria=outsight",
    icon: Cable,
  },
];

export function TheSystemSection() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div {...fadeUp} className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-light leading-tight mb-3">
            A arquitetura do foco.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg">
            Dois planos. Um único objetivo: o silêncio visual absoluto.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
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
                className="group block bg-card-elevated rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Image placeholder */}
                <div className="aspect-[4/3] bg-accent flex items-center justify-center">
                  <card.icon
                    className="h-12 w-12 text-muted-foreground/40"
                    strokeWidth={1}
                  />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">
                    {card.label}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {card.caption}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {card.copy}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all duration-300">
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
