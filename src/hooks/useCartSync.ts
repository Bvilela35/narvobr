import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

export function useCartSync() {
  const syncCart = useCartStore(state => state.syncCart);

  useEffect(() => {
    let cancelled = false;
    const runSync = () => {
      if (!cancelled) void syncCart();
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(runSync, { timeout: 1500 });
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') runSync();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    const timeoutId = globalThis.setTimeout(runSync, 300);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') runSync();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncCart]);
}
