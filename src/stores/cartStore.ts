import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CartItem,
  createShopifyCart,
  addLineToShopifyCart,
  updateShopifyCartLine,
  removeLineFromShopifyCart,
  storefrontApiRequest,
  CART_QUERY,
  applyDiscountToCart,
} from '@/lib/shopify';

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  discountCode: string | null;
  discountedTotal: string | null;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  applyDiscount: (code: string) => Promise<{ success: boolean; applicable?: boolean }>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      discountCode: null,
      discountedTotal: null,
      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result) {
              set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [{ ...item, lineId: result.lineId }] });
              // Auto-apply pending discount code
              const pendingDiscount = get().discountCode;
              if (pendingDiscount) {
                const discountResult = await applyDiscountToCart(result.cartId, pendingDiscount);
                if (discountResult.success && discountResult.applicable) {
                  set({ discountedTotal: discountResult.totalAmount || null });
                }
              }
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) return;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i) });
            } else if (result.cartNotFound) clearCart();
          } else {
            const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
            if (result.success) {
              set({ items: [...get().items, { ...item, lineId: result.lineId ?? null }] });
            } else if (result.cartNotFound) clearCart();
          }
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) { await get().removeItem(variantId); return; }
        const { items, cartId, clearCart, syncCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        const previousItems = [...items];
        // Optimistic update — UI reflects immediately
        set({ items: items.map(i => i.variantId === variantId ? { ...i, quantity } : i), isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (!result.success) {
            if (result.cartNotFound) clearCart();
            else set({ items: previousItems }); // Revert on failure
          } else {
            await syncCart(); // Refresh totals/discountedTotal from Shopify
          }
        } catch (error) {
          console.error('Failed to update:', error);
          set({ items: previousItems }); // Revert on error
        }
        finally { set({ isLoading: false }); }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter(i => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) clearCart();
        } catch (error) { console.error('Failed to remove:', error); }
        finally { set({ isLoading: false }); }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null, discountCode: null, discountedTotal: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      applyDiscount: async (code: string) => {
        const { cartId } = get();
        if (!cartId) {
          // Store for later application when cart is created
          if (code) set({ discountCode: code });
          return { success: true, applicable: true };
        }
        const result = await applyDiscountToCart(cartId, code);
        if (result.success) {
          if (!code) {
            // Removing discount
            set({ discountCode: null, discountedTotal: null });
            return { success: true, applicable: true };
          }
          if (result.applicable) {
            set({ discountCode: code, discountedTotal: result.totalAmount || null });
          } else {
            // Code not applicable — remove it from cart
            await applyDiscountToCart(cartId, "");
            return { success: true, applicable: false };
          }
        }
        return { success: result.success, applicable: result.applicable };
      },

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) { clearCart(); return; }
          // Sync discount state from Shopify
          const appliedCodes = cart.discountCodes || [];
          const activeCode = appliedCodes.find((dc: { code: string; applicable: boolean }) => dc.applicable);
          const totalAmount = cart.cost?.totalAmount?.amount || null;
          set({ 
            discountCode: activeCode?.code || null, 
            discountedTotal: activeCode ? totalAmount : null 
          });
        } catch (error) { console.error('Failed to sync cart:', error); }
        finally { set({ isSyncing: false }); }
      },
    }),
    {
      name: 'narvo-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl, discountCode: state.discountCode, discountedTotal: state.discountedTotal }),
    }
  )
);
