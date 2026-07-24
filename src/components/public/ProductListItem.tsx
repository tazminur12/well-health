"use client";

import Link from "next/link";
import { Package2, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { formatProductStrength } from "@/components/admin/products-data";
import { WishlistButton } from "@/components/public/wishlist-button";
import { showSuccess } from "@/lib/alerts";
import { formatPrice } from "@/lib/format-price";
import { getDisplayCompareAt } from "@/lib/products/public-mapper";
import type { PublicProductCard } from "@/lib/products/public-types";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

type ProductListItemProps = {
  product: PublicProductCard;
};

function productSpecLine(product: PublicProductCard) {
  const strength = formatProductStrength(product.strength, product.strengthUnit);
  const parts = [product.dosageForm, strength, product.packSize].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const href = `/shop/${product.slug}`;
  const compareAt = getDisplayCompareAt(product);
  const specLine = productSpecLine(product);
  const wishlistProduct = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    imageUrl: product.imageUrl,
    imageTone: product.imageTone,
    inStock: product.inStock,
  };

  function handleAddToCart() {
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
    <article className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-brand-green-600/40 hover:shadow-md sm:p-4">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Link
          className={cn(
            "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-neutral-200/80 sm:h-20 sm:w-20",
            !product.imageUrl &&
              (product.imageTone ||
                "bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.1),_transparent_50%),linear-gradient(160deg,_#f8faf9_0%,_#eef2f0_100%)]")
          )}
          href={href}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-full w-full object-cover" src={product.imageUrl} />
          ) : (
            <Package2 className="h-7 w-7 text-brand-green-600 sm:h-8 sm:w-8" />
          )}
          {!product.inStock ? (
            <span className="absolute inset-x-0 bottom-0 bg-neutral-900/75 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-white">
              Sold out
            </span>
          ) : null}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-brand-green-600 sm:text-xs">
                {product.category}
              </p>
              <Link href={href}>
                <h3 className="truncate text-[15px] font-semibold text-neutral-900 sm:text-base">
                  {product.name}
                </h3>
              </Link>
              {specLine ? (
                <p className="mt-0.5 truncate text-[11px] font-medium text-neutral-500 sm:text-xs">
                  {specLine}
                </p>
              ) : null}
              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-neutral-500 sm:mt-1 sm:line-clamp-1 sm:text-sm sm:leading-6">
                {product.shortDescription}
              </p>
            </div>

            <WishlistButton
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all duration-200 hover:border-brand-green-600 hover:text-brand-green-600 sm:hidden"
              product={wishlistProduct}
            />
          </div>

          <div className="mt-3 flex flex-col gap-2.5 sm:mt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-wrap items-end gap-2">
              <p className="text-base font-bold text-brand-green-600 sm:text-lg">
                {formatPrice(product.price)}
              </p>
              {compareAt ? (
                <p className="text-sm text-neutral-400 line-through">{formatPrice(compareAt)}</p>
              ) : null}
              {product.offerActive && product.saveLabel ? (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                  {product.saveLabel}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all duration-200 sm:flex-none sm:px-4 sm:text-sm",
                  product.inStock
                    ? "bg-brand-green-600 text-white hover:bg-brand-green-900"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-500"
                )}
                disabled={!product.inStock}
                onClick={handleAddToCart}
                type="button"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="sm:hidden">{justAdded ? "Added" : "Cart"}</span>
                <span className="hidden sm:inline">{justAdded ? "Added" : "Add to Cart"}</span>
              </button>

              <Link
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-brand-green-600 bg-white px-3 text-xs font-semibold text-brand-green-600 transition-all duration-200 hover:bg-brand-green-100 sm:flex-none sm:px-4 sm:text-sm"
                href={href}
              >
                <span className="sm:hidden">Details</span>
                <span className="hidden sm:inline">View Details</span>
              </Link>

              <WishlistButton
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all duration-200 hover:border-brand-green-600 hover:text-brand-green-600 sm:inline-flex"
                product={wishlistProduct}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
