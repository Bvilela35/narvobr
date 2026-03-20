import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Truck, Loader2, ArrowLeft, X, ZoomIn, Video, ShieldCheck, Package, Plus, RefreshCw, Star, Sparkles, MapPin } from "lucide-react";
import { useProductByHandle, useProducts } from "@/hooks/useShopify";
import { useCartStore } from "@/stores/cartStore";
import { ProductCard } from "@/components/ProductCard";
import { VideoStories } from "@/components/VideoStories";
import { BulletPointsRotator } from "@/components/BulletPointsRotator";
import { MobileBulletOverlay } from "@/components/MobileBulletOverlay";
import { calcInstallments, formatInstallmentText } from "@/lib/installments";
import ProductHighlights from "@/components/ProductHighlights";
import "./Produto.css";

// Lazy load below-fold components
const ReviewsSection = lazy(() => import("@/components/ReviewsSection").then(m => ({ default: m.ReviewsSection })));

function formatPrice(amount: string) {
  const value = parseFloat(amount);
  return value % 1 === 0
    ? `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Shopify CDN image optimizer — request appropriately sized images
function optimizeShopifyImage(url: string | undefined, width = 800): string {
  if (!url) return '';
  if (url.includes('cdn.shopify.com')) {
    // Shopify Storefront API supports ?width=X query param
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}`;
  }
  return url;
}

// Parse Shopify rich text JSON into plain text
function parseRichText(value: string): string {
  try {
    const parsed = JSON.parse(value);
    if (parsed?.type === 'root' && Array.isArray(parsed.children)) {
      return parsed.children.
      map((node: any) => {
        if (node.type === 'paragraph' && Array.isArray(node.children)) {
          return node.children.map((child: any) => child.value || '').join('');
        }
        if (node.type === 'list' && Array.isArray(node.children)) {
          return node.children.
          map((li: any) => li.children?.map((p: any) => p.children?.map((t: any) => t.value || '').join('')).join('')).
          join('\n');
        }
        return '';
      }).
      filter(Boolean).
      join('\n');
    }
  } catch {/* not JSON, return as-is */}
  return value;
}

function normalizeCep(v: string) {
  return v.replace(/\D/g, "").slice(0, 8);
}

