import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ImageOff } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  title: string;
  body: string;
  reviewer: string;
  created_at: string;
  pictures: Array<{ original: string; compact: string; small: string }>;
}

interface ReviewsData {
  ok: boolean;
  reviews: Review[];
  total_count: number;
  average_rating: number | null;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? "fill-foreground text-foreground" : "fill-muted text-muted"}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const hasImage = review.pictures.length > 0;
  const imageUrl = hasImage ? review.pictures[0].compact || review.pictures[0].original : null;
  const [imgError, setImgError] = useState(false);

  // Vary card heights for masonry effect
  const showBody = review.body.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="break-inside-avoid mb-4"
    >
      <div className="rounded-2xl overflow-hidden bg-card-elevated">
        {/* Image */}
        {imageUrl && !imgError ? (
          <div className="w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={`Avaliação de ${review.reviewer}`}
              className="w-full h-auto object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        ) : hasImage && imgError ? (
          <div className="w-full aspect-square flex items-center justify-center bg-muted/30">
            <ImageOff size={24} className="text-muted-foreground/30" />
          </div>
        ) : null}

        {/* Content */}
        <div className="p-4 space-y-2">
          <Stars rating={review.rating} />
          {review.title && (
            <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {review.title}
            </p>
          )}
          {showBody && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
              {review.body}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground/60 pt-1">
            {review.reviewer}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ReviewsSection({ handle }: { handle?: string }) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [usingStoreFallback, setUsingStoreFallback] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError(false);
      setUsingStoreFallback(false);

      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      async function doFetch(productHandle?: string): Promise<ReviewsData> {
        const params: Record<string, string> = { per_page: "30" };
        if (productHandle) params.handle = productHandle;

        const queryString = new URLSearchParams(params).toString();
        const res = await fetch(
          `${projectUrl}/functions/v1/judgeme-reviews?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${anonKey}`,
              apikey: anonKey,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const result: ReviewsData = await res.json();
        if (!result.ok) throw new Error("Reviews fetch error");
        return result;
      }

      try {
        // Try product-specific reviews first
        if (handle) {
          const result = await doFetch(handle);
          if (result.reviews.length > 0) {
            setData(result);
            return;
          }
        }

        // Fallback: fetch all store reviews
        const fallback = await doFetch();
        setUsingStoreFallback(true);
        setData(fallback);
      } catch (err) {
        console.error("[ReviewsSection] error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [handle]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="pdp__content-section-title">Avaliações</h2>
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data || data.reviews.length === 0) {
    return (
      <div>
        <h2 className="pdp__content-section-title">Avaliações</h2>
        <p className="pdp__content-section-placeholder">
          {error ? "Não foi possível carregar as avaliações." : "Ainda não há avaliações para este produto."}
        </p>
      </div>
    );
  }

  const { reviews, total_count, average_rating } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="pdp__content-section-title" style={{ marginBottom: 8 }}>
            Avaliações
          </h2>
          <div className="flex items-center gap-3">
            {average_rating && (
              <>
                <span className="text-3xl font-semibold text-foreground">
                  {average_rating.toFixed(1)}
                </span>
                <div className="space-y-0.5">
                  <Stars rating={Math.round(average_rating)} size={16} />
                  <p className="text-xs text-muted-foreground">
                    {total_count} avaliação{total_count !== 1 ? "ões" : ""}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {reviews.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} />
        ))}
      </div>
    </div>
  );
}
