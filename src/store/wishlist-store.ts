"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistStoreItem = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  imageTone: string;
  inStock: boolean;
  addedAt: number;
};

type WishlistStore = {
  items: WishlistStoreItem[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  isWishlisted: (productId: string) => boolean;
  toggleItem: (item: Omit<WishlistStoreItem, "addedAt">) => boolean;
  addItem: (item: Omit<WishlistStoreItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  replaceAll: (items: WishlistStoreItem[]) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      isWishlisted: (productId) => get().items.some((item) => item.productId === productId),
      toggleItem: (item) => {
        const exists = get().items.some((row) => row.productId === item.productId);
        if (exists) {
          set({
            items: get().items.filter((row) => row.productId !== item.productId),
          });
          return false;
        }
        set({
          items: [
            {
              ...item,
              addedAt: Date.now(),
            },
            ...get().items,
          ],
        });
        return true;
      },
      addItem: (item) => {
        if (get().items.some((row) => row.productId === item.productId)) return;
        set({
          items: [{ ...item, addedAt: Date.now() }, ...get().items],
        });
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((row) => row.productId !== productId) });
      },
      replaceAll: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "wht-wishlist",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
