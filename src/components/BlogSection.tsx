import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogArticles } from "@/hooks/useBlog";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function BlogSection() {
  const { data: articles = [] } = useBlogArticles("blog", 3);

  if (articles.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-6 md:px-10">
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
          {articles.map((article, i) => {
            const tag = article.tags?.[0] || "Journal";
            return (
              <motion.article
                key={article.handle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group cursor-pointer"
              >
                <Link to={`/journal/${article.handle}`}>
                  <div className="bg-card-elevated rounded-2xl overflow-hidden h-full flex flex-col transition-colors hover:bg-accent/50">
                    {article.image && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={article.image.url}
                          alt={article.image.altText || article.title}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                        {tag}
                      </span>
                      <h3 className="text-base font-medium mt-3 mb-3 leading-snug group-hover:opacity-70 transition-opacity">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(article.publishedAt)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
