import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

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
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currency = items[0]?.price.currencyCode || 'BRL';

  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background p-0 rounded-l-3xl">
        <SheetHeader className="px-8 pt-8 pb-5 border-b border-border flex-shrink-0">
          <SheetTitle className="text-xl font-bold tracking-tight">Carrinho</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {totalItems === 0 ? "Nenhum item adicionado." : `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h3 className="text-xl font-semibold text-foreground text-center leading-snug mb-3">
              Seu carrinho está<br />vazio no momento.
            </h3>
            <p className="text-sm text-muted-foreground mb-8">Aceita algumas sugestões?</p>
            <div className="w-full max-w-xs space-y-3">
              {EMPTY_CART_SUGGESTIONS.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-accent/50 transition-colors"
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-sm font-medium text-foreground flex-1">{s.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="w-20 h-20 bg-accent rounded overflow-hidden flex-shrink-0">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img
                          src={item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.product.node.title}</h4>
                      {item.variantTitle !== "Default Title" && (
                        <p className="text-xs opacity-50 mt-0.5">{item.variantTitle}</p>
                      )}
                      <p className="text-sm font-medium mt-1">
                        {currency} {parseFloat(item.price.amount).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 opacity-50 hover:opacity-100 transition-opacity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 opacity-50 hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="p-1 opacity-30 hover:opacity-100 transition-opacity ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-6 border-t border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60">Total</span>
                <span className="text-base font-medium">{currency} {totalPrice.toFixed(2)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full h-12 rounded text-sm font-medium tracking-wide"
                disabled={items.length === 0 || isLoading || isSyncing}
              >
                {isLoading || isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Finalizar compra <ExternalLink className="w-3.5 h-3.5 ml-2" /></>
                )}
              </Button>
              <p className="text-[11px] text-center opacity-30">Transparente. Sem ruído.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
