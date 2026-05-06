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

  // Inicializa atribuição uma única vez (mount)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initAttribution();
  }, []);

  // page_viewed a cada mudança de pathname
  useEffect(() => {
    const eventId = trackPageViewed(location.pathname);

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView', {}, { eventID: eventId });
    }
  }, [location.pathname]);
}
