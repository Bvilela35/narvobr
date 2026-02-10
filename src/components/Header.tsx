import { Link, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Coleção", href: "/colecao" },
  { label: "Sistema", href: "/sobre" },
  { label: "Sobre", href: "/sobre" },
  { label: "Suporte", href: "/suporte" },
];

interface HeaderProps {
  onCartOpen: () => void;
}

export function Header({ onCartOpen }: HeaderProps) {
  const location = useLocation();
  const totalItems = useCartStore(state => state.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-10 h-16">
        <Link to="/" className="text-base font-medium tracking-[0.3em] uppercase">
          NARVO
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={cn(
                "text-sm tracking-wide transition-opacity hover:opacity-60",
                location.pathname === link.href ? "opacity-100" : "opacity-70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={onCartOpen}
          className="relative p-2 transition-opacity hover:opacity-60"
          aria-label="Abrir carrinho"
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
