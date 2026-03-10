import { motion } from "framer-motion";
import blogRituaisFoco from "@/assets/blog-rituais-foco.jpg";
import blogPerformanceSilenciosa from "@/assets/blog-performance-silenciosa.jpg";
import blogSetupIntencional from "@/assets/blog-setup-intencional.jpg";

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
    featured: true,
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
    featured: false,
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
    featured: false,
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

export default function Journal() {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-semibold">
            Journal.{" "}
            <span className="font-light text-muted-foreground">
              Ideias para quem busca clareza.
            </span>
          </h1>
        </motion.div>

        {/* Featured Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="group cursor-pointer mb-8"
        >
          <div className="bg-card-elevated rounded-2xl overflow-hidden grid md:grid-cols-2 gap-0">
            <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                loading="eager"
              />
            </div>
            <div className="p-7 md:p-10 flex flex-col justify-center">
              <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
                {featured.tag}
              </span>
              <h2 className="text-xl md:text-2xl font-semibold mt-3 mb-3 leading-snug group-hover:opacity-70 transition-opacity">
                {featured.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
                {featured.excerpt}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDate(featured.date)}
              </span>
            </div>
          </div>
        </motion.article>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article, i) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="bg-card-elevated rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
                    {article.tag}
                  </span>
                  <h3 className="text-base font-semibold mt-2 mb-2 leading-snug group-hover:opacity-70 transition-opacity">
                    {article.title}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-auto pt-4">
                    {formatDate(article.date)}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
