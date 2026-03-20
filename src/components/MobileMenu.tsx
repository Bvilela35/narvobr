import { Link, useLocation } from "react-router-dom";
import { X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const menuLinks = [
  { label: "Construir Setup", href: "/colecao" },
  { label: "InSight", href: "/colecao/narvo-insight" },
  { label: "OutSight", href: "/colecao/narvo-outsight" },
  { label: "Acessórios", href: "/colecao" },
  { label: "Decoração", href: "/colecao" },
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Menu panel */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 inset-x-0 z-[85] bg-background border-b border-border"
          >
            {/* Header row with close */}
            <div className="flex items-center justify-between px-6 h-16">
              <Link to="/" onClick={onClose} className="flex items-center">
                <img
                  alt="NARVO"
                  className="h-28 object-cover"
                  src="/lovable-uploads/7d9ccf03-8171-466d-9771-2d6306af8551.png"
                />
              </Link>
              <button onClick={onClose} className="p-2 transition-opacity hover:opacity-60" aria-label="Fechar menu">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Links — same style as desktop nav */}
            <nav className="flex flex-col px-6 pb-6 pt-2 gap-1">
              {menuLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.href}
                    onClick={onClose}
                    className={cn(
                      "block text-sm tracking-wide py-3 transition-opacity hover:opacity-60",
                      location.pathname === link.href ? "opacity-100" : "opacity-70"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Meus Pedidos */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + menuLinks.length * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <a
                  href="https://efxqrr-1y.myshopify.com/account"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center gap-2 text-sm tracking-wide opacity-70 hover:opacity-60 transition-opacity py-3 mt-2 border-t border-border"
                >
                  <User className="h-4 w-4" strokeWidth={1.5} />
                  Meus Pedidos
                </a>
              </motion.div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
