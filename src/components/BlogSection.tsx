import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogArticles } from "@/hooks/useBlog";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ArticleCard({ article, i }: { article: any; i: number }) {
  const tag = article.tags?.[0] || "Journal";
  return (
    <article className="group cursor-pointer h-full">
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
    </article>
  );
}

export function BlogSection() {
  const { data: articles = [] } = useBlogArticles("blog", 3);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (articles.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.85;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-20 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Journal
            </h2>
            <p className="text-2xl md:text-3xl font-semibold">
              Foco & Performance.{" "}
              <span className="font-light text-muted-foreground">
                Ideias para quem busca clareza.
              </span>
            </p>
          </div>
          <Link
            to="/journal"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 flex-shrink-0 ml-4"
          >
            Ver todos
          </Link>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <ArticleCard key={article.handle} article={article} i={i} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-6 px-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {articles.map((article, i) => (
              <div key={article.handle} className="min-w-[85%] snap-start">
                <ArticleCard article={article} i={i} />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => scroll("left")} className="p-2 rounded-full border border-border hover:bg-accent transition-colors" aria-label="Anterior">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll("right")} className="p-2 rounded-full border border-border hover:bg-accent transition-colors" aria-label="Próximo">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
