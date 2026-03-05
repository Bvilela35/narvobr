import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEYS = {
  dismissed: "narvo_popup_dismissed_at",
  submitted: "narvo_popup_submitted",
  sessionShown: "narvo_popup_session_shown",
  pageCount: "narvo_popup_page_count",
};

const COPY_VARIANTS = [
  {
    title: "Organize sua superfície.",
    subtitle: "Entre na lista Narvo e obtenha o benefício para o seu primeiro setup.",
    cta: "Quero acesso",
    dismiss: "Agora não",
  },
  {
    title: "Menos distração. Mais foco.",
    subtitle: "Cadastre-se. Receba acesso a lançamentos e seu código de primeira compra.",
    cta: "Cadastrar",
    dismiss: "Depois",
  },
  {
    title: "Setup Minimal. Peak Performance.",
    subtitle: "Assine para receber o benefício de entrada e atualizações técnicas.",
    cta: "Receber",
    dismiss: "Agora não",
  },
];

// Blocked routes (never show popup)
const BLOCKED_ROUTES = ["/checkout", "/produto/"];
// Preferred routes (show popup)
const PREFERRED_ROUTES = ["/", "/colecao", "/sobre", "/suporte", "/trocas", "/envio", "/privacidade"];

function isMobile() {
  return window.innerWidth < 768;
}

function getDismissCooldown() {
  return isMobile() ? 14 : 7; // days
}

function shouldShow(): boolean {
  // Already submitted → never show
  if (localStorage.getItem(STORAGE_KEYS.submitted)) return false;

  // Already shown this session
  if (sessionStorage.getItem(STORAGE_KEYS.sessionShown)) return false;

  // Dismissed recently
  const dismissedAt = localStorage.getItem(STORAGE_KEYS.dismissed);
  if (dismissedAt) {
    const cooldownDays = getDismissCooldown();
    const elapsed = Date.now() - parseInt(dismissedAt, 10);
    if (elapsed < cooldownDays * 24 * 60 * 60 * 1000) return false;
  }

  return true;
}

function isBlockedRoute(pathname: string): boolean {
  return BLOCKED_ROUTES.some((r) => pathname.startsWith(r));
}

export function LeadCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const location = useLocation();

  // Pick a random copy variant per mount (stable for the session)
  const [copyIndex] = useState(() => Math.floor(Math.random() * COPY_VARIANTS.length));
  const copy = COPY_VARIANTS[copyIndex];

  const showPopup = useCallback(() => {
    if (!shouldShow()) return;
    if (isBlockedRoute(location.pathname)) return;
    sessionStorage.setItem(STORAGE_KEYS.sessionShown, "1");
    setVisible(true);
  }, [location.pathname]);

  // Track page count
  useEffect(() => {
    const count = parseInt(sessionStorage.getItem(STORAGE_KEYS.pageCount) || "0", 10) + 1;
    sessionStorage.setItem(STORAGE_KEYS.pageCount, String(count));

    // Trigger on 2nd page if enough time has passed
    if (count >= 2) {
      const timer = setTimeout(() => showPopup(), 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, showPopup]);

  // Scroll-based trigger (60%) with 20s delay
  useEffect(() => {
    if (!shouldShow() || isBlockedRoute(location.pathname)) return;

    let scrollTriggered = false;
    const startTime = Date.now();

    const handleScroll = () => {
      if (scrollTriggered) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.6 && Date.now() - startTime >= 20000) {
        scrollTriggered = true;
        showPopup();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, showPopup]);

  // Exit-intent (desktop only)
  useEffect(() => {
    if (isMobile() || !shouldShow() || isBlockedRoute(location.pathname)) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        showPopup();
      }
    };

    // Delay exit-intent by 20s
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 20000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [location.pathname, showPopup]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEYS.dismissed, String(Date.now()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("shopify-lead-capture", {
        body: { email: email.trim(), source: "popup" },
      });

      if (error) throw error;

      localStorage.setItem(STORAGE_KEYS.submitted, "1");
      setSuccess(true);
      toast.success("Cadastro realizado com sucesso.");

      setTimeout(() => setVisible(false), 3000);
    } catch (err) {
      console.error("Lead capture error:", err);
      toast.error("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render on blocked routes
  if (isBlockedRoute(location.pathname)) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] md:max-w-[380px]"
        >
          <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-accent transition-colors z-10"
              aria-label="Fechar"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="p-6 pt-5">
              {success ? (
                <div className="text-center py-4">
                  <p className="text-base font-semibold mb-1">Pronto.</p>
                  <p className="text-sm text-muted-foreground">
                    Enviamos algo especial para o seu e-mail.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-5 pr-6">
                    <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2 font-medium">
                      Narvo
                    </p>
                    <h3 className="text-lg font-semibold leading-snug">
                      {copy.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {copy.subtitle}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? "Cadastrando..." : copy.cta}
                    </button>
                  </form>

                  {/* Dismiss + LGPD */}
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleDismiss}
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copy.dismiss}
                    </button>
                    <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                      Ao se cadastrar, você concorda com nossa{" "}
                      <a
                        href="/privacidade"
                        className="underline hover:text-muted-foreground transition-colors"
                      >
                        Política de Privacidade
                      </a>
                      . Sem spam, prometemos.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
