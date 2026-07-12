"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  getWishlistAction,
  syncWishlistAction,
  type WishlistProductDto,
} from "@/lib/wishlist/actions";
import {
  useWishlistStore,
  type WishlistStoreItem,
} from "@/store/wishlist-store";

function toStoreItem(item: WishlistProductDto): WishlistStoreItem {
  return {
    productId: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category,
    price: item.price,
    imageUrl: item.imageUrl,
    imageTone: item.imageTone,
    inStock: item.inStock,
    addedAt: item.addedAt,
  };
}

/** Hydrate + sync local wishlist with the signed-in account once per mount. */
export function useWishlistSync(isAuthenticated: boolean) {
  const hydrated = useWishlistStore((state) => state.hydrated);
  const replaceAll = useWishlistStore((state) => state.replaceAll);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !hydrated || syncedRef.current) return;
    syncedRef.current = true;

    const localIds = useWishlistStore.getState().items.map((item) => item.productId);

    void (async () => {
      const result =
        localIds.length > 0
          ? await syncWishlistAction({ productIds: localIds })
          : await getWishlistAction();

      if (result.data) {
        replaceAll(result.data.map(toStoreItem));
      }
    })();
  }, [hydrated, isAuthenticated, replaceAll]);
}

export function useWishlistStatus(productId: string) {
  const hydrated = useWishlistStore((state) => state.hydrated);
  const wishlisted = useWishlistStore((state) =>
    state.items.some((item) => item.productId === productId)
  );
  return { wishlisted, ready: hydrated };
}

export function useWishlistCount() {
  return useWishlistStore((state) => state.items.length);
}

export function useRemoveFromWishlist() {
  const removeItem = useWishlistStore((state) => state.removeItem);
  return useCallback(
    async (productId: string, syncServer: boolean) => {
      removeItem(productId);
      if (!syncServer) return;
      const { removeWishlistItemAction } = await import("@/lib/wishlist/actions");
      await removeWishlistItemAction({ productId });
    },
    [removeItem]
  );
}
