import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import blogRituaisFoco from "@/assets/blog-rituais-foco.jpg";
import blogPerformanceSilenciosa from "@/assets/blog-performance-silenciosa.jpg";
import blogSetupIntencional from "@/assets/blog-setup-intencional.jpg";

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
    image: blogRituaisFoco,
  },
  {
    slug: "performance-silenciosa",
    tag: "Performance",
    title: "Performance silenciosa: o poder de reduzir estímulos",
    excerpt:
      "Menos notificações, menos objetos, menos ruído. A performance real nasce da subtração — não da adição.",
    date: "2026-02-04",
    readTime: "4 min",
    image: blogPerformanceSilenciosa,
  },
  {
    slug: "setup-intencional",
    tag: "Sistema",
    title: "O setup intencional: cada objeto tem um propósito",
    excerpt:
      "Um setup bem projetado não é sobre ter mais — é sobre ter apenas o que importa, posicionado com intenção.",
    date: "2026-01-28",
    readTime: "6 min",
    image: blogSetupIntencional,
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

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
          <Link
            to="/journal"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 flex-shrink-0 ml-4"
          >
            Ver todos
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group cursor-pointer"
            >
              <div className="bg-card-elevated rounded-2xl overflow-hidden h-full flex flex-col transition-colors hover:bg-accent/50">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                    {article.tag}
                  </span>
                  <h3 className="text-base font-medium mt-3 mb-3 leading-snug group-hover:opacity-70 transition-opacity">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(article.date)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
