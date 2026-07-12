"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useWishlistSync } from "@/hooks/use-wishlist";

const WishlistAuthContext = createContext(false);

export function WishlistProvider({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  useWishlistSync(isAuthenticated);

  return (
    <WishlistAuthContext.Provider value={isAuthenticated}>
      {children}
    </WishlistAuthContext.Provider>
  );
}

export function useWishlistAuth() {
  return useContext(WishlistAuthContext);
}
