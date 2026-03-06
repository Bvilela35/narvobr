import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Truck, Loader2, ArrowLeft, X, ZoomIn, Video, ShieldCheck, Package } from "lucide-react";
import { useProductByHandle, useProducts } from "@/hooks/useShopify";
import { useCartStore } from "@/stores/cartStore";
import { ProductCard } from "@/components/ProductCard";
import { VideoStories } from "@/components/VideoStories";

function formatPrice(amount: string) {
  return `R$ ${parseFloat(amount).toFixed(2).replace(".", ",")}`;
}

function normalizeCep(v: string) {
  return v.replace(/\D/g, "").slice(0, 8);
}

function formatCep(v: string) {
  const digits = normalizeCep(v);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export default function Produto() {
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
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariantIdx(0);
    setCep("");
  }, [handle]);

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

    return () => {
      document.title = "Narvo";
      metaDesc?.setAttribute("content", "");
      canonical?.setAttribute("href", window.location.origin);
      scriptTag?.remove();
    };
  }, [product]);

  const related = allProducts.filter((p) => p.node.handle !== handle).slice(0, 4);

  if (loadingProduct) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin opacity-30" />
      </div>);

  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm opacity-40">Produto não encontrado.</p>
      </div>);

  }

  const { title, description, images, variants, options } = product.node;
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

  const prevImage = () =>
  setSelectedImage((p) => p === 0 ? totalImages - 1 : p - 1);
  const nextImage = () =>
  setSelectedImage((p) => p === totalImages - 1 ? 0 : p + 1);

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
  const installmentValue = (parseFloat(price) / 10).toFixed(2).replace(".", ",");

  return (
    <>
      <section className="pdp">
        <style>{`
          .pdp {
            --pdp-bg: #FFFFFF;
            --pdp-surface: #F3F4F6;
            --pdp-border: #E5E7EB;
            --pdp-border-active: #111827;
            --pdp-text: #111827;
            --pdp-text-secondary: #6B7280;
            --pdp-link: #1A73E8;
            --pdp-btn-disabled-bg: #E5E7EB;
            --pdp-btn-disabled-text: #9CA3AF;
            --pdp-btn-bg: #0f3d2e;
            --pdp-btn-text: #FFFFFF;
            --pdp-radius-gallery: 28px;
            --pdp-radius-buybox: 24px;
            --pdp-radius-color: 14px;
            --pdp-radius-pill: 999px;
            --pdp-font: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          }

          .pdp {
            font-family: var(--pdp-font);
            color: var(--pdp-text);
            background: var(--pdp-bg);
            min-height: 80vh;
          }

          .pdp__container {
            max-width: 1240px;
            margin: 0 auto;
            padding: 32px 24px 80px;
          }

          .pdp__back {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: var(--pdp-text-secondary);
            text-decoration: none;
            margin-bottom: 32px;
            transition: color 0.15s;
          }
          .pdp__back:hover { color: var(--pdp-text); }

          .pdp__grid {
            display: grid;
            grid-template-columns: 1fr 440px;
            gap: 48px;
            align-items: start;
          }

          .pdp__gallery {
            background: var(--pdp-surface);
            border-radius: var(--pdp-radius-gallery);
            padding: 0;
            position: relative;
            aspect-ratio: 1 / 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .pdp__gallery-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .pdp__gallery-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            opacity: 0.2;
            font-size: 13px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .pdp__gallery-nav {
            position: absolute;
            bottom: 20px;
            left: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            background: #fff;
            border-radius: var(--pdp-radius-pill);
            padding: 0 14px;
            height: 44px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          }

          .pdp__gallery-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            color: var(--pdp-text);
            border-radius: 50%;
            transition: background 0.15s;
          }
          .pdp__gallery-btn:hover { background: var(--pdp-surface); }
          .pdp__gallery-btn:focus-visible {
            outline: 2px solid var(--pdp-btn-bg);
            outline-offset: 2px;
          }

          .pdp__gallery-indicator {
            font-size: 14px;
            font-variant-numeric: tabular-nums;
            color: var(--pdp-text-secondary);
            min-width: 36px;
            text-align: center;
            user-select: none;
          }

          .pdp__info { display: flex; flex-direction: column; }

          .pdp__bullets {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
          }

          .pdp__bullet-tag {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.02em;
            color: #0f3d2e;
            background: #e8f5e9;
            border: 1px solid #c8e6c9;
            border-radius: var(--pdp-radius-pill);
            white-space: nowrap;
          }

          .pdp__title {
            font-size: 40px;
            font-weight: 600;
            line-height: 1.15;
            margin: 0 0 24px;
            letter-spacing: -0.02em;
          }

          .pdp__price-row {
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin-bottom: 4px;
          }

          .pdp__price {
            font-size: 18px;
            font-weight: 600;
          }

          .pdp__price-old {
            font-size: 18px;
            font-weight: 400;
            color: var(--pdp-text-secondary);
            text-decoration: line-through;
          }

          .pdp__installment {
            font-size: 13px;
            color: var(--pdp-text-secondary);
            margin-bottom: 0;
          }

          .pdp__divider {
            height: 1px;
            background: var(--pdp-border);
            border: none;
            margin: 24px 0;
          }

          .pdp__description {
            font-size: 14px;
            line-height: 1.6;
            color: var(--pdp-text-secondary);
            margin: 0;
            max-width: 420px;
          }

          .pdp__option-title {
            font-size: 15px;
            font-weight: 600;
            margin: 0 0 16px;
          }
          .pdp__option-title-hint {
            font-weight: 300;
            color: #888;
          }
          .pdp__option-title-accent {
            color: #0f3d2e;
          }

          .pdp__color-swatch {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1.5px solid #e0e0e0;
            flex-shrink: 0;
          }

          .pdp__option-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .pdp__option-item { position: relative; }

          .pdp__option-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }

          .pdp__option-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px 8px 12px;
            border: 1.5px solid var(--pdp-border);
            border-radius: var(--pdp-radius-color);
            background: #fff;
            cursor: pointer;
            transition: border-color 0.15s, box-shadow 0.15s;
            text-align: center;
          }
          .pdp__option-label:hover {
            border-color: #BABDC2;
          }
          .pdp__option-input:checked + .pdp__option-label {
            border-color: var(--pdp-border-active);
            border-width: 2px;
            padding: 15.5px 7.5px 11.5px;
          }
          .pdp__option-input:focus-visible + .pdp__option-label {
            outline: 2px solid var(--pdp-link);
            outline-offset: 2px;
          }
          .pdp__option-input:disabled + .pdp__option-label {
            opacity: 0.3;
            cursor: not-allowed;
            text-decoration: line-through;
          }

          .pdp__option-name {
            font-size: 12px;
            color: var(--pdp-text-secondary);
          }

          /* Quantidade / Volume card style */
          .pdp__qty-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .pdp__qty-item { position: relative; }

          .pdp__qty-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }

          .pdp__qty-label {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 24px;
            border: 2px solid var(--pdp-border);
            border-radius: 16px;
            background: #fff;
            cursor: pointer;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .pdp__qty-label:hover {
            border-color: #BABDC2;
          }
          .pdp__qty-input:checked + .pdp__qty-label {
            border-color: #0f3d2e;
            box-shadow: none;
          }
          .pdp__qty-input:focus-visible + .pdp__qty-label {
            outline: 2px solid var(--pdp-link);
            outline-offset: 2px;
          }
          .pdp__qty-input:disabled + .pdp__qty-label {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .pdp__qty-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--pdp-text);
          }

          .pdp__qty-price {
            font-size: 15px;
            font-weight: 500;
            color: var(--pdp-text);
          }

          .pdp__buybox {
            background: var(--pdp-surface);
            border-radius: var(--pdp-radius-buybox);
            padding: 24px;
            margin-top: 32px;
          }

          .pdp__buybox .pdp__price-row { margin-bottom: 4px; }
          .pdp__buybox .pdp__installment { margin-bottom: 20px; }

          .pdp__add-btn {
            width: 100%;
            height: 48px;
            border: none;
            border-radius: var(--pdp-radius-pill);
            font-size: 15px;
            font-weight: 500;
            font-family: var(--pdp-font);
            cursor: pointer;
            transition: background 0.2s, opacity 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .pdp__add-btn:disabled {
            background: var(--pdp-btn-disabled-bg);
            color: var(--pdp-btn-disabled-text);
            cursor: not-allowed;
          }
          .pdp__add-btn:not(:disabled) {
            background: var(--pdp-btn-bg);
            color: var(--pdp-btn-text);
          }
          .pdp__add-btn:not(:disabled):hover,
          .pdp__add-btn:not(:disabled):active {
            background: #b6e36d;
            color: #0f3d2e;
            opacity: 1;
          }
          .pdp__add-btn:focus-visible {
            outline: 2px solid var(--pdp-link);
            outline-offset: 2px;
          }

          .pdp__shipping {
            margin-top: 20px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .pdp__shipping-icon {
            flex-shrink: 0;
            color: var(--pdp-text-secondary);
            margin-top: 1px;
          }

          .pdp__shipping-text {
            font-size: 13px;
            color: var(--pdp-text-secondary);
            line-height: 1.5;
          }

          .pdp__shipping-link {
            color: var(--pdp-link);
            text-decoration: underline;
            cursor: pointer;
            background: none;
            border: none;
            font: inherit;
            font-size: 13px;
            padding: 0;
          }
          .pdp__shipping-link:hover { opacity: 0.8; }

          .pdp__shipping-result {
            font-size: 13px;
            line-height: 1.5;
          }
          .pdp__shipping-result strong {
            color: #16a34a;
            font-weight: 600;
          }
          .pdp__shipping-result .pdp__shipping-cep-link {
            color: var(--pdp-text-secondary);
            text-decoration: underline;
            cursor: pointer;
            background: none;
            border: none;
            font: inherit;
            font-size: 13px;
            padding: 0;
          }

          /* CEP Modal */
          .pdp__cep-overlay {
            position: fixed;
            inset: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }

          .pdp__cep-modal {
            background: #fff;
            border-radius: 20px;
            padding: 32px;
            width: 90%;
            max-width: 420px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.12);
            position: relative;
          }

          .pdp__cep-modal h3 {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 20px;
          }

          .pdp__cep-modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--pdp-text-secondary);
            padding: 4px;
            border-radius: 50%;
            display: flex;
          }
          .pdp__cep-modal-close:hover { color: var(--pdp-text); }

          .pdp__cep-modal-row {
            display: flex;
            gap: 12px;
            align-items: stretch;
          }

          .pdp__cep-modal-input {
            flex: 1;
            font-family: var(--pdp-font);
            font-size: 15px;
            border: 1.5px solid var(--pdp-border);
            border-radius: 10px;
            padding: 10px 14px;
            outline: none;
            transition: border-color 0.15s;
          }
          .pdp__cep-modal-input:focus {
            border-color: var(--pdp-border-active);
          }

          .pdp__cep-modal-btn {
            font-family: var(--pdp-font);
            font-size: 14px;
            font-weight: 500;
            padding: 10px 20px;
            border: 1.5px solid var(--pdp-border);
            border-radius: 10px;
            background: #fff;
            cursor: pointer;
            color: var(--pdp-text);
            transition: background 0.15s;
          }
          .pdp__cep-modal-btn:hover { background: var(--pdp-surface); }
          .pdp__cep-modal-btn:disabled { opacity: 0.4; cursor: not-allowed; }

          .pdp__unavailable {
            font-size: 13px;
            color: var(--pdp-text-secondary);
            margin-top: 12px;
          }

          @media (max-width: 1024px) {
            .pdp__grid {
              grid-template-columns: 1fr 380px;
              gap: 32px;
            }
            .pdp__title { font-size: 32px; }
          }

          @media (max-width: 768px) {
            .pdp__container { padding: 24px 16px 40px; }
            .pdp__grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            .pdp__gallery { aspect-ratio: 1 / 1; }
            .pdp__title { font-size: 28px; }
            .pdp__option-grid { grid-template-columns: repeat(2, 1fr); }

            .pdp__container { padding: 24px 16px 40px; }
          }

          /* Lightbox / Fullscreen */
          .pdp__lightbox {
            position: fixed;
            inset: 0;
            z-index: 200;
            background: rgba(0,0,0,0.92);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
          }
          .pdp__lightbox--dragging { cursor: grabbing; }

          .pdp__lightbox-close {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 210;
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #fff;
            transition: background 0.15s;
          }
          .pdp__lightbox-close:hover { background: rgba(255,255,255,0.2); }

          .pdp__lightbox-img-wrapper {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .pdp__lightbox-img {
            max-width: 90vw;
            max-height: 90vh;
            object-fit: contain;
            transition: transform 0.2s ease;
            user-select: none;
            -webkit-user-drag: none;
          }

          .pdp__lightbox-nav {
            position: absolute;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 16px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(12px);
            border-radius: 999px;
            padding: 0 18px;
            height: 48px;
          }

          .pdp__lightbox-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            color: #fff;
            border-radius: 50%;
            transition: background 0.15s;
          }
          .pdp__lightbox-btn:hover { background: rgba(255,255,255,0.15); }

          .pdp__lightbox-indicator {
            font-size: 14px;
            font-variant-numeric: tabular-nums;
            color: rgba(255,255,255,0.6);
            min-width: 36px;
            text-align: center;
            user-select: none;
          }

          .pdp__lightbox-zoom {
            position: absolute;
            bottom: 24px;
            right: 24px;
            display: flex;
            gap: 8px;
          }

          .pdp__lightbox-zoom-btn {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(12px);
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #fff;
            font-size: 20px;
            font-weight: 300;
            transition: background 0.15s;
          }
          .pdp__lightbox-zoom-btn:hover { background: rgba(255,255,255,0.2); }

          .pdp__gallery-zoom-hint {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
          }
          .pdp__gallery:hover .pdp__gallery-zoom-hint { opacity: 1; }

          .pdp__trust-bar {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-top: 16px;
          }

          .pdp__trust-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: none;
            border-radius: 16px;
            font-size: 14px;
            font-weight: 500;
            color: var(--pdp-text);
          }
          .pdp__trust-item svg {
            color: #0f3d2e;
            flex-shrink: 0;
          }

          .pdp__trust-bar--mobile {
            display: none;
          }

          @media (max-width: 768px) {
            .pdp__trust-bar { display: none; }
            .pdp__trust-bar--mobile { display: flex; gap: 16px; justify-content: center; margin-top: 16px; }
            .pdp__trust-item { padding: 8px 0; font-size: 13px; gap: 8px; }
          }

          .pdp__stories-btn {
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 5;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 2.5px solid #fff;
            background: #0f3d2e;
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #fff;
            transition: transform 0.2s, background 0.2s;
            box-shadow: 0 2px 12px rgba(0,0,0,0.3);
            animation: stories-pulse 2s ease-in-out infinite;
          }
          .pdp__stories-btn:hover {
            transform: scale(1.1);
            background: #0a2e21;
          }
          @keyframes stories-pulse {
            0%, 100% { box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 2px 16px rgba(182,227,109,0.5), 0 0 0 4px rgba(182,227,109,0.25); }
          }
        `}</style>

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
                
                {imgs[selectedImage] ?
                <AnimatePresence mode="wait">
                    <motion.img
                    key={selectedImage}
                    src={imgs[selectedImage].node.url}
                    alt={imgs[selectedImage].node.altText || `${title} – imagem ${selectedImage + 1}`}
                    className="pdp__gallery-img"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }} />

                  </AnimatePresence> :
                <div className="pdp__gallery-placeholder">Sem imagem</div>
                }
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

              {/* Trust bar */}
              <div className="pdp__trust-bar">
                <div className="pdp__trust-item">
                  <Package size={22} strokeWidth={1.5} />
                  <span className="text-muted-foreground text-sm">Frete Sedex para todo Brasil</span>
                </div>
                <div className="pdp__trust-item">
                  <ShieldCheck size={22} strokeWidth={1.5} />
                  <span className="text-muted-foreground text-sm">Garantia 6 meses</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="pdp__info">
              {bulletPoints.length > 0 && (
                <div className="pdp__bullets">
                  {bulletPoints.map((bp, i) => (
                    <span key={i} className="pdp__bullet-tag">{bp}</span>
                  ))}
                </div>
              )}
              <h1 className="pdp__title">{title}</h1>

              <div className="pdp__price-row">
                <span className="pdp__price">{formatPrice(price)}</span>
              </div>
              <p className="pdp__installment">
                ou R$ {installmentValue}/mês em até 10x sem juros
              </p>

              {description &&
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#444', lineHeight: 1.6, marginTop: '12px' }} className="py-[23px] font-semibold text-lg">
                  {description}
                </p>
              }

              {/* Variant selector */}
              {hasOptions &&
              <>
                  
                  {options.map((option) => {
                  const isColor = option.name.toLowerCase() === 'cor';
                  // Current selected value for this option
                  const currentVal = selectedVariant?.selectedOptions.find(
                    (o) => o.name === option.name
                  )?.value;
                  // Deduplicate: show each unique option value only once
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
                          // Find variant price for this quantity value
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
                          const swatchColor = isColor ? val?.toLowerCase() === 'preto' ? '#1a1a1a' : val?.toLowerCase() === 'branco' ? '#f5f5f5' : val?.toLowerCase() === 'cinza' ? '#9e9e9e' : val?.toLowerCase() === 'prata' ? '#c0c0c0' : val?.toLowerCase() === 'natural' ? '#d4c5a9' : val?.toLowerCase() === 'caramelo' ? '#8B5E3C' : val?.toLowerCase() === 'marrom' ? '#5C3A1E' : val?.toLowerCase() === 'marrom escuro' ? '#3B2314' : val?.toLowerCase() === 'bege' ? '#D4C4A8' : val?.toLowerCase() === 'verde' ? '#0f3d2e' : '#888' : null;
                          const inputId = `opt-${option.name}-${val}`;
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
                                className="pdp__option-input"
                                disabled={!isAvailable} />

                                <label htmlFor={inputId} className="pdp__option-label">
                                  {isColor && swatchColor &&
                                <span className="pdp__color-swatch" style={{ backgroundColor: swatchColor }} />
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

              {/* Trust bar - mobile only (below buybox) */}
              <div className="pdp__trust-bar pdp__trust-bar--mobile">
                <div className="pdp__trust-item">
                  <Package size={22} strokeWidth={1.5} />
                  <span className="text-muted-foreground text-sm">Frete Sedex para todo Brasil</span>
                </div>
                <div className="pdp__trust-item">
                  <ShieldCheck size={22} strokeWidth={1.5} />
                  <span className="text-muted-foreground text-sm">Garantia 6 meses</span>
                </div>
              </div>
            </div>
          </div>
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