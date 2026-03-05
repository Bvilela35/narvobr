import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ExternalLink, Loader2, ArrowRight, Tag, ChevronDown, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const EMPTY_CART_SUGGESTIONS = [
  { label: "InSight", href: "/colecao/narvo-insight", icon: "🖥️" },
  { label: "OutSight", href: "/colecao/narvo-outsight", icon: "💼" },
  { label: "Acessórios", href: "/colecao/acessorios", icon: "🎨" },
];

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart, discountCode, discountedTotal, applyDiscount } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currency = items[0]?.price.currencyCode || 'BRL';
  const [couponInput, setCouponInput] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponJustApplied, setCouponJustApplied] = useState(false);
  const prevDiscountCode = useRef(discountCode);

  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);

  // Animate badge when discount code changes from null to a value
  useEffect(() => {
    if (discountCode && !prevDiscountCode.current) {
      setCouponJustApplied(true);
      const timer = setTimeout(() => setCouponJustApplied(false), 1500);
      return () => clearTimeout(timer);
    }
    prevDiscountCode.current = discountCode;
  }, [discountCode]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      let finalUrl = checkoutUrl;
      if (discountCode) {
        try {
          const url = new URL(finalUrl);
          url.searchParams.set('discount', discountCode);
          finalUrl = url.toString();
        } catch { /* keep original */ }
      }
      window.open(finalUrl, '_blank');
      onOpenChange(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    setApplyingCoupon(true);
    const result = await applyDiscount(couponInput.trim().toUpperCase());
    if (result.success && result.applicable) {
      setCouponInput("");
      setCouponOpen(false);
    } else if (result.success && !result.applicable) {
      setCouponError("Cupom não encontrado ou inválido.");
    } else {
      setCouponError("Erro ao aplicar cupom. Tente novamente.");
    }
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = async () => {
    await applyDiscount("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background p-0 sm:rounded-l-3xl rounded-none">
        <SheetHeader className="px-8 pt-8 pb-5 flex-shrink-0">
          <SheetTitle className="text-3xl font-bold tracking-tight flex items-start gap-0">
            Carrinho
            {totalItems > 0 && (
              <span className="text-sm font-semibold text-muted-foreground -mt-0.5 ml-0.5">{totalItems}</span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">Seu carrinho de compras</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h3 className="text-2xl font-bold text-foreground text-center leading-tight mb-3">
              Seu carrinho está<br />vazio no momento.
            </h3>
            <p className="text-sm text-muted-foreground mb-10">Aceita algumas sugestões?</p>
            <div className="w-full max-w-xs space-y-3">
              {EMPTY_CART_SUGGESTIONS.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-border hover:bg-accent/50 transition-colors"
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-base font-semibold text-foreground flex-1">{s.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <Link
                      to={`/produto/${item.product.node.handle}`}
                      onClick={() => onOpenChange(false)}
                      className="w-24 h-24 bg-accent rounded-2xl overflow-hidden flex-shrink-0"
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
                        onClick={() => onOpenChange(false)}
                        className="text-base font-semibold truncate block hover:underline"
                      >
                        {item.product.node.title}
                      </Link>
                      {item.variantTitle !== "Default Title" && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variantTitle}</p>
                      )}
                      <p className="text-base font-bold mt-1">
                        R$ {parseFloat(item.price.amount) % 1 === 0 ? parseFloat(item.price.amount).toLocaleString("pt-BR") : parseFloat(item.price.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
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
            </div>

            <div className="flex-shrink-0 px-8 py-6 border-t border-border space-y-4">
              {/* Applied coupon badge */}
              {discountCode && (
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-[#b6e36d]" />
                  <span className="text-sm font-semibold tracking-wide font-mono text-[#b6e36d]">{discountCode}</span>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-0.5 hover:opacity-70 transition-opacity"
                    aria-label="Remover cupom"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Discrete coupon input */}
              {!discountCode && (
                <Collapsible open={couponOpen} onOpenChange={setCouponOpen}>
                  <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Tag className="h-3 w-3" />
                    <span>Adicionar cupom</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${couponOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código do cupom"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        className={`flex-1 h-10 px-4 rounded-xl border bg-card text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all uppercase tracking-wider ${couponError ? "border-destructive" : "border-border"}`}
                        disabled={applyingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="h-10 px-4 rounded-xl bg-foreground text-background text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-destructive mt-1.5">{couponError}</p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold">Subtotal</span>
                <div className="text-right">
                  {discountCode && discountedTotal ? (
                    <>
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        R$ {totalPrice % 1 === 0 ? totalPrice.toLocaleString("pt-BR") : totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xl font-bold">
                        R$ {parseFloat(discountedTotal) % 1 === 0 ? parseFloat(discountedTotal).toLocaleString("pt-BR") : parseFloat(discountedTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold">R$ {totalPrice % 1 === 0 ? totalPrice.toLocaleString("pt-BR") : totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ou até 10x de R$ {(() => { const finalPrice = discountCode && discountedTotal ? parseFloat(discountedTotal) : totalPrice; const v = finalPrice / 10; return v % 1 === 0 ? v.toLocaleString("pt-BR") : v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); })()} sem juros
                  </p>
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
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
