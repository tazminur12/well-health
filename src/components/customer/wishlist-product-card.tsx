"use client";

import Link from "next/link";
import { Heart, Package2, ShoppingCart } from "lucide-react";

import { formatPrice } from "@/lib/format-price";
import type { WishlistItem } from "@/components/customer/wishlist-data";
import { cn } from "@/lib/utils";

type WishlistProductCardProps = {
  item: WishlistItem;
  removing: boolean;
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
};

export function WishlistProductCard({
  item,
  removing,
  onRemove,
  onAddToCart,
}: WishlistProductCardProps) {
  const href = `/shop/${item.slug}`;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 active:scale-[0.98]",
        removing ? "scale-90 opacity-0" : "scale-100 opacity-100"
      )}
    >
      <div className="relative bg-neutral-100 p-4">
        <button
          aria-label={`Remove ${item.name} from wishlist`}
          className="absolute right-2.5 top-2.5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm transition-transform duration-200 active:scale-90"
          onClick={() => onRemove(item.id)}
          type="button"
        >
          <Heart className="h-4 w-4 fill-current" />
        </button>

        <Link className="block" href={href}>
          <div
            className={cn(
              "relative flex aspect-square items-center justify-center overflow-hidden rounded-lg",
              item.imageTone ||
                "bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.1),_transparent_50%),linear-gradient(160deg,_#f8faf9_0%,_#eef2f0_100%)]"
            )}
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={item.name} className="h-full w-full object-cover" src={item.imageUrl} />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
                <Package2 className="h-7 w-7 text-brand-green-600" />
              </span>
            )}
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link className="block" href={href}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">
            {item.name}
          </h3>
        </Link>
        <p className="text-xs text-neutral-500">{item.category}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <p className="text-base font-bold text-brand-green-600">{formatPrice(item.price)}</p>
          {!item.inStock ? (
            <span className="text-xs font-semibold text-red-600">Out of Stock</span>
          ) : null}
        </div>

        <button
          className={cn(
            "mt-2 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200",
            item.inStock
              ? "bg-brand-green-600 text-white active:bg-brand-green-900 hover:bg-brand-green-900"
              : "cursor-not-allowed bg-neutral-100 text-neutral-400"
          )}
          disabled={!item.inStock}
          onClick={() => onAddToCart(item)}
          type="button"
        >
          {item.inStock ? (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </>
          ) : (
            "Out of Stock"
          )}
        </button>
      </div>
    </article>
  );
}
