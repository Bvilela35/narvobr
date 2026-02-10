import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, X, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
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
  const navigate = useNavigate();
  const totalItems = useCartStore(state => state.items.reduce((sum, item) => sum + item.quantity, 0));

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  // Close on route change
  useEffect(() => { closeSearch(); }, [location.pathname, closeSearch]);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await fetchProducts(6, `title:*${query}*`);
        setResults(products);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

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

        <div className="flex items-center gap-3">
          {/* Search toggle */}
          <button
            onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
            className="p-2 transition-opacity hover:opacity-60"
            aria-label="Pesquisar"
          >
            {searchOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Search className="h-5 w-5" strokeWidth={1.5} />}
          </button>

          {/* Cart */}
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
      </div>

      {/* Search panel */}
      {searchOpen && (
        <div className="border-t border-border bg-background">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4">
            <div className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                  if (e.key === "Enter" && query.trim()) {
                    navigate(`/colecao?q=${encodeURIComponent(query.trim())}`);
                    closeSearch();
                  }
                }}
                placeholder="Pesquisar produtos..."
                className="w-full bg-transparent text-sm pl-7 pr-4 py-2 outline-none placeholder:text-muted-foreground"
              />
              {loading && <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
            </div>

            {results.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((product) => {
                  const image = product.node.images.edges[0]?.node;
                  const price = product.node.priceRange.minVariantPrice;
                  return (
                    <Link
                      key={product.node.id}
                      to={`/produto/${product.node.handle}`}
                      onClick={closeSearch}
                      className="flex items-center gap-4 p-3 rounded-xl bg-card-elevated hover:shadow-md transition-shadow"
                    >
                      <div className="w-14 h-14 rounded-lg bg-accent overflow-hidden flex-shrink-0">
                        {image && (
                          <img src={image.url} alt={image.altText || product.node.title} className="w-full h-full object-contain p-1" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">{product.node.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {query.trim() && !loading && results.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">Nada encontrado. Menos, é mais.</p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
