import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useBlogArticles } from "@/hooks/useBlog";
import type { ShopifyArticle } from "@/lib/shopify";

const SITE_URL = "https://narvo.com.br";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ArticleCard({ article, index }: { article: ShopifyArticle; index: number }) {
  const tag = article.tags?.[0] || "Journal";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.08 }}
      className="group cursor-pointer"
    >
      <Link to={`/journal/${article.handle}`}>
        <div className="bg-card-elevated rounded-2xl overflow-hidden h-full flex flex-col">
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
            <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
              {tag}
            </span>
            <h3 className="text-base font-semibold mt-2 mb-2 leading-snug group-hover:opacity-70 transition-opacity">
              {article.title}
            </h3>
            <span className="text-xs text-muted-foreground mt-auto pt-4">
              {formatDate(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function Journal() {
  const { data: articles = [], isLoading } = useBlogArticles("blog", 20);
  const canonicalUrl = `${SITE_URL}/journal`;
  const featuredArticle = articles[0];
  const description = featuredArticle?.excerpt
    ? stripHtml(featuredArticle.excerpt).slice(0, 160)
    : "Artigos sobre ergonomia, produtividade, organizacao e clareza no ambiente de trabalho.";
  const title = "Journal Narvo: ergonomia, foco e setups intencionais";

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={canonicalUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
        </Helmet>
        <section className="py-16 md:py-24 px-6 md:px-10">
          <div className="max-w-[1400px] mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-64 bg-muted rounded-2xl" />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64 bg-muted rounded-2xl" />
                <div className="h-64 bg-muted rounded-2xl" />
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (articles.length === 0) {
    return (
      <>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={canonicalUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
        </Helmet>
        <section className="py-16 md:py-24 px-6 md:px-10">
          <div className="max-w-[1400px] mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">Journal.</h1>
            <p className="text-muted-foreground">Nenhum artigo publicado ainda.</p>
          </div>
        </section>
      </>
    );
  }

  const featured = articles[0];
  const row2 = articles.slice(1, 3);
  const row3 = articles.slice(3, 5);
  const remaining = articles.slice(5);
  const featuredTag = featured.tags?.[0] || "Journal";

  const row3Plus: ShopifyArticle[][] = [];
  for (let i = 0; i < remaining.length; i += 3) {
    row3Plus.push(remaining.slice(i, i + 3));
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        {featured.image && <meta property="og:image" content={featured.image.url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {featured.image && <meta name="twitter:image" content={featured.image.url} />}
      </Helmet>
      <section className="py-16 md:py-24 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
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
          {/* Featured */}
          <Link to={`/journal/${featured.handle}`}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group cursor-pointer"
            >
              <div className="bg-card-elevated rounded-2xl overflow-hidden grid md:grid-cols-2 gap-0">
                {featured.image && (
                  <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img
                      src={featured.image.url}
                      alt={featured.image.altText || featured.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                )}
                <div className="p-7 md:p-10 flex flex-col justify-center">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
                    {featuredTag}
                  </span>
                  <h2 className="text-xl md:text-2xl font-semibold mt-3 mb-3 leading-snug group-hover:opacity-70 transition-opacity">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
                      {featured.excerpt}
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(featured.publishedAt)}
                  </span>
                </div>
              </div>
            </motion.article>
          </Link>

          {row2.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {row2.map((article, i) => (
                <ArticleCard key={article.handle} article={article} index={i + 1} />
              ))}
            </div>
          )}

          {row3.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {row3.map((article, i) => (
                <ArticleCard key={article.handle} article={article} index={i + 3} />
              ))}
            </div>
          )}

          {row3Plus.map((chunk, rowIdx) => (
            <div key={rowIdx} className="grid md:grid-cols-3 gap-6">
              {chunk.map((article, i) => (
                <ArticleCard key={article.handle} article={article} index={i + 5 + rowIdx * 3} />
              ))}
            </div>
          ))}
        </div>
        </div>
      </section>
    </>
  );
}
