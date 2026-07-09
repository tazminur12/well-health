import { create } from "zustand";

type CartStore = {
  itemCount: number;
};

export const useCartStore = create<CartStore>()(() => ({
  itemCount: 0,
}));