"use client";

import Link from "next/link";
import { FlaskConical, Package2, ShoppingCart } from "lucide-react";
import { useState, type MouseEvent } from "react";

import { WishlistButton } from "@/components/public/wishlist-button";
import { showSuccess } from "@/lib/alerts";
import { formatPrice } from "@/lib/format-price";
import { getDisplayCompareAt } from "@/lib/products/public-mapper";
import type { PublicProductCard } from "@/lib/products/public-types";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: PublicProductCard;
};

export function ProductCard({ product }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const href = `/shop/${product.slug}`;
  const compareAt = getDisplayCompareAt(product);

  function handleAddToCart(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!product.inStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
    void showSuccess("Added to cart", `${product.name} is ready in your cart.`);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5 hover:border-brand-green-600/50 hover:shadow-md sm:rounded-2xl">
      <div className="relative bg-neutral-50 p-2.5 sm:p-4">
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5 sm:left-3 sm:top-3">
          {product.offerActive && product.offerBadge ? (
            <span className="rounded-full bg-[#C9A24B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {product.offerBadge}
              {product.discountPercent > 0 ? ` ${product.discountPercent}%` : ""}
            </span>
          ) : product.featured ? (
            <span className="rounded-full bg-brand-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Featured
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Out of stock
            </span>
          ) : null}
        </div>

        <WishlistButton
          className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm transition-all duration-200 hover:text-brand-green-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            price: product.price,
            imageUrl: product.imageUrl,
            imageTone: product.imageTone,
            inStock: product.inStock,
          }}
        />

        <Link className="block" href={href}>
          <div
            className={cn(
              "relative flex aspect-square items-center justify-center overflow-hidden rounded-lg sm:rounded-xl",
              product.imageTone ||
                "bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.1),_transparent_42%),linear-gradient(160deg,_#f8faf9_0%,_#eef2f0_100%)]"
            )}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                src={product.imageUrl}
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80 sm:h-20 sm:w-20">
                <Package2 className="h-7 w-7 text-brand-green-600 sm:h-9 sm:w-9" />
              </span>
            )}
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2.5 sm:p-4">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-brand-green-600 sm:text-xs">
          {product.category}
        </p>

        <Link className="block" href={href}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 sm:text-base lg:text-lg">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-2 hidden text-sm leading-6 text-neutral-500 sm:block">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex flex-wrap items-end gap-2 pt-1">
          <p className="text-[15px] font-bold text-brand-green-600 sm:text-lg">
            {formatPrice(product.price)}
          </p>
          {compareAt ? (
            <p className="text-xs text-neutral-400 line-through sm:text-sm">{formatPrice(compareAt)}</p>
          ) : null}
        </div>

        {product.labTested ? (
          <p className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500">
            <FlaskConical className="h-3 w-3 text-brand-green-600" />
            Lab tested
          </p>
        ) : null}

        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            className={cn(
              "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-all duration-200 sm:min-h-11 sm:rounded-xl sm:text-sm",
              product.inStock
                ? "bg-brand-green-600 text-white hover:bg-brand-green-900"
                : "cursor-not-allowed bg-neutral-200 text-neutral-500"
            )}
            disabled={!product.inStock}
            onClick={handleAddToCart}
            type="button"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {justAdded ? "Added" : "Cart"}
          </button>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-green-600 px-2 text-xs font-semibold tracking-wide text-brand-green-600 transition-all duration-200 hover:bg-brand-green-100 sm:min-h-11 sm:rounded-xl sm:text-sm"
            href={href}
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
