import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, X, Loader2, Menu, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { label: "Setup", href: "/colecao/setup" },
  { label: "Acessórios", href: "/colecao/acessorios" },
  { label: "Narvo Focus", href: "https://focus.narvo.com.br/", external: true },
  { label: "Corporativo", href: "/corporativo" },
];


const categories = ["Todos os Produtos", "Novidades", "Mais Vendidos", "Acessórios", "Essenciais"];

interface HeaderProps {
  onCartOpen: () => void;
}

export function Header({ onCartOpen }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    closeSearch();
  }, [location.pathname, closeSearch]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [searchOpen]);

  // Lock body scroll when search is open
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await fetchProducts(8, `title:*${query}*`);
        setResults(products);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-10 h-16">
          <Link to="/" className="flex items-center">
            <img
              alt="NARVO"
              src="/optimized/narvo-logo-224.png"
              width={112}
              height={112}
              className="h-28 w-28 object-cover"
              fetchPriority="high"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm tracking-wide transition-opacity hover:opacity-60 opacity-70"
                >
                  {link.label}
                </a>
              ) : (
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
              )
            )}
          </nav>

          <div className="flex items-center gap-0">
            <button
              onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
              className="p-2 transition-opacity hover:opacity-60"
              aria-label="Pesquisar">

              {searchOpen ?
              <X className="h-5 w-5" strokeWidth={1.5} /> :

              <Search className="h-5 w-5" strokeWidth={1.5} />
              }
            </button>

            <a
              href="https://efxqrr-1y.myshopify.com/account"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex p-2 transition-opacity hover:opacity-60"
              aria-label="Meus pedidos">
              <User className="h-5 w-5" strokeWidth={1.5} />
            </a>

            <button
              onClick={onCartOpen}
              className="relative p-2 transition-opacity hover:opacity-60"
              aria-label="Abrir carrinho">

              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {totalItems > 0 &&
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              }
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 transition-opacity hover:opacity-60 lg:hidden"
              aria-label="Abrir menu">

              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen search overlay */}
      <AnimatePresence>
        {searchOpen &&
        <>
            {/* Glassmorphism backdrop */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl"
            onClick={closeSearch} />


            {/* Search content */}
            <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-0 z-[70] max-h-screen overflow-y-auto">

              {/* Search bar */}
              <div className="bg-background border-b border-border">
                <div className="max-w-[1400px] mx-auto flex items-center px-6 md:px-10 h-16 gap-4">
                  <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
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
                  placeholder="O que você está buscando?"
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />

                  {loading && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin flex-shrink-0" />}
                  <button
                  onClick={closeSearch}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">

                    <span className="hidden sm:inline text-xs tracking-widest">ESC</span>
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">
                {!hasQuery ? (
              /* Categories when no query */
              <div>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-5">Categorias</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) =>
                  <Link
                    key={cat}
                    to={`/colecao`}
                    onClick={closeSearch}
                    className="px-4 py-2 rounded-full border border-border text-sm text-foreground hover:bg-accent transition-colors">

                          {cat}
                        </Link>
                  )}
                    </div>
                  </div>) : (

              /* Search results as list */
              <div>
                    {results.length > 0 &&
                <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-5">Produtos</p>
                        <div className="flex flex-col divide-y divide-border">
                          {results.map((product) => {
                      const image = product.node.images.edges[0]?.node;
                      const price = product.node.priceRange.minVariantPrice;
                      return (
                        <Link
                          key={product.node.id}
                          to={`/produto/${product.node.handle}`}
                          onClick={closeSearch}
                          className="flex items-center gap-5 py-4 group hover:bg-accent/40 -mx-3 px-3 rounded-xl transition-colors">

                                <div className="w-16 h-16 rounded-lg bg-card-elevated overflow-hidden flex-shrink-0">
                                  {image &&
                            <img
                              src={image.url}
                              alt={image.altText || product.node.title}
                              className="w-full h-full object-contain p-1.5" />

                            }
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground group-hover:opacity-70 transition-opacity truncate">
                                    {product.node.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                                  </p>
                                </div>
                              </Link>);

                    })}
                        </div>
                      </div>
                }

                    {!loading && results.length === 0 &&
                <p className="text-sm text-muted-foreground">
                        Nenhum resultado para "{query}". Tente outro termo.
                      </p>
                }
                  </div>)
              }
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>);

}