function formatCep(v: string) {
  const digits = normalizeCep(v);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

const TRUST_ITEMS = [
{ icon: Truck, text: "Chega rápido. Em todo Brasil." },
{ icon: ShieldCheck, text: "Garantia de 6 meses." },
{ icon: RefreshCw, text: "Troca ou devolução grátis." },
{ icon: Star, text: "Qualidade premium." },
{ icon: Sparkles, text: "Design exclusivo." },
{ icon: MapPin, text: "Produzido no Brasil." }];


function TrustBarRotator({ mobile }: {mobile?: boolean;}) {
  const [idx, setIdx] = useState(0);
  const len = TRUST_ITEMS.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 2) % len);
    }, 15000);
    return () => clearInterval(timer);
  }, [len]);

  const first = TRUST_ITEMS[idx % len];
  const second = TRUST_ITEMS[(idx + 1) % len];

  return (
    <div className={`pdp__trust-bar${mobile ? ' pdp__trust-bar--mobile' : ''}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="pdp__trust-pair"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
          
          <div className="pdp__trust-item">
            <first.icon size={22} strokeWidth={1.5} />
            <span className="text-muted-foreground text-sm">{first.text}</span>
          </div>
          <div className="pdp__trust-item">
            <second.icon size={22} strokeWidth={1.5} />
            <span className="text-muted-foreground text-sm">{second.text}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>);

}

function FaqItem({ item, isLast, index }: {item: {pergunta: string;resposta?: string;};isLast: boolean;index: number;}) {
  const [open, setOpen] = useState(false);
  const questionId = `faq-question-${index}`;
  const answerId = `faq-answer-${index}`;
  return (
    <div className={`pdp__faq-item${open ? ' pdp__faq-item--open' : ''}`} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
      <h3 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
        <button
          className="pdp__faq-question"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={answerId}
          id={questionId}>
          
          <span itemProp="name">{item.pergunta}</span>
          <svg className={`pdp__faq-chevron${open ? ' pdp__faq-chevron--open' : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h3>
      {item.resposta &&
      <div
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        itemScope
        itemProp="acceptedAnswer"
        itemType="https://schema.org/Answer">
        
          <AnimatePresence initial={false}>
            {open &&
          <motion.div
            className="pdp__faq-answer-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
            
                <p className="pdp__faq-answer" itemProp="text">{item.resposta}</p>
              </motion.div>
          }
          </AnimatePresence>
        </div>
      }
      {!isLast && <div className="pdp__faq-divider" />}
    </div>);

}

// Skeleton loader that matches the PDP layout exactly to prevent CLS
function PdpSkeleton() {
  return (
    <div className="pdp__skeleton">
      <div className="pdp__skeleton-container">
        {/* Back button placeholder */}
        <div className="pdp__skeleton-line" style={{ width: 28, height: 28, marginBottom: 32, borderRadius: '50%' }} />
        <div className="pdp__skeleton-grid">
          {/* Gallery skeleton */}
          <div className="pdp__skeleton-gallery" />
          {/* Info column skeleton */}
          <div className="pdp__skeleton-info">
            {/* Bullet tags */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="pdp__skeleton-line" style={{ width: 80, height: 28 }} />
              <div className="pdp__skeleton-line" style={{ width: 100, height: 28 }} />
              <div className="pdp__skeleton-line" style={{ width: 70, height: 28 }} />
            </div>
            {/* Title */}
            <div className="pdp__skeleton-line" style={{ width: '80%', height: 46 }} />
            {/* Price */}
            <div className="pdp__skeleton-line" style={{ width: 120, height: 24 }} />
            {/* Installment */}
            <div className="pdp__skeleton-line" style={{ width: 200, height: 20 }} />
            {/* Description */}
            <div className="pdp__skeleton-line" style={{ width: '100%', height: 44, marginTop: 12 }} />
            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
              <div className="pdp__skeleton-line" style={{ height: 80 }} />
              <div className="pdp__skeleton-line" style={{ height: 80 }} />
              <div className="pdp__skeleton-line" style={{ height: 80 }} />
            </div>
            {/* Buybox */}
            <div className="pdp__skeleton-line" style={{ width: '100%', height: 200, borderRadius: 24, marginTop: 32 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Produto() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { handle } = useParams<{handle: string;}>();
  const { data: product, isLoading: loadingProduct } = useProductByHandle(handle);
  const { data: allProducts = [] } = useProducts(4);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cep, setCep] = useState("");
  const [cepResult, setCepResult] = useState<{type: string;dateRange: string;} | null>(null);
  const [showCepModal, setShowCepModal] = useState(false);
  const [cepInput, setCepInput] = useState("");
  const [added, setAdded] = useState(false);
  const [activeSection, setActiveSection] = useState("secao-descricao");
  const sectionNavRef = useRef<HTMLElement>(null);
  const descricaoMediaRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });
  const touchPanStart = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const swipeStartX = useRef(0);
  const isSwiping = useRef(false);
  // Track if this is user-initiated image change (for animation)
  const userChangedImage = useRef(false);
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariantIdx(0);
    setCep("");
    userChangedImage.current = false;
  }, [handle]);

  // Preload LCP image as soon as product data arrives
  useEffect(() => {
    if (!product) return;
    const firstImgUrl = product.node.images.edges[0]?.node.url;
    if (!firstImgUrl) return;
    const optimizedUrl = optimizeShopifyImage(firstImgUrl, 800);
    
    // Inject preload link for LCP
    const existing = document.querySelector('link[data-pdp-preload]');
    if (existing) existing.remove();
    
    const link = document.createElement('link');
    link.setAttribute('rel', 'preload');
    link.setAttribute('as', 'image');
    link.setAttribute('href', optimizedUrl);
    link.setAttribute('data-pdp-preload', 'true');
    // @ts-ignore — fetchpriority is valid HTML but not in TS types
    link.fetchPriority = 'high';
    document.head.appendChild(link);
    
    return () => { link.remove(); };
  }, [product]);

  // IntersectionObserver for active section tracking
  const SECTION_IDS = ["secao-descricao", "secao-especificacoes", "secao-detalhes", "secao-faq", "secao-avaliacoes"];
  const [isNavSticky, setIsNavSticky] = useState(false);

  useEffect(() => {
    const navEl = sectionNavRef.current;
    if (!navEl) return;

    const stickyObserver = new IntersectionObserver(
      ([entry]) => setIsNavSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );

    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    sentinel.style.pointerEvents = "none";
    sentinel.setAttribute("data-nav-sentinel", "true");
    navEl.parentElement?.insertBefore(sentinel, navEl);
    stickyObserver.observe(sentinel);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.05, rootMargin: "-45% 0px -45% 0px" }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    return () => {
      stickyObserver.disconnect();
      sectionObserver.disconnect();
      sentinel.remove();
    };
  }, [product]);

  // Auto-scroll nav to center active button on mobile
  useEffect(() => {
    const navInner = sectionNavRef.current?.querySelector('.pdp__section-nav-inner') as HTMLElement | null;
    if (!navInner) return;
    const activeBtn = navInner.querySelector('.pdp__section-nav-btn--active') as HTMLElement | null;
    if (!activeBtn) return;
    const scrollLeft = activeBtn.offsetLeft - navInner.clientWidth / 2 + activeBtn.clientWidth / 2;
    navInner.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [activeSection]);

  // Parallax effect for description media
  useEffect(() => {
    const mediaEl = descricaoMediaRef.current;
    if (!mediaEl) return;
    const child = mediaEl.querySelector('img, video') as HTMLElement | null;
    if (!child) return;

    const onScroll = () => {
      const rect = mediaEl.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = 1 - rect.bottom / (windowH + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      const translateY = clampedProgress * -30;
      child.style.transform = `translateY(${translateY}%)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [product]);

  // Open cart drawer when navigated back with openCart state
  useEffect(() => {
    if (location.state?.openCart) {
      window.dispatchEvent(new Event("narvo:open-cart"));
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  // SEO: inherit meta title, description and canonical from Shopify
  useEffect(() => {
    if (!product) return;
    const { title, description, seo, handle: productHandle } = product.node;
    const seoTitle = seo?.title || title;
    document.title = seoTitle;

    const seoDesc = seo?.description || description || "";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", seoDesc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/produto/${productHandle}`);

    // JSON-LD Product structured data
    const { images, variants, priceRange } = product.node;
    const image = images.edges[0]?.node?.url;
    const price = priceRange.minVariantPrice.amount;
    const currency = priceRange.minVariantPrice.currencyCode || "BRL";
    const available = variants.edges.some((v) => v.node.availableForSale);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: seoTitle,
      description: seoDesc,
      image: image || undefined,
      url: `${window.location.origin}/produto/${productHandle}`,
      brand: { "@type": "Brand", name: "Narvo" },
      offers: {
        "@type": "Offer",
        price,
        priceCurrency: currency,
        availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: `${window.location.origin}/produto/${productHandle}`
      }
    };

    let scriptTag = document.querySelector('script[data-narvo-jsonld]') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.setAttribute("data-narvo-jsonld", "true");
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);

    // FAQPage JSON-LD
    const faqItems = product.node.faq || [];
    const validFaqItems = faqItems.filter((item: {pergunta: string;resposta?: string;}) => item.pergunta && item.resposta);
    let faqScriptTag = document.querySelector('script[data-narvo-faq-jsonld]') as HTMLScriptElement | null;
    if (validFaqItems.length > 0) {
      const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: validFaqItems.map((item: {pergunta: string;resposta?: string;}) => ({
          "@type": "Question",
          name: item.pergunta,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.resposta
          }
        }))
      };
      if (!faqScriptTag) {
        faqScriptTag = document.createElement("script");
        faqScriptTag.setAttribute("type", "application/ld+json");
        faqScriptTag.setAttribute("data-narvo-faq-jsonld", "true");
        document.head.appendChild(faqScriptTag);
      }
      faqScriptTag.textContent = JSON.stringify(faqJsonLd);
    } else {
      faqScriptTag?.remove();
    }

    return () => {
      document.title = "Narvo";
      metaDesc?.setAttribute("content", "");
      canonical?.setAttribute("href", window.location.origin);
      scriptTag?.remove();
      document.querySelector('script[data-narvo-faq-jsonld]')?.remove();
    };
  }, [product]);

  const related = allProducts.filter((p) => p.node.handle !== handle).slice(0, 4);

  // Show skeleton loader instead of spinner — matches final layout to prevent CLS
  if (loadingProduct) {
    return <PdpSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm opacity-40">Produto não encontrado.</p>
      </div>);
  }

  const { title, description, images, variants, options, tituloDescricao, descricaoCompleta, fotoDescricao, specMateriais, specTamanho, specOQueAcompanha, specDetalhes, specFoto, faq } = product.node;
  const bulletPoints = product.node.bulletPoints || [];
  const videoStories = product.node.videoStories || [];
  const hasStories = videoStories.length > 0;
  const imgs = images.edges;
  const totalImages = imgs.length;
  const selectedVariant = variants.edges[selectedVariantIdx]?.node;
  const hasOptions = options.length > 0 && options[0].name !== "Title";

  const canBuy =
  selectedVariant?.availableForSale && (
  !hasOptions || selectedVariantIdx >= 0);

  function formatDateRange(minDays: number, maxDays: number) {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() + minDays);
    const to = new Date(now);
    to.setDate(to.getDate() + maxDays);
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    const sameMonth = from.getMonth() === to.getMonth();
    if (sameMonth) {
      return `${from.getDate()}–${to.getDate()} de ${months[from.getMonth()]}`;
    }
    return `${from.getDate()} de ${months[from.getMonth()]} – ${to.getDate()} de ${months[to.getMonth()]}`;
  }

  function getShippingRegion(cepValue: string) {
    const prefix = parseInt(cepValue.substring(0, 2), 10);
    if (prefix >= 1 && prefix <= 39) return { type: "Envio Rápido", dateRange: formatDateRange(2, 5) };
    if (prefix >= 70 && prefix <= 76 || prefix >= 78 && prefix <= 79) return { type: "Envio Rápido", dateRange: formatDateRange(2, 5) };
    if (prefix >= 80 && prefix <= 99) return { type: "Envio Rápido", dateRange: formatDateRange(2, 5) };
    return { type: "Envio Normal", dateRange: formatDateRange(4, 12) };
  }

  function handleCepSubmit() {
    const digits = normalizeCep(cepInput);
    if (digits.length !== 8) return;
    setCep(digits);
    setCepResult(getShippingRegion(digits));
    setShowCepModal(false);
  }

  const prevImage = () => {
    userChangedImage.current = true;
    setSelectedImage((p) => p === 0 ? totalImages - 1 : p - 1);
  };
  const nextImage = () => {
    userChangedImage.current = true;
    setSelectedImage((p) => p === totalImages - 1 ? 0 : p + 1);
  };

  const handleAdd = async () => {
    if (!canBuy || !selectedVariant) return;
    setAdded(true);
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || []
    });
    navigate(`/produto/${handle}/adicionado`);
  };

  const price = selectedVariant?.price.amount || "0";
  const compareAtPrice = product.node.priceRange?.minVariantPrice?.amount;
  const inst = parseFloat(price) / 10;
  const installmentValue = inst % 1 === 0
    ? inst.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : inst.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Get optimized image URL for mobile (800px) and desktop (1200px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const galleryImageWidth = isMobile ? 800 : 1200;

  return (
    <>
      <section className="pdp">
        <div className="pdp__container">
          <Link to="/colecao" className="pdp__back">
            <ArrowLeft size={28} color="#000" />
          </Link>

          <div className="pdp__grid">
            {/* Left column: Gallery + Trust bar */}
            <div>
              <div
                className="pdp__gallery"
                role="region"
                aria-label="Galeria do produto"
                onClick={() => {setLightboxOpen(true);setZoomLevel(1);setPanPos({ x: 0, y: 0 });}}
                style={{ cursor: 'zoom-in' }}>
                
                {imgs[selectedImage] ? (
                  userChangedImage.current ? (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImage}
                        src={optimizeShopifyImage(imgs[selectedImage].node.url, galleryImageWidth)}
                        alt={imgs[selectedImage].node.altText || `${title} – imagem ${selectedImage + 1}`}
                        className="pdp__gallery-img"
                        width={1000}
                        height={1000}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    </AnimatePresence>
                  ) : (
                    <img
                      src={optimizeShopifyImage(imgs[selectedImage].node.url, galleryImageWidth)}
                      alt={imgs[selectedImage].node.altText || `${title} – imagem ${selectedImage + 1}`}
                      className="pdp__gallery-img"
                      width={1000}
                      height={1000}
                      loading="eager"
                      fetchPriority="high"
                    />
                  )
                ) : (
                  <div className="pdp__gallery-placeholder">Sem imagem</div>
                )}
                <div className="pdp__gallery-zoom-hint">
                  <ZoomIn size={18} />
                </div>

                {hasStories &&
                <button
                  className="pdp__stories-btn"
                  onClick={(e) => {e.stopPropagation();setStoriesOpen(true);}}
                  aria-label="Ver vídeos">
                  
                    <Video size={20} />
                  </button>
                }

                {totalImages > 1 &&
                <div className="pdp__gallery-nav" onClick={(e) => e.stopPropagation()}>
                    <button className="pdp__gallery-btn" onClick={prevImage} aria-label="Imagem anterior">
                      <ChevronLeft size={18} strokeWidth={2} />
                    </button>
                    <span className="pdp__gallery-indicator" aria-live="polite">
                      {selectedImage + 1} / {totalImages}
                    </span>
                    <button className="pdp__gallery-btn" onClick={nextImage} aria-label="Próxima imagem">
                      <ChevronRight size={18} strokeWidth={2} />
                    </button>
                  </div>
                }
              </div>
              {/* Mobile bullet points below gallery */}
              <MobileBulletOverlay bulletPoints={bulletPoints} />

              {/* Trust bar */}
              <TrustBarRotator />
            </div>

            {/* Info */}
            <div className="pdp__info">
              <BulletPointsRotator bulletPoints={bulletPoints} title={title} />

              <div className="pdp__price-row">
                <span className="pdp__price">{formatPrice(price)}</span>
              </div>
              <p className="pdp__installment">
                ou R$ {installmentValue}/mês em até 10x sem juros
              </p>

              {description &&
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#444', lineHeight: 1.6, marginTop: '12px', minHeight: '44px' }} className="py-[23px] font-semibold text-lg">
                  {description}
                </p>
              }

              {/* Variant selector */}
              {hasOptions &&
              <>
                  
                  {options.map((option) => {
                  const isColor = option.name.toLowerCase() === 'cor';
                  const currentVal = selectedVariant?.selectedOptions.find(
                    (o) => o.name === option.name
                  )?.value;
                  const uniqueValues = option.values;
                  return (
                    <div key={option.name} id={`option-group-${option.name}`} style={{ marginBottom: 24 }}>
                        <p className="pdp__option-title">
                          {isColor ?
                        <>
                                {option.name}. <span className="pdp__option-title-hint">Escolha sua <span className="pdp__option-title-accent">favorita</span>.</span>
                            </> :
                        option.name.toLowerCase() === 'quantidade' ?
                        <>
                                Volume. <span className="pdp__option-title-hint">Qual é o melhor <span className="pdp__option-title-accent">para você</span>?</span>
                            </> :
                        option.name}
                        </p>
                        {option.name.toLowerCase() === 'quantidade' ?
                      <div className="pdp__qty-list" role="radiogroup" aria-label={option.name}>
                            {uniqueValues.map((val) => {
                          const isSelected = currentVal === val;
                          const isAvailable = variants.edges.some((v) => {
                            const matchesThisOption = v.node.selectedOptions.some(
                              (o) => o.name === option.name && o.value === val
                            );
                            return matchesThisOption && v.node.availableForSale;
                          });
                          const matchingVariant = variants.edges.find((v) =>
                          v.node.selectedOptions.some(
                            (o) => o.name === option.name && o.value === val
                          )
                          );
                          const variantPrice = matchingVariant?.node.price.amount;
                          const inputId = `opt-${option.name}-${val}`;
                          return (
                            <div className="pdp__qty-item" key={val}>
                                  <input
                                type="radio"
                                name={`option-${option.name}`}
                                id={inputId}
                                value={val}
                                checked={isSelected}
                                onChange={() => {
                                  const currentOptions = selectedVariant?.selectedOptions || [];
                                  const newIdx = variants.edges.findIndex((v) => {
                                    return v.node.selectedOptions.every((so) => {
                                      if (so.name === option.name) return so.value === val;
                                      const kept = currentOptions.find((co) => co.name === so.name);
                                      return kept ? kept.value === so.value : true;
                                    });
                                  });
                                  if (newIdx >= 0) setSelectedVariantIdx(newIdx);
                                  setTimeout(() => {
                                    const currentOptionEl = document.getElementById(`option-group-${option.name}`);
                                    if (currentOptionEl) {
                                      const nextSibling = currentOptionEl.nextElementSibling as HTMLElement;
                                      if (nextSibling) {
                                        nextSibling.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      } else {
                                        const buybox = document.getElementById('pdp-buybox');
                                        buybox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }
                                  }, 100);
                                }}
                                className="pdp__qty-input"
                                disabled={!isAvailable} />
                              
                                  <label htmlFor={inputId} className="pdp__qty-label">
                                    <span className="pdp__qty-name">{val}</span>
                                    {variantPrice &&
                                <span className="pdp__qty-price">{formatPrice(variantPrice)}</span>
                                }
                                  </label>
                                </div>);

                        })}
                          </div> :

                      <div className="pdp__option-grid" role="radiogroup" aria-label={option.name}>
                          {uniqueValues.map((val) => {
                          const isSelected = currentVal === val;
                          const isAvailable = variants.edges.some((v) => {
                            const matchesThisOption = v.node.selectedOptions.some(
                              (o) => o.name === option.name && o.value === val
                            );
                            return matchesThisOption && v.node.availableForSale;
                          });
                          const inputId = `opt-${option.name}-${val}`;

                          const COLOR_MAP: Record<string, string> = {
                            preto: '#1a1a1a',
                            'preto fosco': '#1a1a1a',
                            branco: '#f5f5f5',
                            cinza: '#9e9e9e',
                            'cinza claro': '#c0c0c0',
                            prata: '#c0c0c0',
                            natural: '#d4c5a9',
                            caramelo: '#8B5E3C',
                            marrom: '#5C3A1E',
                            'marrom escuro': '#3B2314',
                            bege: '#D4C4A8',
                            verde: '#0f3d2e',
                          };
                          const colorHex = isColor ? COLOR_MAP[val.toLowerCase().trim()] || null : null;

                          return (
                            <div className="pdp__option-item" key={val}>
                                  <input
                                type="radio"
                                name={`option-${option.name}`}
                                id={inputId}
                                value={val}
                                checked={isSelected}
                                onChange={() => {
                                  const currentOptions = selectedVariant?.selectedOptions || [];
                                  const newIdx = variants.edges.findIndex((v) => {
                                    return v.node.selectedOptions.every((so) => {
                                      if (so.name === option.name) return so.value === val;
                                      const kept = currentOptions.find((co) => co.name === so.name);
                                      return kept ? kept.value === so.value : true;
                                    });
                                  });
                                  if (newIdx >= 0) {
                                    setSelectedVariantIdx(newIdx);
                                    // Sync gallery image with variant image when color changes
                                    if (isColor) {
                                      const variantImgUrl = variants.edges[newIdx]?.node.image?.url;
                                      if (variantImgUrl) {
                                        const matchIdx = imgs.findIndex((img) => img.node.url === variantImgUrl);
                                        if (matchIdx >= 0) {
                                          userChangedImage.current = true;
                                          setSelectedImage(matchIdx);
                                        }
                                      }
                                    }
                                  }
                                  setTimeout(() => {
                                    const currentOptionEl = document.getElementById(`option-group-${option.name}`);
                                    if (currentOptionEl) {
                                      const nextSibling = currentOptionEl.nextElementSibling as HTMLElement;
                                      if (nextSibling) {
                                        nextSibling.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      } else {
                                        const buybox = document.getElementById('pdp-buybox');
                                        buybox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }
                                  }, 100);
                                }}
                                className="pdp__option-input"
                                disabled={!isAvailable} />
                              
                                  <label htmlFor={inputId} className="pdp__option-label">
                                    {isColor && colorHex &&
                                <span className="pdp__color-swatch" style={{ backgroundColor: colorHex }} />
                                }
                                  <span className="pdp__option-name">{val}</span>
                                </label>
                              </div>);

                        })}
                        </div>
                      }
                      </div>);

                })}
                </>
              }

              {/* Buy box */}
              <div className="pdp__buybox" id="pdp-buybox">
                <div className="pdp__price-row">
                  <span className="pdp__price">{formatPrice(price)}</span>
                </div>
                <p className="pdp__installment">
                  ou R$ {installmentValue}/mês em até 10x sem juros
                </p>

                <button
                  className="pdp__add-btn"
                  disabled={!canBuy || added || isCartLoading}
                  onClick={handleAdd}
                  aria-label="Adicionar ao carrinho">

                  {isCartLoading ?
                  <Loader2 size={18} className="animate-spin" /> :
                  added ?
                  "Adicionado ✓" :

                  "Adicionar ao carrinho"
                  }
                </button>

                {!selectedVariant?.availableForSale &&
                <p className="pdp__unavailable">Esgotado</p>
                }

                <div className="pdp__shipping">
                  <Truck size={20} className="pdp__shipping-icon" />
                  {cepResult ?
                  <div className="pdp__shipping-result">
                      <strong>Frete Grátis</strong> · {cepResult.type}: Entre {cepResult.dateRange} para{" "}
                      <button className="pdp__shipping-cep-link" onClick={() => {setCepInput(formatCep(cep));setShowCepModal(true);}}>
                        {formatCep(cep)}
                      </button>
                    </div> :

                  <div className="pdp__shipping-text">
                      Digite seu CEP{" "}
                      <button className="pdp__shipping-link" onClick={() => {setCepInput("");setShowCepModal(true);}}>
                        aqui
                      </button>{" "}
                      para saber quando seu pedido chega
                    </div>
                  }
                </div>

              </div>

              {/* Contact & Share box */}
              <div className="pdp__contact-box">
                <p className="pdp__contact-title">Ficou com alguma dúvida?</p>
                <a
                  href={`https://wa.me/5531993940473?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdp__contact-btn">
                  
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                  Falar com a loja
                </a>
                <div className="pdp__share-row">
                  <button
                    className="pdp__share-link"
                    onClick={() => {
                      const url = `${window.location.origin}/produto/${handle}`;
                      const text = `Narvo - ${title} — ${url}`;
                      if (navigator.share) {
                        navigator.share({ title: `Narvo - ${title}`, text, url });
                      } else {
                        window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(text)}`, '_blank');
                      }
                    }}>
                    
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                    Compartilhar
                  </button>
                  <button
                    className={`pdp__share-link${copied ? ' pdp__share-link--copied' : ''}`}
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/produto/${handle}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}>
                    
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    {copied ? 'Link Copiado!' : 'Copiar Link'}
                  </button>
                </div>
              </div>

              {/* Trust bar - mobile only (below buybox) */}
              <TrustBarRotator mobile />
            </div>
          </div>
        </div>
      </section>

      {/* Section Navigation Menu */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: 0 }} />
      </div>
      <nav ref={sectionNavRef} className={`pdp__section-nav pdp__section-nav--sticky`}>
        <div className="pdp__section-nav-inner">
          {[
          { id: "secao-descricao", label: "Descrição" },
          { id: "secao-especificacoes", label: "Especificações" },
          { id: "secao-detalhes", label: "Detalhes" },
          { id: "secao-faq", label: "FAQ" },
          { id: "secao-avaliacoes", label: "Avaliações" }].
          map((item) =>
          <button
            key={item.id}
            className={`pdp__section-nav-btn${activeSection === item.id ? ' pdp__section-nav-btn--active' : ''}`}
            onClick={() => {
              const el = document.getElementById(item.id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>
            
              {item.label}
            </button>
          )}
        </div>
      </nav>

      {/* Seção: Descrição */}
      <section id="secao-descricao" className="pdp__content-section">
        <div className="pdp__content-section-inner">
          <div className="pdp__descricao-grid">
            <div>
              <h2 className="pdp__descricao-title">
                {tituloDescricao || "Descrição"}
              </h2>
              <p className="pdp__descricao-text">
                {descricaoCompleta || description || "Descrição do produto em breve."}
              </p>
            </div>
            <div ref={descricaoMediaRef} className="pdp__descricao-media">
              {fotoDescricao?.type === 'video' ?
              <video
                src={fotoDescricao.sources[0]?.url}
                poster={fotoDescricao.previewImage || undefined}
                autoPlay
                muted
                loop
                playsInline /> :

              fotoDescricao?.type === 'image' ?
              <img
                src={fotoDescricao.url}
                alt={fotoDescricao.altText || tituloDescricao || title}
                width={1240}
                height={698}
                loading="lazy" /> :


              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pdp-text-secondary)', fontSize: 14 }}>
                  Mídia em breve
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Especificações */}
      <section id="secao-especificacoes" className="pdp__content-section">
        <div className="pdp__content-section-inner">
          {(() => {
            const specItems = [
            { label: "Materiais", value: specMateriais },
            { label: "Tamanho", value: specTamanho },
            { label: "O que acompanha", value: specOQueAcompanha },
            { label: "Detalhes", value: specDetalhes }].
            filter((item) => !!item.value);

            if (specItems.length === 0 && !specFoto) return (
              <div>
                <h2 className="pdp__specs-title">Especificações</h2>
                <p className="pdp__content-section-placeholder">Especificações técnicas em breve.</p>
              </div>);


            const hasImage = !!specFoto;

            return (
              <div className={`pdp__specs-layout${hasImage ? '' : ' pdp__specs-layout--full'}`}>
                <div className="pdp__specs-sheet">
                  <h2 className="pdp__specs-title">Especificações</h2>
                  <div className="pdp__specs-list">
                    {specItems.map((item, i) =>
                    <div key={item.label} className="pdp__specs-item">
                        <span className="pdp__specs-label">{item.label}</span>
                        <span className="pdp__specs-value">{parseRichText(item.value!)}</span>
                        {i < specItems.length - 1 && <div className="pdp__specs-divider" />}
                      </div>
                    )}
                  </div>
                </div>
                {hasImage &&
                <div className="pdp__specs-image-col">
                    <img
                    src={specFoto!.url}
                    alt={specFoto!.altText || `${title} — Especificações`}
                    className="pdp__specs-image"
                    width={600}
                    height={600}
                    loading="lazy" />
                  
                  </div>
                }
              </div>);

          })()}
        </div>
      </section>

      {/* Seção: Detalhes */}
      <section id="secao-detalhes" className="pdp__content-section">
        <div className="pdp__content-section-inner">
          <h2 className="pdp__content-section-title">Detalhes</h2>
          {product.node.highlights && product.node.highlights.length > 0 ? (
            <ProductHighlights highlights={product.node.highlights} />
          ) : (
            <p className="pdp__content-section-placeholder">Detalhes do produto em breve.</p>
          )}
        </div>
      </section>

      {/* Seção: FAQ */}
      {faq && faq.length > 0 &&
      <section id="secao-faq" className="pdp__content-section" itemScope itemType="https://schema.org/FAQPage">
          <div className="pdp__content-section-inner">
            <div className="pdp__faq-layout">
              <div className="pdp__faq-header">
                <h2 className="pdp__faq-title">Perguntas<br />frequentes.</h2>
              </div>
              <div className="pdp__faq-list">
                {faq.map((item, i) =>
              <FaqItem key={i} item={item} index={i} isLast={i === faq.length - 1} />
              )}
              </div>
            </div>
          </div>
        </section>
      }
      {(!faq || faq.length === 0) &&
      <section id="secao-faq" className="pdp__content-section">
          <div className="pdp__content-section-inner">
            <h2 className="pdp__content-section-title">FAQ</h2>
            <p className="pdp__content-section-placeholder">Perguntas frequentes em breve.</p>
          </div>
        </section>
      }

      {/* Seção: Avaliações — lazy loaded */}
      <section id="secao-avaliacoes" className="pdp__content-section">
        <div className="pdp__content-section-inner">
          <Suspense fallback={
            <div className="space-y-3">
              <h2 className="pdp__content-section-title">Avaliações</h2>
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
              </div>
            </div>
          }>
            <ReviewsSection handle={handle} />
          </Suspense>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 &&
      <section style={{ padding: "80px 24px", borderTop: "1px solid #E5E7EB" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <h2 style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.4, marginBottom: 48 }}>
              Compatível com
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) =>
            <ProductCard key={p.node.id} product={p} />
            )}
            </div>
          </div>
        </section>
      }

      {/* CEP Modal */}
      {showCepModal &&
      <div className="pdp__cep-overlay" onClick={() => setShowCepModal(false)}>
          <div className="pdp__cep-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pdp__cep-modal-close" onClick={() => setShowCepModal(false)} aria-label="Fechar">
              <X size={20} />
            </button>
            <h3>Digite seu CEP</h3>
            <div className="pdp__cep-modal-row">
              <input
              type="text"
              className="pdp__cep-modal-input"
              placeholder="00000-000"
              value={formatCep(cepInput)}
              onChange={(e) => setCepInput(e.target.value)}
              inputMode="numeric"
              maxLength={9}
              aria-label="CEP"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCepSubmit()} />

              <button
              className="pdp__cep-modal-btn"
              onClick={handleCepSubmit}
              disabled={normalizeCep(cepInput).length !== 8}>

                Atualizar
              </button>
            </div>
          </div>
        </div>
      }


      {/* Fullscreen Lightbox */}
      {lightboxOpen && imgs[selectedImage] &&
      <div
        className={`pdp__lightbox${isDragging.current ? ' pdp__lightbox--dragging' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setLightboxOpen(false);
          }
        }}
        onWheel={(e) => {
          e.preventDefault();
          setZoomLevel((prev) => {
            const next = prev + (e.deltaY > 0 ? -0.25 : 0.25);
            const clamped = Math.min(Math.max(next, 1), 5);
            if (clamped === 1) setPanPos({ x: 0, y: 0 });
            return clamped;
          });
        }}>
        
          <button
          className="pdp__lightbox-close"
          onClick={() => setLightboxOpen(false)}
          aria-label="Fechar">
          
            <X size={20} />
          </button>

          <div
          className="pdp__lightbox-img-wrapper"
          onMouseDown={(e) => {
            if (zoomLevel <= 1) return;
            isDragging.current = true;
            dragStart.current = { x: e.clientX, y: e.clientY };
            panStart.current = { ...panPos };
          }}
          onMouseMove={(e) => {
            if (!isDragging.current) return;
            setPanPos({
              x: panStart.current.x + (e.clientX - dragStart.current.x),
              y: panStart.current.y + (e.clientY - dragStart.current.y)
            });
          }}
          onMouseUp={() => {isDragging.current = false;}}
          onMouseLeave={() => {isDragging.current = false;}}
          onTouchStart={(e) => {
            if (e.touches.length === 2) {
              e.preventDefault();
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              lastTouchDist.current = Math.hypot(dx, dy);
              zoomRef.current = zoomLevel;
              isSwiping.current = false;
            } else if (e.touches.length === 1) {
              if (zoomLevel > 1) {
                isDragging.current = true;
                lastTouchCenter.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                touchPanStart.current = { ...panPos };
                isSwiping.current = false;
              } else {
                isSwiping.current = true;
                swipeStartX.current = e.touches[0].clientX;
              }
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 2) {
              e.preventDefault();
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              const dist = Math.hypot(dx, dy);
              if (lastTouchDist.current > 0) {
                const scale = dist / lastTouchDist.current;
                const newZoom = Math.min(Math.max(zoomRef.current * scale, 1), 5);
                setZoomLevel(newZoom);
                if (newZoom === 1) setPanPos({ x: 0, y: 0 });
              }
            } else if (e.touches.length === 1 && isDragging.current) {
              setPanPos({
                x: touchPanStart.current.x + (e.touches[0].clientX - lastTouchCenter.current.x),
                y: touchPanStart.current.y + (e.touches[0].clientY - lastTouchCenter.current.y)
              });
            }
          }}
          onTouchEnd={(e) => {
            if (e.touches.length < 2) {
              lastTouchDist.current = 0;
              zoomRef.current = zoomLevel;
            }
            if (e.touches.length === 0) {
              if (isSwiping.current && e.changedTouches.length === 1 && totalImages > 1) {
                const deltaX = e.changedTouches[0].clientX - swipeStartX.current;
                if (Math.abs(deltaX) > 50) {
                  if (deltaX < 0) {nextImage();} else {prevImage();}
                  setZoomLevel(1);
                  setPanPos({ x: 0, y: 0 });
                }
              }
              isDragging.current = false;
              isSwiping.current = false;
            }
          }}
          style={{ touchAction: 'none' }}>
          
            <img
            src={imgs[selectedImage].node.url}
            alt={imgs[selectedImage].node.altText || title}
            className="pdp__lightbox-img"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${panPos.y / zoomLevel}px)`
            }}
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              if (zoomLevel < 3) {
                setZoomLevel((prev) => prev + 1);
              } else {
                setZoomLevel(1);
                setPanPos({ x: 0, y: 0 });
              }
            }} />
          
          </div>

          {totalImages > 1 &&
        <div className="pdp__lightbox-nav">
              <button
            className="pdp__lightbox-btn"
            onClick={(e) => {e.stopPropagation();prevImage();setZoomLevel(1);setPanPos({ x: 0, y: 0 });}}
            aria-label="Imagem anterior">
            
                <ChevronLeft size={18} />
              </button>
              <span className="pdp__lightbox-indicator">
                {selectedImage + 1} / {totalImages}
              </span>
              <button
            className="pdp__lightbox-btn"
            onClick={(e) => {e.stopPropagation();nextImage();setZoomLevel(1);setPanPos({ x: 0, y: 0 });}}
            aria-label="Próxima imagem">
            
                <ChevronRight size={18} />
              </button>
            </div>
        }

          <div className="pdp__lightbox-zoom">
            <button
            className="pdp__lightbox-zoom-btn"
            onClick={(e) => {e.stopPropagation();setZoomLevel((z) => Math.max(z - 0.5, 1));if (zoomLevel <= 1.5) setPanPos({ x: 0, y: 0 });}}
            aria-label="Diminuir zoom">
            
              −
            </button>
            <button
            className="pdp__lightbox-zoom-btn"
            onClick={(e) => {e.stopPropagation();setZoomLevel((z) => Math.min(z + 0.5, 5));}}
            aria-label="Aumentar zoom">
            
              +
            </button>
          </div>
        </div>
      }

      {/* Video Stories */}
      <VideoStories videos={videoStories} open={storiesOpen} onClose={() => setStoriesOpen(false)} />
    </>);

}
