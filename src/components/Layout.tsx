import { Suspense, lazy, useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { WhatsAppBanner } from "./WhatsAppBanner";
import { TrustPillars } from "./TrustPillars";
const LeadCapturePopup = lazy(() =>
  import("./LeadCapturePopup").then((module) => ({ default: module.LeadCapturePopup }))
);

export function Layout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [enableLeadCapture, setEnableLeadCapture] = useState(false);

  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener("narvo:open-cart", handler);
    return () => window.removeEventListener("narvo:open-cart", handler);
  }, []);

  useEffect(() => {
    if (enableLeadCapture) return;

    const activate = () => setEnableLeadCapture(true);
    const timerId = window.setTimeout(activate, 12000);
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "scroll"];

    events.forEach((eventName) => {
      window.addEventListener(eventName, activate, { once: true, passive: true });
    });

    return () => {
      window.clearTimeout(timerId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, activate);
      });
    };
  }, [enableLeadCapture]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1 pt-16 min-h-screen">{children}</main>
      <WhatsAppBanner />
      <TrustPillars />
      <Footer />
      {enableLeadCapture && (
        <Suspense fallback={null}>
          <LeadCapturePopup />
        </Suspense>
      )}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
