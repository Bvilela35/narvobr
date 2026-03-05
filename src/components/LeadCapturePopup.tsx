import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";

const STORAGE_KEYS = {
  dismissed: "narvo_popup_dismissed_at",
  submitted: "narvo_popup_submitted",
  sessionShown: "narvo_popup_session_shown",
  pageCount: "narvo_popup_page_count",
};

const COPY_VARIANTS = [
  {
    title: "Organize sua superfície.",
    subtitle: "Entre na lista Narvo e receba seu benefício de primeiro setup.",
    cta: "Quero meu benefício",
    dismiss: "Agora não",
  },
  {
    title: "Menos distração. Mais foco.",
    subtitle: "Cadastre-se e receba seu código exclusivo de primeira compra.",
    cta: "Quero meu benefício",
    dismiss: "Depois",
  },
  {
    title: "Setup Minimal. Peak Performance.",
    subtitle: "Receba o benefício de entrada e atualizações técnicas Narvo.",
    cta: "Quero meu benefício",
    dismiss: "Agora não",
  },
];

const COUPONS = {
  new: { code: "NARVO-10", label: "Primeiro pedido", description: "Use no checkout para 10% off no seu primeiro pedido." },
  returning: { code: "NARVO-VOLTA", label: "Cliente de volta", description: "Use no checkout para desconto na sua próxima compra." },
};

const BLOCKED_ROUTES = ["/checkout", "/produto/"];

function isMobile() {
  return window.innerWidth < 768;
}

function getDismissCooldown() {
  return isMobile() ? 14 : 7;
}

function shouldShow(): boolean {
  if (localStorage.getItem(STORAGE_KEYS.submitted)) return false;
  if (sessionStorage.getItem(STORAGE_KEYS.sessionShown)) return false;
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

/* ─── Step: CTA ─── */
function StepCTA({ copy, onNext, onDismiss }: { copy: typeof COPY_VARIANTS[0]; onNext: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-5">
        <Gift className="h-7 w-7 text-foreground" />
      </div>
      <h3 className="text-xl font-bold leading-tight mb-2">{copy.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[260px]">{copy.subtitle}</p>
      <button
        onClick={onNext}
        className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-semibold transition-opacity hover:opacity-90"
      >
        {copy.cta}
      </button>
      <button
        onClick={onDismiss}
        className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {copy.dismiss}
      </button>
    </motion.div>
  );
}

/* ─── Step: Email ─── */
function StepEmail({ onSubmit, loading }: { onSubmit: (email: string) => void; loading: boolean }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) onSubmit(email.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-5">
        <Gift className="h-7 w-7 text-foreground" />
      </div>
      <h3 className="text-lg font-bold leading-tight mb-1">Quase lá.</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">Informe seu e-mail para liberar o benefício.</p>
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <input
          type="email"
          required
          autoFocus
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed mt-4">
        Ao se cadastrar, você concorda com nossa{" "}
        <a href="/privacidade" className="underline hover:text-muted-foreground transition-colors">
          Política de Privacidade
        </a>
        . Sem spam.
      </p>
    </motion.div>
  );
}

/* ─── Step: Coupon ─── */
function StepCoupon({ coupon, onClose }: { coupon: typeof COUPONS.new; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const applyDiscount = useCartStore((s) => s.applyDiscount);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    await applyDiscount(coupon.code);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(onClose, 4000);
  };

  useEffect(() => {
    // Auto-apply on mount
    applyDiscount(coupon.code);
  }, [coupon.code, applyDiscount]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center"
    >
      <div className="text-4xl mb-4">🎉</div>
      <h3 className="text-xl font-bold leading-tight mb-1">Pronto!</h3>
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4 font-medium">
        {coupon.label}
      </p>
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-lg font-bold tracking-widest bg-accent px-5 py-2.5 rounded-xl border border-border font-mono">
          {coupon.code}
        </span>
        <button
          onClick={handleCopy}
          className="p-2.5 rounded-xl border border-border hover:bg-accent transition-colors"
          aria-label="Copiar cupom"
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
        </button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-1">
        {coupon.description}
      </p>
      <p className="text-[10px] text-muted-foreground/60">
        Cupom já aplicado automaticamente no carrinho.
      </p>
    </motion.div>
  );
}

/* ─── Main Popup ─── */
export function LeadCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"cta" | "email" | "coupon">("cta");
  const [loading, setLoading] = useState(false);
  const [successCoupon, setSuccessCoupon] = useState<typeof COUPONS.new | null>(null);
  const location = useLocation();

  const [copyIndex] = useState(() => Math.floor(Math.random() * COPY_VARIANTS.length));
  const copy = COPY_VARIANTS[copyIndex];

  const showPopup = useCallback(() => {
    if (!shouldShow()) return;
    if (isBlockedRoute(location.pathname)) return;
    sessionStorage.setItem(STORAGE_KEYS.sessionShown, "1");
    setVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    const count = parseInt(sessionStorage.getItem(STORAGE_KEYS.pageCount) || "0", 10) + 1;
    sessionStorage.setItem(STORAGE_KEYS.pageCount, String(count));
    if (count >= 2) {
      const timer = setTimeout(() => showPopup(), 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, showPopup]);

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

  useEffect(() => {
    if (isMobile() || !shouldShow() || isBlockedRoute(location.pathname)) return;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) showPopup();
    };
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

  const handleEmailSubmit = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("shopify-lead-capture", {
        body: { email, source: "popup" },
      });
      if (error) throw error;
      localStorage.setItem(STORAGE_KEYS.submitted, "1");
      const isExisting = data?.existing === true;
      const coupon = isExisting ? COUPONS.returning : COUPONS.new;
      setSuccessCoupon(coupon);
      setStep("coupon");
      toast.success("Cadastro realizado com sucesso.");
    } catch (err) {
      console.error("Lead capture error:", err);
      toast.error("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (isBlockedRoute(location.pathname)) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-background border border-border rounded-3xl shadow-2xl overflow-hidden relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-accent transition-colors z-10"
              aria-label="Fechar"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="px-7 py-8">
              <AnimatePresence mode="wait">
                {step === "cta" && (
                  <StepCTA
                    key="cta"
                    copy={copy}
                    onNext={() => setStep("email")}
                    onDismiss={handleDismiss}
                  />
                )}
                {step === "email" && (
                  <StepEmail
                    key="email"
                    onSubmit={handleEmailSubmit}
                    loading={loading}
                  />
                )}
                {step === "coupon" && successCoupon && (
                  <StepCoupon
                    key="coupon"
                    coupon={successCoupon}
                    onClose={() => setVisible(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
