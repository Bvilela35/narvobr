import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeBanner, optimizeShopifyImage } from "@/lib/shopify";
import { useHomeBanners } from "@/hooks/useShopify";

const HOME_BANNERS_CACHE_KEY = "narvo-home-banners-v1";
const INTERNAL_HOSTS = new Set(["narvo.com.br", "www.narvo.com.br", "narvobr.lovable.app"]);

const FALLBACK_BANNER: HomeBanner = {
  id: "fallback-home-banner",
  title: "Seu setup.\nSem concessoes.",
  ctaLabel: "Conheca a colecao",
  link: "/colecao",
  media: {
    type: "image",
    url: "/optimized/home/hero-banner-960.jpg",
    altText: "Setup minimalista com acessorios Narvo",
    width: 960,
    height: 540,
    mimeType: "image/jpeg",
  },
};

function normalizeBannerTitle(title: string) {
  return title.split(/\n+/).filter(Boolean);
}

function resolveBannerImageUrl(url: string) {
  if (url.includes("cdn.shopify.com")) {
    return optimizeShopifyImage(url, 1600);
  }

  return url;
}

function getBannerImageSet(url: string) {
  if (url.includes("cdn.shopify.com")) {
    return {
      src: optimizeShopifyImage(url, 1280),
      srcSet: `${optimizeShopifyImage(url, 768)} 768w, ${optimizeShopifyImage(url, 1280)} 1280w, ${optimizeShopifyImage(url, 1600)} 1600w`,
      sizes: "(max-width: 768px) 100vw, 94vw",
    };
  }

  if (url.includes("hero-banner-")) {
    return {
      src: "/optimized/home/hero-banner-960.jpg",
      srcSet: "/optimized/home/hero-banner-960.jpg 960w, /optimized/home/hero-banner-1600.jpg 1600w",
      sizes: "(max-width: 768px) 100vw, 94vw",
    };
  }

  return {
    src: url,
    srcSet: undefined,
    sizes: undefined,
  };
}

function isExternalLink(link: string) {
  return /^https?:\/\//i.test(link);
}

function readCachedBanners(): HomeBanner[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(HOME_BANNERS_CACHE_KEY);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedBanners(banners: HomeBanner[]) {
  if (typeof window === "undefined" || banners.length === 0) return;

  try {
    window.localStorage.setItem(HOME_BANNERS_CACHE_KEY, JSON.stringify(banners));
  } catch {
    // Ignore storage failures.
  }
}

function resolveBannerLink(link: string) {
  if (!isExternalLink(link)) {
    return { type: "internal" as const, href: link };
  }

  try {
    const parsedUrl = new URL(link);
    if (INTERNAL_HOSTS.has(parsedUrl.hostname)) {
      return {
        type: "internal" as const,
        href: `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}` || "/",
      };
    }
  } catch {
    return { type: "external" as const, href: link };
  }

  return { type: "external" as const, href: link };
}

export function HeroBanner() {
  const { data: remoteBanners = [] } = useHomeBanners();
  const [cachedBanners, setCachedBanners] = useState<HomeBanner[]>(() => readCachedBanners());
  const banners = remoteBanners.length > 0
    ? remoteBanners
    : cachedBanners.length > 0
      ? cachedBanners
      : [FALLBACK_BANNER];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (remoteBanners.length === 0) return;
    setCachedBanners(remoteBanners);
    writeCachedBanners(remoteBanners);
  }, [remoteBanners]);

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, banners.length - 1));
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % banners.length);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [banners.length]);

  const activeBanner = banners[currentIndex] ?? FALLBACK_BANNER;
  const titleLines = useMemo(() => normalizeBannerTitle(activeBanner.title), [activeBanner.title]);
  const bannerLink = useMemo(() => resolveBannerLink(activeBanner.link), [activeBanner.link]);

  const activeImage = activeBanner.media.type === "image"
    ? getBannerImageSet(activeBanner.media.url)
    : null;
  const nextBanner = banners.length > 1 ? banners[(currentIndex + 1) % banners.length] : null;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToRelativeSlide = (direction: -1 | 1) => {
    setCurrentIndex((index) => {
      const next = index + direction;
      if (next < 0) return banners.length - 1;
      if (next >= banners.length) return 0;
      return next;
    });
  };

  return (
    <section className="relative min-h-[150vw] md:min-h-[85vh] flex items-end overflow-hidden mx-3 md:mx-6 mt-3 md:mt-4 rounded-2xl bg-black">
      {activeBanner.media.type === "video" ? (
        <video
          key={activeBanner.id}
          className="absolute inset-0 w-full h-full object-cover"
          src={resolveBannerImageUrl(activeBanner.media.url)}
          poster={activeBanner.media.posterUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          key={activeBanner.id}
          src={activeImage?.src}
          srcSet={activeImage?.srcSet}
          sizes={activeImage?.sizes}
          alt={activeBanner.media.altText || activeBanner.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          width={activeBanner.media.width || 1600}
          height={activeBanner.media.height || 900}
          decoding="async"
        />
      )}

      <Helmet>
        {activeBanner.media.type === "image" && activeImage && (
          <link
            rel="preload"
            as="image"
            href={activeImage.src}
            imageSrcSet={activeImage.srcSet}
            imageSizes={activeImage.sizes}
            fetchPriority="high"
          />
        )}
        {nextBanner?.media.type === "image" && (
          <link
            rel="prefetch"
            as="image"
            href={getBannerImageSet(nextBanner.media.url).src}
          />
        )}
      </Helmet>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute inset-0 z-10 px-6 md:px-10 flex items-center justify-center">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white max-w-3xl">
            {titleLines.map((line, index) => (
              <span key={`${activeBanner.id}-${index}`} className="block">
                {line}
              </span>
            ))}
          </h1>

          <div className="mt-8">
            <Button asChild className="h-12 px-10 rounded-full text-sm font-medium tracking-wide bg-white text-black hover:bg-black hover:text-white transition-colors duration-500 ease-in-out border border-transparent hover:border-white/30">
              {bannerLink.type === "external" ? (
                <a href={bannerLink.href} rel="noreferrer">
                  {activeBanner.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <Link to={bannerLink.href}>
                  {activeBanner.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
            </Button>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goToRelativeSlide(-1)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 h-11 w-11 rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/45"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="mx-auto h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => goToRelativeSlide(1)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 h-11 w-11 rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/45"
            aria-label="Proximo banner"
          >
            <ChevronRight className="mx-auto h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all ${index === currentIndex ? "w-8 bg-white" : "w-2.5 bg-white/45"}`}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
