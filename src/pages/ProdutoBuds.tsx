import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { toast } from "sonner";

const PRODUCT = {
  name: "Narvo Buds Pro 2",
  price: 799,
  oldPrice: 999,
  installment: "ou R$ 66,58/mês com financiamento de 12 meses*",
  images: [
    { src: "/img/narvo-buds-1.png", alt: "Narvo Buds Pro 2 – vista frontal" },
    { src: "/img/narvo-buds-2.png", alt: "Narvo Buds Pro 2 – vista lateral" },
    { src: "/img/narvo-buds-3.png", alt: "Narvo Buds Pro 2 – vista traseira" },
    { src: "/img/narvo-buds-4.png", alt: "Narvo Buds Pro 2 – estojo" },
  ],
  colors: [
    { id: "grafite", name: "Grafite", hex: "#3B3F46" },
    { id: "porcelana", name: "Porcelana", hex: "#E7E2DA" },
    { id: "peonia", name: "Peônia", hex: "#E58AA1" },
    { id: "avela", name: "Avelã", hex: "#6A5546" },
  ],
};

function formatPrice(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function normalizeCep(v: string) {
  return v.replace(/\D/g, "").slice(0, 8);
}

function formatCep(v: string) {
  const digits = normalizeCep(v);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export default function ProdutoBuds() {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [added, setAdded] = useState(false);

  const cepValid = normalizeCep(cep).length === 8;
  const canBuy = selectedColor !== null && cepValid;

  const prevImage = useCallback(() => {
    setCurrentImage((p) => (p === 0 ? PRODUCT.images.length - 1 : p - 1));
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImage((p) => (p === PRODUCT.images.length - 1 ? 0 : p + 1));
  }, []);

  const handleAdd = () => {
    if (!canBuy) return;
    setAdded(true);
    toast.success("Adicionado ao carrinho", { position: "bottom-center", duration: 3000 });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="pdp-buds">
      <style>{`
        .pdp-buds {
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

        .pdp-buds {
          font-family: var(--pdp-font);
          color: var(--pdp-text);
          background: var(--pdp-bg);
          min-height: 80vh;
        }

        .pdp-buds__container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        .pdp-buds__grid {
          display: grid;
          grid-template-columns: 1fr 440px;
          gap: 48px;
          align-items: start;
        }

        /* ── Gallery ── */
        .pdp-buds__gallery {
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

        .pdp-buds__gallery-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .pdp-buds__gallery-nav {
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

        .pdp-buds__gallery-btn {
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
        .pdp-buds__gallery-btn:hover { background: var(--pdp-surface); }
        .pdp-buds__gallery-btn:focus-visible {
          outline: 2px solid var(--pdp-btn-bg);
          outline-offset: 2px;
        }

        .pdp-buds__gallery-indicator {
          font-size: 14px;
          font-variant-numeric: tabular-nums;
          color: var(--pdp-text-secondary);
          min-width: 36px;
          text-align: center;
          user-select: none;
        }

        /* ── Info panel ── */
        .pdp-buds__info { display: flex; flex-direction: column; }

        .pdp-buds__title {
          font-size: 40px;
          font-weight: 600;
          line-height: 1.15;
          margin: 0 0 24px;
          letter-spacing: -0.02em;
        }

        .pdp-buds__price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 4px;
        }

        .pdp-buds__price {
          font-size: 18px;
          font-weight: 600;
        }

        .pdp-buds__price-old {
          font-size: 18px;
          font-weight: 400;
          color: var(--pdp-text-secondary);
          text-decoration: line-through;
        }

        .pdp-buds__installment {
          font-size: 13px;
          color: var(--pdp-text-secondary);
          margin-bottom: 0;
        }

        .pdp-buds__divider {
          height: 1px;
          background: var(--pdp-border);
          border: none;
          margin: 24px 0;
        }

        /* ── Color selector ── */
        .pdp-buds__color-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 16px;
        }

        .pdp-buds__color-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .pdp-buds__color-option {
          position: relative;
        }

        .pdp-buds__color-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .pdp-buds__color-label {
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
        }
        .pdp-buds__color-label:hover {
          border-color: #BABDC2;
        }
        .pdp-buds__color-input:checked + .pdp-buds__color-label {
          border-color: var(--pdp-border-active);
          border-width: 2px;
          padding: 15.5px 7.5px 11.5px;
        }
        .pdp-buds__color-input:focus-visible + .pdp-buds__color-label {
          outline: 2px solid var(--pdp-link);
          outline-offset: 2px;
        }

        .pdp-buds__color-swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.08);
          flex-shrink: 0;
        }

        .pdp-buds__color-name {
          font-size: 12px;
          color: var(--pdp-text-secondary);
          text-align: center;
        }

        /* ── Buy box ── */
        .pdp-buds__buybox {
          background: var(--pdp-surface);
          border-radius: var(--pdp-radius-buybox);
          padding: 24px;
          margin-top: 32px;
        }

        .pdp-buds__buybox .pdp-buds__price-row { margin-bottom: 4px; }
        .pdp-buds__buybox .pdp-buds__installment { margin-bottom: 20px; }

        .pdp-buds__add-btn {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: var(--pdp-radius-pill);
          font-size: 15px;
          font-weight: 500;
          font-family: var(--pdp-font);
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
        }
        .pdp-buds__add-btn:disabled {
          background: var(--pdp-btn-disabled-bg);
          color: var(--pdp-btn-disabled-text);
          cursor: not-allowed;
        }
        .pdp-buds__add-btn:not(:disabled) {
          background: var(--pdp-btn-bg);
          color: var(--pdp-btn-text);
        }
        .pdp-buds__add-btn:not(:disabled):hover { opacity: 0.88; }
        .pdp-buds__add-btn:focus-visible {
          outline: 2px solid var(--pdp-link);
          outline-offset: 2px;
        }

        .pdp-buds__cep {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pdp-buds__cep-icon {
          flex-shrink: 0;
          color: var(--pdp-text-secondary);
        }

        .pdp-buds__cep-text {
          font-size: 13px;
          color: var(--pdp-text-secondary);
          line-height: 1.4;
        }

        .pdp-buds__cep-input {
          font-family: var(--pdp-font);
          font-size: 13px;
          border: 1px solid var(--pdp-border);
          border-radius: 8px;
          padding: 6px 10px;
          width: 110px;
          outline: none;
          transition: border-color 0.15s;
        }
        .pdp-buds__cep-input:focus {
          border-color: var(--pdp-border-active);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .pdp-buds__grid {
            grid-template-columns: 1fr 380px;
            gap: 32px;
          }
          .pdp-buds__title { font-size: 32px; }
        }

        @media (max-width: 768px) {
          .pdp-buds__container { padding: 24px 16px 120px; }
          .pdp-buds__grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .pdp-buds__gallery { aspect-ratio: 1 / 1; }
          .pdp-buds__title { font-size: 28px; }
          .pdp-buds__color-grid { grid-template-columns: repeat(2, 1fr); }

          .pdp-buds__buybox {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 20px 20px 0 0;
            z-index: 50;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
            padding: 16px 20px;
          }
          .pdp-buds__buybox .pdp-buds__cep { display: none; }
        }
      `}</style>

      <div className="pdp-buds__container">
        <div className="pdp-buds__grid">
          {/* Gallery */}
          <div className="pdp-buds__gallery" role="region" aria-label="Galeria do produto">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={PRODUCT.images[currentImage].src}
                alt={PRODUCT.images[currentImage].alt}
                className="pdp-buds__gallery-img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>

            <div className="pdp-buds__gallery-nav">
              <button
                className="pdp-buds__gallery-btn"
                onClick={prevImage}
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <span className="pdp-buds__gallery-indicator" aria-live="polite">
                {currentImage + 1} / {PRODUCT.images.length}
              </span>
              <button
                className="pdp-buds__gallery-btn"
                onClick={nextImage}
                aria-label="Próxima imagem"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="pdp-buds__info">
            <h1 className="pdp-buds__title">{PRODUCT.name}</h1>

            <div className="pdp-buds__price-row">
              <span className="pdp-buds__price">{formatPrice(PRODUCT.price)}</span>
              <span className="pdp-buds__price-old">{formatPrice(PRODUCT.oldPrice)}</span>
            </div>
            <p className="pdp-buds__installment">{PRODUCT.installment}</p>

            <hr className="pdp-buds__divider" />

            {/* Color selector */}
            <p className="pdp-buds__color-title">Escolha sua cor</p>
            <div className="pdp-buds__color-grid" role="radiogroup" aria-label="Cores disponíveis">
              {PRODUCT.colors.map((color) => (
                <div className="pdp-buds__color-option" key={color.id}>
                  <input
                    type="radio"
                    name="product-color"
                    id={`color-${color.id}`}
                    value={color.id}
                    checked={selectedColor === color.id}
                    onChange={() => setSelectedColor(color.id)}
                    className="pdp-buds__color-input"
                  />
                  <label htmlFor={`color-${color.id}`} className="pdp-buds__color-label">
                    <span
                      className="pdp-buds__color-swatch"
                      style={{ background: color.hex }}
                      aria-hidden="true"
                    />
                    <span className="pdp-buds__color-name">{color.name}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Buy box */}
            <div className="pdp-buds__buybox">
              <div className="pdp-buds__price-row">
                <span className="pdp-buds__price">{formatPrice(PRODUCT.price)}</span>
                <span className="pdp-buds__price-old">{formatPrice(PRODUCT.oldPrice)}</span>
              </div>
              <p className="pdp-buds__installment">{PRODUCT.installment}</p>

              <button
                className="pdp-buds__add-btn"
                disabled={!canBuy || added}
                onClick={handleAdd}
                aria-label="Adicionar ao carrinho"
              >
                {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
              </button>

              <div className="pdp-buds__cep">
                <Package size={20} className="pdp-buds__cep-icon" />
                <div className="pdp-buds__cep-text">
                  <span>Digite seu CEP para calcular entrega</span>
                  <br />
                  <input
                    type="text"
                    className="pdp-buds__cep-input"
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
  );
}
