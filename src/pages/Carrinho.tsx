import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { Minus, Plus, Trash2, ExternalLink, Loader2, ArrowLeft, Gift, Check, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FREE_SHIPPING_THRESHOLD = 399;
const GIFT_THRESHOLD = 699;
const GIFT_WRAP_PRICE = 9.9;

export default function Carrinho() {
  const navigate = useNavigate();
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, discountCode, discountedTotal } = useCartStore();
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const finalSubtotal = discountCode && discountedTotal ? parseFloat(discountedTotal) : subtotal;
  const giftExtra = giftWrap ? GIFT_WRAP_PRICE : 0;
  const total = finalSubtotal + giftExtra;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - finalSubtotal);
  const hasFreeShipping = finalSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingProgress = Math.min(100, (finalSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const giftRemaining = Math.max(0, GIFT_THRESHOLD - finalSubtotal);
  const hasGift = finalSubtotal >= GIFT_THRESHOLD;

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      let finalUrl = checkoutUrl;
      if (discountCode) {
        try {
          const url = new URL(finalUrl);
          url.searchParams.set("discount", discountCode);
          finalUrl = url.toString();
        } catch { /* keep original */ }
      }
      if (giftWrap && giftMessage) {
        try {
          const url = new URL(finalUrl);
          url.searchParams.set("note", `🎁 Presente — Mensagem do cartão: "${giftMessage}"`);
          finalUrl = url.toString();
        } catch { /* keep original */ }
      } else if (giftWrap) {
        try {
          const url = new URL(finalUrl);
          url.searchParams.set("note", "🎁 Embalagem para presente");
          finalUrl = url.toString();
        } catch { /* keep original */ }
      }
      window.open(finalUrl, "_blank");
    }
  };

  const formatPrice = (value: number) =>
    value % 1 === 0
      ? value.toLocaleString("pt-BR")
      : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-bold mb-3">Seu carrinho está vazio.</h1>
        <p className="text-muted-foreground mb-8">Explore nossos produtos e encontre o que precisa.</p>
        <Button asChild variant="outline" className="rounded-2xl h-12 px-8">
          <Link to="/colecao">Ver coleções</Link>
        </Button>
      </div>
    );
  }

  return (
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
        Carrinho
        <span className="text-lg font-semibold text-muted-foreground ml-2">
          ({items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "itens"})
        </span>
      </h1>

      {/* Status blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {/* Frete block */}
        <div className="bg-accent/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Frete</span>
          </div>
          {hasFreeShipping ? (
            <p className="text-sm font-semibold text-[#b6e36d]">Frete grátis desbloqueado ✓</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Faltam <span className="font-semibold text-foreground">R$ {formatPrice(freeShippingRemaining)}</span> para frete grátis
            </p>
          )}
          <div className="h-1 w-full bg-background rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${shippingProgress}%`,
                backgroundColor: hasFreeShipping ? "#b6e36d" : "hsl(var(--foreground))",
              }}
            />
          </div>
        </div>

        {/* Brinde block */}
        <div className="bg-accent/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Brinde exclusivo</span>
          </div>
          {hasGift ? (
            <p className="text-sm font-semibold text-[#b6e36d]">Presente exclusivo garantido ✓</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Faltam <span className="font-semibold text-foreground">R$ {formatPrice(giftRemaining)}</span> para ganhar um brinde exclusivo
              </p>
              <Link
                to="/colecao"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline"
              >
                Ver mais vendidos <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
        {/* Items */}
        <div className="flex-1 space-y-6">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-5 pb-6 border-b border-border last:border-0">
              <Link
                to={`/produto/${item.product.node.handle}`}
                className="w-24 h-24 sm:w-28 sm:h-28 bg-accent rounded-2xl overflow-hidden flex-shrink-0"
              >
                {item.product.node.images?.edges?.[0]?.node && (
                  <img
                    src={item.product.node.images.edges[0].node.url}
                    alt={item.product.node.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/produto/${item.product.node.handle}`}
                  className="text-base sm:text-lg font-semibold hover:underline block truncate"
                >
                  {item.product.node.title}
                </Link>
                {item.variantTitle !== "Default Title" && (
                  <p className="text-sm text-muted-foreground mt-0.5">{item.variantTitle}</p>
                )}
                <p className="text-lg font-bold mt-2">R$ {formatPrice(parseFloat(item.price.amount))}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
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
          <div className="lg:sticky lg:top-24 space-y-6">
            <h2 className="text-xl font-bold">Resumo do pedido</h2>

            {/* Free shipping bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                {hasFreeShipping ? (
                  <span className="text-sm font-semibold text-[#b6e36d]">Frete grátis! 🎉</span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Faltam <span className="font-semibold text-foreground">R$ {formatPrice(freeShippingRemaining)}</span> para frete grátis
                  </span>
                )}
              </div>
              <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${shippingProgress}%`,
                    backgroundColor: hasFreeShipping ? "#b6e36d" : "hsl(var(--foreground))",
                  }}
                />
              </div>
            </div>

            {/* Gift option */}
            <div className="border border-border rounded-2xl p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setGiftWrap(!giftWrap)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                    giftWrap
                      ? "bg-foreground border-foreground"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  {giftWrap && <Check className="h-3 w-3 text-background" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Embalagem para presente</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inclui cartão especial com sua mensagem · + R$ {formatPrice(GIFT_WRAP_PRICE)}
                  </p>
                </div>
              </label>
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

              <div className="flex justify-between">
                <span className="text-muted-foreground">Envio</span>
                <span className={`font-semibold ${hasFreeShipping ? "text-[#b6e36d]" : ""}`}>
                  {hasFreeShipping ? "Grátis" : "Calculado no checkout"}
                </span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold">Total estimado</span>
                <div className="text-right">
                  <span className="text-xl font-bold">R$ {formatPrice(total)}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ou até 10x de R$ {formatPrice(total / 10)} sem juros
                  </p>
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
  );
}
