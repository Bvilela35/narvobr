import { useParams, Link, Navigate } from "react-router-dom";

import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { useBlogArticle, useBlogArticles } from "@/hooks/useBlog";
import { Helmet } from "react-helmet-async";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

export default function Artigo() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError } = useBlogArticle(slug);
  const { data: allArticles = [] } = useBlogArticles("blog", 20);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-10 w-3/4 bg-muted rounded mx-auto" />
          <div className="h-4 w-40 bg-muted rounded mx-auto" />
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!article || isError) {
    return <Navigate to="/journal" replace />;
  }

  const tag = article.tags?.[0] || "Journal";
  const readTime = estimateReadTime(article.contentHtml);
  const authorName = article.authorV2?.name || "Narvo";
  const plainExcerpt = article.excerpt || article.contentHtml.replace(/<[^>]*>/g, "").slice(0, 155);
  const seoTitle = article.seo?.title || `${article.title} — Narvo Journal`;
  const seoDescription = article.seo?.description || plainExcerpt;
  const canonicalUrl = `https://narvobr.lovable.app/journal/${article.handle}`;

  // Related articles (exclude current)
  const related = allArticles
    .filter((a) => a.handle !== article.handle)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: seoDescription,
    image: article.image?.url,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Narvo",
      url: "https://narvobr.lovable.app",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <article className="pb-24 md:pb-32">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {article.image && <meta property="og:image" content={article.image.url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {article.image && <meta name="twitter:image" content={article.image.url} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="max-w-3xl mx-auto px-6 pt-12 md:pt-20">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Journal
          </Link>
        </motion.div>

        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="flex justify-center mb-5"
        >
          <span className="text-[11px] tracking-[0.25em] uppercase font-medium text-muted-foreground border border-border rounded-full px-4 py-1.5">
            {tag}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-2xl md:text-4xl lg:text-[2.75rem] font-semibold leading-[1.15] text-center mb-6"
        >
          {article.title}
        </motion.h1>

        {/* Date & Read time */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8"
        >
          <span>{formatDate(article.publishedAt)}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readTime} de leitura
          </span>
        </motion.div>

        {/* Author */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3">
            <span className="text-sm font-semibold text-foreground">
              {authorName.charAt(0)}
            </span>
          </div>
          <span className="text-sm font-medium">{authorName}</span>
          <span className="text-xs text-muted-foreground">
            Engenharia do Silêncio
          </span>
        </motion.div>
      </div>

      {/* Hero image */}
      {article.image && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="max-w-5xl mx-auto px-6 mb-14 md:mb-20"
        >
          <div className="rounded-2xl overflow-hidden aspect-[21/9]">
            <img
              src={article.image.url}
              alt={article.image.altText || article.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </motion.div>
      )}

      {/* Article body */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="max-w-[680px] mx-auto px-6"
      >
        <div
          className="article-body"
          style={{ minHeight: '200px' }}
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </motion.div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 mt-20 md:mt-28 border-t border-border pt-14">
          <h2 className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-8">
            Continue lendo
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {related.map((rel) => (
              <Link
                key={rel.handle}
                to={`/journal/${rel.handle}`}
                className="group"
              >
                <div className="bg-card-elevated rounded-2xl overflow-hidden h-full flex flex-col">
                  {rel.image && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={rel.image.url}
                        alt={rel.image.altText || rel.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
                      {rel.tags?.[0] || "Journal"}
                    </span>
                    <h3 className="text-base font-semibold mt-2 mb-2 leading-snug group-hover:opacity-70 transition-opacity">
                      {rel.title}
                    </h3>
                    <span className="text-xs text-muted-foreground mt-auto pt-4">
                      {formatDate(rel.publishedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
