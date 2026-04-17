/**
 * useAnalytics
 * Hook central de tracking — deve ser montado uma única vez dentro do BrowserRouter.
 * Responsabilidades:
 *  - Inicializa atribuição (UTMs, first-touch/last-touch, attribution_id)
 *  - Dispara page_viewed a cada mudança de rota
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initAttribution, trackPageViewed } from '@/lib/analytics';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function useAnalytics(): void {
  const location = useLocation();
  const initialized = useRef(false);
  const firstPageViewSent = useRef(false);

  // Inicializa atribuição uma única vez (mount)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initAttribution();
  }, []);

  // page_viewed a cada mudança de pathname
  useEffect(() => {
    trackPageViewed(location.pathname);

    // O snippet base do Meta Pixel já envia o primeiro PageView.
    // A partir da segunda navegação, enviamos manualmente nas trocas de rota da SPA.
    if (!firstPageViewSent.current) {
      firstPageViewSent.current = true;
      return;
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);
}
