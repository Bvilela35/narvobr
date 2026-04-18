import { Link, useLocation } from "react-router-dom";
import { X, User } from "lucide-react";
import { useEffect } from "react";

const menuLinks = [
  { label: "Setup", href: "/colecao/setup" },
  { label: "Acessórios", href: "/colecao/acessorios" },
  { label: "Corporativo", href: "/corporativo" },
  { label: "Ferramentas", href: "https://focus.narvo.com.br/", external: true },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
        <div
          className="fixed inset-0 z-[80] bg-background flex flex-col"
        >
          {/* Close button */}
          <div className="flex justify-end px-6 h-16 items-center">
            <button onClick={onClose} className="p-2" aria-label="Fechar menu">
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 flex flex-col justify-center px-10 gap-2">
            {menuLinks.map((link, i) => (
              <div
                key={link.label}
                className="animate-in fade-in slide-in-from-bottom-3 duration-300"
                style={{ animationDelay: `${150 + i * 60}ms` }}
              >
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="block text-4xl font-semibold tracking-tight text-foreground py-3 transition-opacity hover:opacity-50"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    onClick={onClose}
                    className="block text-4xl font-semibold tracking-tight text-foreground py-3 transition-opacity hover:opacity-50"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Meus Pedidos - bottom right */}
          <div
            className="absolute bottom-8 right-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: "450ms" }}
          >
            <a
              href="https://efxqrr-1y.myshopify.com/account"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
              Meus Pedidos
            </a>
          </div>
        </div>
  );
}
