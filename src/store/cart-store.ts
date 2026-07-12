"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

function summarize(items: CartItem[]) {
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      addItem: (item, quantity = 1) => {
        const qty = Math.max(1, quantity);
        const existing = get().items.find((row) => row.productId === item.productId);
        const items = existing
          ? get().items.map((row) =>
              row.productId === item.productId
                ? { ...row, quantity: row.quantity + qty, price: item.price, imageUrl: item.imageUrl }
                : row
            )
          : [...get().items, { ...item, quantity: qty }];
        set({ items, ...summarize(items) });
      },
      removeItem: (productId) => {
        const items = get().items.filter((row) => row.productId !== productId);
        set({ items, ...summarize(items) });
      },
      setQuantity: (productId, quantity) => {
        const items =
          quantity <= 0
            ? get().items.filter((row) => row.productId !== productId)
            : get().items.map((row) =>
                row.productId === productId ? { ...row, quantity } : row
              );
        set({ items, ...summarize(items) });
      },
      clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
    }),
    {
      name: "wht-cart",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const summary = summarize(state.items);
        state.itemCount = summary.itemCount;
        state.subtotal = summary.subtotal;
      },
    }
  )
);
