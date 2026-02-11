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
    <section className="py-12 md:py-20 px-6 md:px-10">
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
                className="group flex flex-col md:flex-row bg-card-elevated rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-lg h-full"
              >
                {/* Image placeholder */}
                <div className="aspect-[4/3] md:aspect-auto md:w-2/5 bg-accent flex items-center justify-center flex-shrink-0">
                  <card.icon
                    className="h-10 w-10 text-muted-foreground/30"
                    strokeWidth={1}
                  />
                </div>

                {/* Content */}
                <div className="p-5 md:p-6 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">
                      {card.label}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      {card.caption}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {card.copy}
                    </p>
                  </div>
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
