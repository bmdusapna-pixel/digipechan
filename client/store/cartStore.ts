import { DeliveryType } from "@/common/constants/enum";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  qrTypeId: string;
  qrName: string;
  quantity: number;
  productImage?: string;
  originalPrice: number;
  discountedPrice: number;
  deliveryType?: DeliveryType[];
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  increaseQty: (qrTypeId: string) => void;
  decreaseQty: (qrTypeId: string) => void;
  removeFromCart: (qrTypeId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        const existing = get().items.find((i) => i.qrTypeId === item.qrTypeId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.qrTypeId === item.qrTypeId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },

      increaseQty: (qrTypeId) =>
        set({
          items: get().items.map((i) =>
            i.qrTypeId === qrTypeId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }),

      decreaseQty: (qrTypeId) => {
        const current = get().items.find((i) => i.qrTypeId === qrTypeId);
        if (!current) return;

        if (current.quantity <= 1) {
          set({ items: get().items.filter((i) => i.qrTypeId !== qrTypeId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.qrTypeId === qrTypeId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },

      removeFromCart: (qrTypeId) =>
        set({ items: get().items.filter((i) => i.qrTypeId !== qrTypeId) }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);

