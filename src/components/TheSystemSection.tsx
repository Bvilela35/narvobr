import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
    title: "InSight™",
    copy: "Ferramentas sobre a mesa para organizar o fluxo de trabalho.",
    price: "A partir de R$ 89",
    link: "/colecao?categoria=insight",
    image: insightImg
  },
  {
    title: "OutSight™",
    copy: "Engenharia invisível para eliminar o ruído técnico.",
    price: "A partir de R$ 69",
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

        <div className="grid grid-cols-2 gap-3 md:gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link
                to={card.link}
                className="group block bg-card-elevated rounded-2xl overflow-hidden"
              >
                {/* Text content — top */}
                <div className="px-5 pt-5 pb-2 md:px-7 md:pt-7 md:pb-3">
                  <h3 className="text-lg md:text-[22px] font-semibold leading-tight mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {card.copy}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {card.price}
                  </p>
                </div>

                {/* Image — bottom */}
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
