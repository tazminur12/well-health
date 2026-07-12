"use client";

import { ShoppingCart } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { BulkAddToCartBar } from "@/components/customer/bulk-add-to-cart-bar";
import { EmptyWishlistState } from "@/components/customer/empty-wishlist-state";
import { WishlistProductCard } from "@/components/customer/wishlist-product-card";
import { WishlistToolbar } from "@/components/customer/wishlist-toolbar";
import {
  sortWishlist,
  type WishlistItem,
  type WishlistSort,
} from "@/components/customer/wishlist-data";
import { useWishlistAuth } from "@/components/public/wishlist-provider";
import { showSuccess } from "@/lib/alerts";
import { removeWishlistItemAction } from "@/lib/wishlist/actions";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

export function CustomerWishlist() {
  const isAuthenticated = useWishlistAuth();
  const storeItems = useWishlistStore((state) => state.items);
  const removeFromStore = useWishlistStore((state) => state.removeItem);
  const addToStore = useWishlistStore((state) => state.addItem);
  const addToCart = useCartStore((state) => state.addItem);

  const items: WishlistItem[] = useMemo(
    () =>
      storeItems.map((item) => ({
        id: item.productId,
        slug: item.slug,
        name: item.name,
        category: item.category,
        price: item.price,
        imageUrl: item.imageUrl,
        imageTone: item.imageTone,
        inStock: item.inStock,
        addedAt: item.addedAt,
      })),
    [storeItems]
  );

  const [sort, setSort] = useState<WishlistSort>("recent");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<WishlistItem | null>(null);

  const removeTimer = useRef<number | null>(null);
  const undoTimer = useRef<number | null>(null);

  const sorted = useMemo(() => sortWishlist(items, sort), [items, sort]);
  const inStockCount = items.filter((item) => item.inStock).length;

  const handleRemove = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    setRemovingId(id);

    if (removeTimer.current) window.clearTimeout(removeTimer.current);
    removeTimer.current = window.setTimeout(() => {
      removeFromStore(id);
      if (isAuthenticated) {
        void removeWishlistItemAction({ productId: id });
      }
      setRemovingId(null);
      setLastRemoved(target);

      if (undoTimer.current) window.clearTimeout(undoTimer.current);
      undoTimer.current = window.setTimeout(() => setLastRemoved(null), 4000);
    }, 220);
  };

  const handleUndo = () => {
    if (!lastRemoved) return;
    addToStore({
      productId: lastRemoved.id,
      slug: lastRemoved.slug,
      name: lastRemoved.name,
      category: lastRemoved.category,
      price: lastRemoved.price,
      imageUrl: lastRemoved.imageUrl,
      imageTone: lastRemoved.imageTone,
      inStock: lastRemoved.inStock,
    });
    if (isAuthenticated) {
      void import("@/lib/wishlist/actions").then(({ toggleWishlistAction }) =>
        toggleWishlistAction({ productId: lastRemoved.id })
      );
    }
    setLastRemoved(null);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.inStock) return;
    addToCart({
      productId: item.id,
      slug: item.slug,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
    void showSuccess("Added to cart", `${item.name} is ready in your cart.`);
  };

  const handleAddAll = () => {
    const inStock = items.filter((item) => item.inStock);
    inStock.forEach((item) => {
      addToCart({
        productId: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      });
    });
    void showSuccess(
      "Added to cart",
      `${inStock.length} ${inStock.length === 1 ? "item" : "items"} added to your cart.`
    );
  };

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-900 sm:text-2xl">My Wishlist</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Items you&apos;ve saved for later
            <span className="mx-1.5 text-neutral-300">·</span>
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        {items.length > 0 ? (
          <button
            className="hidden min-h-10 items-center gap-2 rounded-lg border border-brand-green-600 px-4 text-sm font-semibold text-brand-green-600 transition-colors duration-200 active:bg-brand-green-100 hover:bg-brand-green-100 md:inline-flex"
            onClick={handleAddAll}
            type="button"
          >
            <ShoppingCart className="h-4 w-4" />
            Add All to Cart
          </button>
        ) : null}
      </header>

      {items.length === 0 ? (
        <EmptyWishlistState />
      ) : (
        <>
          <WishlistToolbar count={items.length} onSortChange={setSort} sort={sort} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((item) => (
              <WishlistProductCard
                item={item}
                key={item.id}
                onAddToCart={handleAddToCart}
                onRemove={handleRemove}
                removing={removingId === item.id}
              />
            ))}
          </div>

          <BulkAddToCartBar count={inStockCount} onAddAll={handleAddAll} />
        </>
      )}

      <div
        className={cn(
          "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+0.75rem)] z-40 mx-auto flex w-[calc(100%-2rem)] max-w-sm items-center justify-between gap-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm text-white shadow-lg transition-all duration-200 md:bottom-6",
          lastRemoved ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        )}
        role="status"
      >
        <span>Removed from wishlist</span>
        <button
          className="min-h-9 shrink-0 rounded-md px-2 text-sm font-semibold text-brand-green-600 transition-colors duration-200 active:bg-white/10"
          onClick={handleUndo}
          type="button"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
