import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Package, Loader2, ArrowLeft } from "lucide-react";
import { useProductByHandle, useProducts } from "@/hooks/useShopify";
import { useCartStore } from "@/stores/cartStore";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";

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
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading: loadingProduct } = useProductByHandle(handle);
  const { data: allProducts = [] } = useProducts(4);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cep, setCep] = useState("");
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariantIdx(0);
    setCep("");
  }, [handle]);

  const related = allProducts.filter((p) => p.node.handle !== handle).slice(0, 4);

  if (loadingProduct) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin opacity-30" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm opacity-40">Produto não encontrado.</p>
      </div>
    );
  }

  const { title, description, images, variants, options } = product.node;
  const imgs = images.edges;
  const totalImages = imgs.length;
  const selectedVariant = variants.edges[selectedVariantIdx]?.node;
  const hasOptions = options.length > 0 && options[0].name !== "Title";

  const cepValid = normalizeCep(cep).length === 8;
  const canBuy =
    selectedVariant?.availableForSale &&
    cepValid &&
    (!hasOptions || selectedVariantIdx >= 0);

  const prevImage = () =>
    setSelectedImage((p) => (p === 0 ? totalImages - 1 : p - 1));
  const nextImage = () =>
    setSelectedImage((p) => (p === totalImages - 1 ? 0 : p + 1));

  const handleAdd = async () => {
    if (!canBuy || !selectedVariant) return;
    setAdded(true);
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Adicionado ao carrinho", {
      position: "top-center",
      duration: 3000,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  const price = selectedVariant?.price.amount || "0";
  const compareAtPrice = product.node.priceRange?.minVariantPrice?.amount;
  const installmentValue = (parseFloat(price) / 12).toFixed(2).replace(".", ",");

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
            --pdp-btn-bg: #111827;
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
            padding: 28px;
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
            object-fit: contain;
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
          .pdp__add-btn:not(:disabled):hover { opacity: 0.88; }
          .pdp__add-btn:focus-visible {
            outline: 2px solid var(--pdp-link);
            outline-offset: 2px;
          }

          .pdp__cep {
            margin-top: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .pdp__cep-icon {
            flex-shrink: 0;
            color: var(--pdp-text-secondary);
          }

          .pdp__cep-text {
            font-size: 13px;
            color: var(--pdp-text-secondary);
            line-height: 1.4;
          }

          .pdp__cep-input {
            font-family: var(--pdp-font);
            font-size: 13px;
            border: 1px solid var(--pdp-border);
            border-radius: 8px;
            padding: 6px 10px;
            width: 110px;
            outline: none;
            transition: border-color 0.15s;
            margin-top: 4px;
          }
          .pdp__cep-input:focus {
            border-color: var(--pdp-border-active);
          }

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
            .pdp__container { padding: 24px 16px 120px; }
            .pdp__grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            .pdp__gallery { aspect-ratio: 1 / 1; }
            .pdp__title { font-size: 28px; }
            .pdp__option-grid { grid-template-columns: repeat(2, 1fr); }

            .pdp__buybox {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              border-radius: 20px 20px 0 0;
              z-index: 50;
              box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
              padding: 16px 20px;
            }
            .pdp__buybox .pdp__cep { display: none; }
          }
        `}</style>

        <div className="pdp__container">
          <Link to="/colecao" className="pdp__back">
            <ArrowLeft size={16} /> Voltar
          </Link>

          <div className="pdp__grid">
            {/* Gallery */}
            <div className="pdp__gallery" role="region" aria-label="Galeria do produto">
              {imgs[selectedImage] ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={imgs[selectedImage].node.url}
                    alt={imgs[selectedImage].node.altText || `${title} – imagem ${selectedImage + 1}`}
                    className="pdp__gallery-img"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>
              ) : (
                <div className="pdp__gallery-placeholder">Sem imagem</div>
              )}

              {totalImages > 1 && (
                <div className="pdp__gallery-nav">
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
              )}
            </div>

            {/* Info */}
            <div className="pdp__info">
              <h1 className="pdp__title">{title}</h1>

              <div className="pdp__price-row">
                <span className="pdp__price">{formatPrice(price)}</span>
              </div>
              <p className="pdp__installment">
                ou R$ {installmentValue}/mês em até 12x*
              </p>

              {description && (
                <>
                  <hr className="pdp__divider" />
                  <p className="pdp__description">{description}</p>
                </>
              )}

              {/* Variant selector */}
              {hasOptions && (
                <>
                  <hr className="pdp__divider" />
                  {options.map((option) => (
                    <div key={option.name} style={{ marginBottom: 24 }}>
                      <p className="pdp__option-title">{option.name}</p>
                      <div className="pdp__option-grid" role="radiogroup" aria-label={option.name}>
                        {variants.edges.map((v, i) => {
                          const optVal = v.node.selectedOptions.find(
                            (o) => o.name === option.name
                          )?.value;
                          const isSelected = i === selectedVariantIdx;
                          return (
                            <div className="pdp__option-item" key={v.node.id}>
                              <input
                                type="radio"
                                name={`option-${option.name}`}
                                id={`opt-${v.node.id}`}
                                value={i}
                                checked={isSelected}
                                onChange={() => setSelectedVariantIdx(i)}
                                className="pdp__option-input"
                                disabled={!v.node.availableForSale}
                              />
                              <label htmlFor={`opt-${v.node.id}`} className="pdp__option-label">
                                <span className="pdp__option-name">{optVal}</span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Buy box */}
              <div className="pdp__buybox">
                <div className="pdp__price-row">
                  <span className="pdp__price">{formatPrice(price)}</span>
                </div>
                <p className="pdp__installment">
                  ou R$ {installmentValue}/mês em até 12x*
                </p>

                <button
                  className="pdp__add-btn"
                  disabled={!canBuy || added || isCartLoading}
                  onClick={handleAdd}
                  aria-label="Adicionar ao carrinho"
                >
                  {isCartLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : added ? (
                    "Adicionado ✓"
                  ) : (
                    "Adicionar ao carrinho"
                  )}
                </button>

                {!selectedVariant?.availableForSale && (
                  <p className="pdp__unavailable">Esgotado</p>
                )}

                <div className="pdp__cep">
                  <Package size={20} className="pdp__cep-icon" />
                  <div className="pdp__cep-text">
                    <span>Digite seu CEP para calcular entrega</span>
                    <br />
                    <input
                      type="text"
                      className="pdp__cep-input"
                      placeholder="00000-000"
                      value={formatCep(cep)}
                      onChange={(e) => setCep(e.target.value)}
                      inputMode="numeric"
                      maxLength={9}
                      aria-label="CEP para entrega"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section style={{ padding: "80px 24px", borderTop: "1px solid #E5E7EB" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <h2 style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.4, marginBottom: 48 }}>
              Compatível com
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
