"use client";

import { ShoppingCart } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { AuthToast } from "@/components/auth/auth-toast";
import { BulkAddToCartBar } from "@/components/customer/bulk-add-to-cart-bar";
import { EmptyWishlistState } from "@/components/customer/empty-wishlist-state";
import { WishlistProductCard } from "@/components/customer/wishlist-product-card";
import { WishlistToolbar } from "@/components/customer/wishlist-toolbar";
import {
  sortWishlist,
  wishlistItems as initialItems,
  type WishlistItem,
  type WishlistSort,
} from "@/components/customer/wishlist-data";
import { cn } from "@/lib/utils";

export function CustomerWishlist() {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [sort, setSort] = useState<WishlistSort>("recent");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<WishlistItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const removeTimer = useRef<number | null>(null);
  const undoTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  const sorted = useMemo(() => sortWishlist(items, sort), [items, sort]);
  const inStockCount = items.filter((item) => item.inStock).length;

  const showToast = (message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const handleRemove = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    setRemovingId(id);

    if (removeTimer.current) window.clearTimeout(removeTimer.current);
    removeTimer.current = window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
      setRemovingId(null);
      setLastRemoved(target);

      if (undoTimer.current) window.clearTimeout(undoTimer.current);
      undoTimer.current = window.setTimeout(() => setLastRemoved(null), 4000);
    }, 220);
  };

  const handleUndo = () => {
    if (!lastRemoved) return;
    setItems((current) => [...current, lastRemoved]);
    setLastRemoved(null);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
  };

  const handleAddToCart = (item: WishlistItem) => {
    showToast(`${item.name} added to cart`);
  };

  const handleAddAll = () => {
    showToast(`${inStockCount} items added to cart`);
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

      {/* Remove + Undo snackbar (mobile sits above the bottom tab bar) */}
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

      <AuthToast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
