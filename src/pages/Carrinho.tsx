import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCartStore } from "@/stores/cartStore";
import { useCepStore } from "@/stores/cepStore";
import { Minus, Plus, Trash2, ExternalLink, Loader2, ArrowLeft, Gift, Check, Truck, ArrowRight, ShieldCheck, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAttribution, trackBeginCheckout } from "@/lib/analytics";
import { formatInstallmentText } from "@/lib/installments";
import { normalizeCep, formatCep, getShippingRegion } from "@/lib/shipping";
import { optimizeShopifyImage } from "@/lib/shopify";

const FREE_SHIPPING_THRESHOLD = 399;
const GIFT_THRESHOLD = 699;
const GIFT_WRAP_PRICE = 9.9;
const WARRANTY_PRICE = 39.9;

export default function Carrinho() {
  const navigate = useNavigate();
  const { items, cartId, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, discountCode, discountedTotal } = useCartStore();
  const globalCep = useCepStore((s) => s.cep);
  const setGlobalCep = useCepStore((s) => s.setCep);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [extendedWarranty, setExtendedWarranty] = useState(false);
  const [showCepInput, setShowCepInput] = useState(false);
  const [cepInput, setCepInput] = useState("");

  const cepResult = globalCep.length === 8 ? getShippingRegion(globalCep) : null;

  function handleCepSubmit() {
    const digits = normalizeCep(cepInput);
    if (digits.length !== 8) return;
    setGlobalCep(digits);
    setShowCepInput(false);
  }

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const finalSubtotal = discountCode && discountedTotal ? parseFloat(discountedTotal) : subtotal;
  const giftExtra = giftWrap ? GIFT_WRAP_PRICE : 0;
  const warrantyExtra = extendedWarranty ? WARRANTY_PRICE : 0;
  const total = finalSubtotal + giftExtra + warrantyExtra;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - finalSubtotal);
  const hasFreeShipping = finalSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingProgress = Math.min(100, (finalSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const giftRemaining = Math.max(0, GIFT_THRESHOLD - finalSubtotal);
  const hasGift = finalSubtotal >= GIFT_THRESHOLD;

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (!checkoutUrl) {
      console.error("[Checkout] checkoutUrl ausente. cartId:", cartId);
      alert("Não foi possível abrir o checkout. Recarregue a página e tente novamente.");
      return;
    }

    // Build & validate final URL BEFORE tracking/redirect
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(checkoutUrl);
    } catch {
      console.error("[Checkout] checkoutUrl inválido:", checkoutUrl);
      alert("URL de checkout inválida. Recarregue a página e tente novamente.");
      return;
    }

    // Guard: must be absolute http(s) — never let SPA router catch it
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      console.error("[Checkout] protocolo inesperado:", parsedUrl.protocol);
      return;
    }

    // CRITICAL: narvo.com.br serve a SPA Lovable. O storefront/checkout do Shopify
    // vive em loja.narvo.com.br. Forçamos o host para evitar que /checkouts/...
    // caia no router da SPA → 404 → /colecao.
    const SHOPIFY_CHECKOUT_HOST = "loja.narvo.com.br";
    if (parsedUrl.hostname !== SHOPIFY_CHECKOUT_HOST) {
      parsedUrl.hostname = SHOPIFY_CHECKOUT_HOST;
      parsedUrl.protocol = "https:";
      parsedUrl.port = "";
    }

    if (discountCode) parsedUrl.searchParams.set("discount", discountCode);

    const attribution = getAttribution();
    if (attribution?.attribution_id) {
      parsedUrl.searchParams.set("narvo_sid", attribution.attribution_id);
      parsedUrl.searchParams.set("_narvo_attribution_id", attribution.attribution_id);
    }

    const lastTouch = attribution?.last_touch;
    if (lastTouch?.utm_source) parsedUrl.searchParams.set("_narvo_utm_source", lastTouch.utm_source);
    if (lastTouch?.utm_medium) parsedUrl.searchParams.set("_narvo_utm_medium", lastTouch.utm_medium);
    if (lastTouch?.utm_campaign) parsedUrl.searchParams.set("_narvo_utm_campaign", lastTouch.utm_campaign);
    if (lastTouch?.utm_content) parsedUrl.searchParams.set("_narvo_utm_content", lastTouch.utm_content);
    if (lastTouch?.utm_term) parsedUrl.searchParams.set("_narvo_utm_term", lastTouch.utm_term);

    const notes: string[] = [];
    if (giftWrap) notes.push(giftMessage ? `🎁 Presente — Mensagem do cartão: "${giftMessage}"` : "🎁 Embalagem para presente");
    if (extendedWarranty) notes.push("🛡️ Garantia estendida");
    if (notes.length > 0) parsedUrl.searchParams.set("note", notes.join(" | "));

    // Sprint 1: dispara begin_checkout no dataLayer → GTM → GA4/Meta/Google Ads
    trackBeginCheckout({
      cartId,
      items: items.map((item) => ({
        productId: item.product.node.id,
        productTitle: item.product.node.title,
        variantTitle: item.variantTitle,
        price: parseFloat(item.price.amount),
        quantity: item.quantity,
      })),
      value: total,
      coupon: discountCode,
    });

    // Use window.location.assign to force a full navigation (bypasses SPA router)
    window.location.assign(parsedUrl.toString());
  };

  const formatPrice = (value: number) =>
    value % 1 === 0
      ? value.toLocaleString("pt-BR")
      : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Carrinho | Narvo</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href="https://narvo.com.br/carrinho" />
        </Helmet>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
          <h1 className="text-3xl font-bold mb-3">Seu carrinho está vazio.</h1>
          <p className="text-muted-foreground mb-8">Explore nossos produtos e encontre o que precisa.</p>
          <Button asChild variant="outline" className="rounded-2xl h-12 px-8">
            <Link to="/colecao">Ver coleções</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Carrinho | Narvo</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://narvo.com.br/carrinho" />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Continuar comprando
      </button>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10">
        Resumo
        <span className="text-lg font-semibold text-muted-foreground ml-2">
          ({items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "itens"})
        </span>
      </h1>

      {/* Status blocks */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        {/* Frete block */}
        <div className="flex-1 border border-border rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#0f3d2e] flex-shrink-0" />
            {hasFreeShipping ? (
              <span className="text-sm font-semibold text-[#b6e36d]">Frete grátis desbloqueado ✓</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Faltam <span className="font-semibold text-foreground">R$ {formatPrice(freeShippingRemaining)}</span> para frete grátis
              </span>
            )}
          </div>
          {!hasFreeShipping && (
            <Link to="/colecao" className="text-xs text-[#0f3d2e] underline">
              Explorar a coleção
            </Link>
          )}
        </div>

        {/* Brinde block */}
        <div className="flex-1 border border-border rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#0f3d2e] flex-shrink-0" />
            {hasGift ? (
              <span className="text-sm font-semibold text-[#b6e36d]">Brinde exclusivo Narvo garantido ✓</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Desbloqueie com mais <span className="font-semibold text-foreground">R$ {formatPrice(giftRemaining)}</span> o brinde exclusivo Narvo
              </span>
            )}
          </div>
          {!hasGift && (
            <Link to="/colecao" className="text-xs text-[#0f3d2e] underline">
              Ver mais vendidos
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.variantId} className="bg-[#F0F0F0] rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-5">
              <Link
                to={`/produto/${item.product.node.handle}`}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-accent rounded-xl overflow-hidden flex-shrink-0"
              >
                {item.product.node.images?.edges?.[0]?.node && (
                  <img
                    src={optimizeShopifyImage(item.product.node.images.edges[0].node.url, 192)}
                    alt={item.product.node.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/produto/${item.product.node.handle}`}
                  className="text-sm sm:text-base font-semibold hover:underline block truncate"
                >
                  {item.product.node.title}
                </Link>
                {item.variantTitle !== "Default Title" && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.variantTitle}</p>
                )}
                <p className="text-base font-bold mt-1">R$ {formatPrice(parseFloat(item.price.amount))}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Add-ons block */}
            <div className="bg-[#F0F0F0] rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Opcionais</h2>

            {/* Gift option */}
            <div className="bg-white rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setGiftWrap(!giftWrap)}>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                    giftWrap ? "bg-foreground border-foreground" : "border-border hover:border-foreground/50"
                  }`}
                >
                  {giftWrap && <Check className="h-3 w-3 text-background" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Embalagem para presente</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inclui cartão especial com sua mensagem · + R$ {formatPrice(GIFT_WRAP_PRICE)}
                  </p>
                </div>
              </div>
              {giftWrap && (
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Escreva a mensagem do cartão..."
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              )}
            </div>

            {/* Extended warranty */}
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExtendedWarranty(!extendedWarranty)}>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                    extendedWarranty ? "bg-foreground border-foreground" : "border-border hover:border-foreground/50"
                  }`}
                >
                  {extendedWarranty && <Check className="h-3 w-3 text-background" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Garantia estendida</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    +12 meses de cobertura total · + R$ {formatPrice(WARRANTY_PRICE)}
                  </p>
                </div>
              </div>
            </div>
            </div>

            {/* Detalhes block */}
            <div className="bg-[#F0F0F0] rounded-2xl p-5 sm:p-6 space-y-6">
              <h2 className="text-xl font-bold">Detalhes</h2>

            {/* Price breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {discountCode && discountedTotal ? (
                    <>
                      <span className="text-muted-foreground line-through mr-2">R$ {formatPrice(subtotal)}</span>
                      R$ {formatPrice(finalSubtotal)}
                    </>
                  ) : (
                    <>R$ {formatPrice(subtotal)}</>
                  )}
                </span>
              </div>

              {discountCode && (
                <div className="flex justify-between">
                  <span className="text-[#b6e36d] font-mono text-xs">{discountCode}</span>
                  <span className="text-[#b6e36d] text-xs font-semibold">Aplicado</span>
                </div>
              )}

              {giftWrap && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Embalagem presente</span>
                  <span className="font-semibold">R$ {formatPrice(GIFT_WRAP_PRICE)}</span>
                </div>
              )}

              {extendedWarranty && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Garantia estendida</span>
                  <span className="font-semibold">R$ {formatPrice(WARRANTY_PRICE)}</span>
                </div>
              )}

              {/* Shipping estimate */}
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Entrega</span>
                <div className="text-right">
                  {cepResult ? (
                    <div>
                      <span className="font-semibold text-[#0f3d2e]">
                        {hasFreeShipping ? "Grátis" : "Calcular no checkout"}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cepResult.type} · Entre {cepResult.dateRange}
                      </p>
                      <button
                        onClick={() => { setCepInput(formatCep(globalCep)); setShowCepInput(true); }}
                        className="text-xs text-[#0f3d2e] underline mt-0.5"
                      >
                        CEP {formatCep(globalCep)}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setCepInput(""); setShowCepInput(true); }}
                      className="text-xs text-[#0f3d2e] underline font-medium"
                    >
                      Calcular frete
                    </button>
                  )}
                </div>
              </div>

              {showCepInput && (
                <div className="flex items-center gap-2 bg-white rounded-xl p-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={formatCep(cepInput)}
                    onChange={(e) => setCepInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCepSubmit()}
                    placeholder="00000-000"
                    inputMode="numeric"
                    maxLength={9}
                    autoFocus
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleCepSubmit}
                    className="text-xs font-semibold text-[#0f3d2e] hover:underline"
                  >
                    OK
                  </button>
                  <button onClick={() => setShowCepInput(false)} className="p-1 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="h-px bg-border" />

              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold">Total</span>
                <div className="text-right">
                  <span className="text-xl font-bold">R$ {formatPrice(total)}</span>
                  {(() => {
                    const txt = formatInstallmentText(total);
                    return txt ? <p className="text-xs text-muted-foreground mt-0.5">ou até {txt} sem juros</p> : null;
                  })()}
                </div>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full h-14 rounded-2xl text-base font-semibold tracking-wide bg-[#0f3d2e] hover:bg-[#0d3326] text-white"
              disabled={items.length === 0 || isLoading || isSyncing}
            >
              {isLoading || isSyncing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Finalizar compra <ExternalLink className="w-4 h-4 ml-2" /></>
              )}
            </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
