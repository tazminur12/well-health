"use client";

import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Package2,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useWishlistAuth } from "@/components/public/wishlist-provider";
import { confirmAction, showSuccess } from "@/lib/alerts";
import { formatPrice } from "@/lib/format-price";
import { removeWishlistItemAction } from "@/lib/wishlist/actions";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

type SortOption = "recent" | "price-asc" | "price-desc" | "name";

export function WishlistPageClient() {
  const isAuthenticated = useWishlistAuth();
  const items = useWishlistStore((state) => state.items);
  const hydrated = useWishlistStore((state) => state.hydrated);
  const removeFromStore = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clear);
  const addToCart = useCartStore((state) => state.addItem);

  const [mounted, setMounted] = useState(false);
  const [sort, setSort] = useState<SortOption>("recent");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sorted = useMemo(() => {
    const copy = [...items];
    switch (sort) {
      case "price-asc":
        return copy.sort((a, b) => a.price - b.price);
      case "price-desc":
        return copy.sort((a, b) => b.price - a.price);
      case "name":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return copy.sort((a, b) => b.addedAt - a.addedAt);
    }
  }, [items, sort]);

  const inStockItems = items.filter((item) => item.inStock);
  const estimatedValue = items.reduce((sum, item) => sum + item.price, 0);

  async function syncRemove(productId: string) {
    removeFromStore(productId);
    if (isAuthenticated) {
      await removeWishlistItemAction({ productId });
    }
  }

  async function handleRemove(productId: string, name: string) {
    setRemovingId(productId);
    window.setTimeout(() => {
      void (async () => {
        await syncRemove(productId);
        setRemovingId(null);
        await showSuccess("Removed", `${name} was removed from your wishlist.`);
      })();
    }, 180);
  }

  async function handleClearAll() {
    const ok = await confirmAction({
      title: "Clear your wishlist?",
      text: "All saved items will be removed.",
      confirmText: "Clear wishlist",
      cancelText: "Keep items",
      icon: "warning",
    });
    if (!ok) return;

    const ids = items.map((item) => item.productId);
    clearWishlist();
    if (isAuthenticated) {
      await Promise.all(ids.map((productId) => removeWishlistItemAction({ productId })));
    }
    await showSuccess("Wishlist cleared", "Your saved list is empty again.");
  }

  async function handleAddToCart(productId: string) {
    const item = items.find((row) => row.productId === productId);
    if (!item || !item.inStock) return;
    addToCart({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
    await showSuccess("Added to cart", `${item.name} is ready in your cart.`);
  }

  async function handleAddAllToCart() {
    if (inStockItems.length === 0) return;
    inStockItems.forEach((item) => {
      addToCart({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      });
    });
    await showSuccess(
      "Added to cart",
      `${inStockItems.length} ${inStockItems.length === 1 ? "item" : "items"} moved to your cart.`
    );
  }

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.07),_transparent_40%),linear-gradient(to_bottom,_#ffffff,_#f7f8f9_45%,_#f7f8f9)] text-neutral-900">
      <section className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Link className="transition-colors hover:text-brand-green-700" href="/">
              Home
            </Link>
            <span>/</span>
            <Link className="transition-colors hover:text-brand-green-700" href="/shop">
              Shop
            </Link>
            <span>/</span>
            <span className="font-medium text-brand-green-700">Wishlist</span>
          </nav>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                My Wishlist
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                {items.length === 0
                  ? "Save products you love and come back anytime."
                  : `${items.length} saved ${items.length === 1 ? "item" : "items"} · ${formatPrice(estimatedValue)} total value`}
              </p>
            </div>
            {items.length > 0 ? (
              <Link
                className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-brand-green-700 transition-colors hover:text-brand-green-900"
                href="/shop"
              >
                Continue shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="pb-28 pt-8 sm:pb-12 sm:pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <h2 className="font-heading text-base font-bold text-neutral-900">
                      Saved products
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {inStockItems.length} in stock
                      {items.length - inStockItems.length > 0
                        ? ` · ${items.length - inStockItems.length} out of stock`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label="Sort wishlist"
                      className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                      onChange={(event) => setSort(event.target.value as SortOption)}
                      value={sort}
                    >
                      <option value="recent">Recently added</option>
                      <option value="price-asc">Price: low to high</option>
                      <option value="price-desc">Price: high to low</option>
                      <option value="name">Name A–Z</option>
                    </select>
                    <button
                      className="h-10 rounded-xl px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      onClick={() => void handleClearAll()}
                      type="button"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {sorted.map((item) => (
                    <li key={item.productId}>
                      <article
                        className={cn(
                          "flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200",
                          removingId === item.productId && "scale-95 opacity-0"
                        )}
                      >
                        <div className="relative bg-neutral-50 p-3">
                          <button
                            aria-label={`Remove ${item.name}`}
                            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm transition-transform hover:scale-105"
                            onClick={() => void handleRemove(item.productId, item.name)}
                            type="button"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                          <Link className="block" href={`/shop/${item.slug}`}>
                            <div
                              className={cn(
                                "relative flex aspect-square items-center justify-center overflow-hidden rounded-xl",
                                item.imageTone ||
                                  "bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.1),_transparent_50%),linear-gradient(160deg,_#f8faf9_0%,_#eef2f0_100%)]"
                              )}
                            >
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  src={item.imageUrl}
                                />
                              ) : (
                                <Package2 className="h-10 w-10 text-brand-green-600" />
                              )}
                              {!item.inStock ? (
                                <span className="absolute inset-x-0 bottom-0 bg-neutral-900/80 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                                  Out of stock
                                </span>
                              ) : null}
                            </div>
                          </Link>
                        </div>

                        <div className="flex flex-1 flex-col gap-1.5 p-4">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-green-600">
                            {item.category}
                          </p>
                          <Link href={`/shop/${item.slug}`}>
                            <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors hover:text-brand-green-700">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="mt-auto pt-2 font-heading text-lg font-bold text-brand-green-700">
                            {formatPrice(item.price)}
                          </p>
                          <button
                            className={cn(
                              "mt-2 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors",
                              item.inStock
                                ? "bg-brand-green-600 text-white hover:bg-brand-green-900"
                                : "cursor-not-allowed bg-neutral-100 text-neutral-400"
                            )}
                            disabled={!item.inStock}
                            onClick={() => void handleAddToCart(item.productId)}
                            type="button"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {item.inStock ? "Add to cart" : "Out of stock"}
                          </button>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="space-y-4 lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="border-b border-neutral-100 bg-gradient-to-br from-brand-green-50/60 to-white px-5 py-4">
                    <h2 className="font-heading text-lg font-bold text-neutral-900">
                      Wishlist summary
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Move favourites to your cart when ready
                    </p>
                  </div>

                  <div className="space-y-4 px-5 py-5">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Saved items</span>
                        <span className="font-semibold text-neutral-900">{items.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>In stock</span>
                        <span className="font-semibold text-neutral-900">
                          {inStockItems.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Estimated value</span>
                        <span className="font-semibold text-neutral-900">
                          {formatPrice(estimatedValue)}
                        </span>
                      </div>
                    </div>

                    <button
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-900 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={inStockItems.length === 0}
                      onClick={() => void handleAddAllToCart()}
                      type="button"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add all in stock to cart
                    </button>

                    <Link
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 transition-colors hover:border-brand-green-600/40 hover:bg-brand-green-50 hover:text-brand-green-800"
                      href="/cart"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      View cart
                    </Link>

                    <Link
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-brand-green-600 text-sm font-semibold text-brand-green-700 transition-colors hover:bg-brand-green-50"
                      href="/shop"
                    >
                      Continue shopping
                    </Link>

                    <p className="text-center text-[11px] leading-relaxed text-neutral-400">
                      {isAuthenticated
                        ? "Your wishlist is synced to your Well Health account."
                        : "Saved on this device. Sign in to keep your wishlist across devices."}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      {items.length > 0 && inStockItems.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-500">{inStockItems.length} ready to buy</p>
              <p className="font-heading text-lg font-bold text-brand-green-700">
                {formatPrice(inStockItems.reduce((sum, item) => sum + item.price, 0))}
              </p>
            </div>
            <button
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white"
              onClick={() => void handleAddAllToCart()}
              type="button"
            >
              Add to cart
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
        <Heart className="h-8 w-8" />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-bold text-neutral-900">
        Your wishlist is empty
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        Tap the heart on any product to save it here. Build a list of supplements you want to try
        next.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-green-900"
          href="/shop"
        >
          Browse products
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 transition-colors hover:border-brand-green-600/40 hover:bg-brand-green-50"
          href="/cart"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}
