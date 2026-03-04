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
                    <div className="w-24 h-24 bg-accent rounded-2xl overflow-hidden flex-shrink-0">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img
                          src={item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold truncate">{item.product.node.title}</h4>
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
              <div className="flex justify-between items-center">
                <span className="text-base text-muted-foreground font-medium">Total</span>
                <span className="text-xl font-bold">R$ {totalPrice % 1 === 0 ? totalPrice.toLocaleString("pt-BR") : totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full h-14 rounded-2xl text-base font-semibold tracking-wide"
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
