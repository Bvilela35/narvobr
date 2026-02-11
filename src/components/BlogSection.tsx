import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

const articles = [
  {
    slug: "rituais-de-foco",
    tag: "Foco",
    title: "Rituais de foco: como criar um ambiente que trabalha por você",
    excerpt:
      "O ambiente certo elimina decisões desnecessárias. Descubra como pequenos ajustes no seu setup podem multiplicar sua capacidade de concentração.",
    date: "2026-02-10",
    readTime: "5 min",
  },
  {
    slug: "performance-silenciosa",
    tag: "Performance",
    title: "Performance silenciosa: o poder de reduzir estímulos",
    excerpt:
      "Menos notificações, menos objetos, menos ruído. A performance real nasce da subtração — não da adição.",
    date: "2026-02-04",
    readTime: "4 min",
  },
  {
    slug: "setup-intencional",
    tag: "Sistema",
    title: "O setup intencional: cada objeto tem um propósito",
    excerpt:
      "Um setup bem projetado não é sobre ter mais — é sobre ter apenas o que importa, posicionado com intenção.",
    date: "2026-01-28",
    readTime: "6 min",
  },
];

export function BlogSection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 border-t border-border">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-16">
          <motion.div {...fadeUp}>
            <h2 className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Journal
            </h2>
            <p className="text-2xl md:text-3xl font-semibold">
              Foco & Performance.{" "}
              <span className="font-light text-muted-foreground">
                Ideias para quem busca clareza.
              </span>
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group"
            >
              <div className="bg-card-elevated rounded-2xl p-7 h-full flex flex-col justify-between transition-colors hover:bg-accent/50">
                <div>
                  <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                    {article.tag}
                  </span>
                  <h3 className="text-base font-medium mt-3 mb-3 leading-snug group-hover:opacity-70 transition-opacity">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {article.readTime} de leitura
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
