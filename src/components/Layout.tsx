import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { WhatsAppBanner } from "./WhatsAppBanner";
import { TrustPillars } from "./TrustPillars";
import { LeadCapturePopup } from "./LeadCapturePopup";

export function Layout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener("narvo:open-cart", handler);
    return () => window.removeEventListener("narvo:open-cart", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1 pt-16">{children}</main>
      <WhatsAppBanner />
      <TrustPillars />
      <Footer />
      <LeadCapturePopup />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
