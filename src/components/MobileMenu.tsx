import { Link, useLocation } from "react-router-dom";
import { X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const menuLinks = [
  { label: "Setup", href: "/colecao" },
  { label: "Acessórios", href: "/colecao/acessorios" },
  { label: "Corporativo", href: "/corporativo" },
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ clipPath: "circle(0% at calc(100% - 60px) 32px)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 60px) 32px)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 60px) 32px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease: "easeOut" }}
              >
                <Link
                  to={link.href}
                  onClick={onClose}
                  className="block text-4xl font-semibold tracking-tight text-foreground py-3 transition-opacity hover:opacity-50"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Meus Pedidos - bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4, ease: "easeOut" }}
            className="absolute bottom-8 right-8"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
