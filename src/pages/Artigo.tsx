import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { articles, formatDate } from "@/data/articles";

export default function Artigo() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return <Navigate to="/journal" replace />;
  }

  // Get related articles (exclude current)
  const related = articles.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <article className="pb-24 md:pb-32">
      {/* Header */}
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
            {article.tag}
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
          <span>{formatDate(article.date)}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime} de leitura
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
              {article.author.name.charAt(0)}
            </span>
          </div>
          <span className="text-sm font-medium">{article.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {article.author.role}
          </span>
        </motion.div>
      </div>

      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="max-w-5xl mx-auto px-6 mb-14 md:mb-20"
      >
        <div className="rounded-2xl overflow-hidden aspect-[21/9]">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </motion.div>

      {/* Article body */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="max-w-[680px] mx-auto px-6"
      >
        <div className="prose prose-lg dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:md:text-2xl prose-h3:text-lg prose-h3:md:text-xl prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-strong:font-medium prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 max-w-none">
          {article.content.split("\n\n").map((block, i) => {
            if (block.startsWith("### ")) {
              return (
                <h3 key={i}>{block.replace("### ", "")}</h3>
              );
            }
            if (block.startsWith("## ")) {
              return (
                <h2 key={i}>{block.replace("## ", "")}</h2>
              );
            }
            if (block.startsWith("1. ") || block.startsWith("- ")) {
              const isOrdered = block.startsWith("1. ");
              const items = block.split("\n").map((line) =>
                line.replace(/^(\d+\.\s|\-\s)/, "")
              );
              const Tag = isOrdered ? "ol" : "ul";
              return (
                <Tag key={i}>
                  {items.map((item, j) => {
                    const parts = item.split(/(\*\*[^*]+\*\*)/);
                    return (
                      <li key={j}>
                        {parts.map((part, k) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={k}>{part.slice(2, -2)}</strong>;
                          }
                          return <span key={k}>{part}</span>;
                        })}
                      </li>
                    );
                  })}
                </Tag>
              );
            }
            // Paragraph with bold support
            const parts = block.split(/(\*\*[^*]+\*\*)/);
            return (
              <p key={i}>
                {parts.map((part, k) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={k}>{part.slice(2, -2)}</strong>;
                  }
                  return <span key={k}>{part}</span>;
                })}
              </p>
            );
          })}
        </div>
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
                key={rel.slug}
                to={`/journal/${rel.slug}`}
                className="group"
              >
                <div className="bg-card-elevated rounded-2xl overflow-hidden h-full flex flex-col">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
                      {rel.tag}
                    </span>
                    <h3 className="text-base font-semibold mt-2 mb-2 leading-snug group-hover:opacity-70 transition-opacity">
                      {rel.title}
                    </h3>
                    <span className="text-xs text-muted-foreground mt-auto pt-4">
                      {formatDate(rel.date)}
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
