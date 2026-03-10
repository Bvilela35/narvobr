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

function ArticleCard({ article, index }: { article: typeof articles[0]; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.08 }}
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
  );
}

export default function Journal() {
  const featured = articles[0];
  // Row 2: items 1-2, Row 3: items 3-4, Row 4+: items 5+ in groups of 3
  const row2 = articles.slice(1, 3);
  const row3 = articles.slice(3, 5);
  const remaining = articles.slice(5);

  // Split remaining into chunks of 3
  const row3Plus: typeof articles[] = [];
  for (let i = 0; i < remaining.length; i += 3) {
    row3Plus.push(remaining.slice(i, i + 3));
  }

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

        <div className="space-y-6">
          {/* Row 1: Featured (1 card wide) */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group cursor-pointer"
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

          {/* Row 2: 2 cards */}
          {row2.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {row2.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i + 1} />
              ))}
            </div>
          )}

          {/* Row 3: 2 cards */}
          {row3.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {row3.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i + 3} />
              ))}
            </div>
          )}

          {/* Row 4+: 3 cards per row */}
          {row3Plus.map((chunk, rowIdx) => (
            <div key={rowIdx} className="grid md:grid-cols-3 gap-6">
              {chunk.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i + 5 + rowIdx * 3} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
