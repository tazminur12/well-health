"use client";

import Link from "next/link";
import { Heart, Package2, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductListItemProps = {
  name: string;
  description: string;
  price: string;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductListItem({ name, description, price }: ProductListItemProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const href = `/shop/${slugify(name)}`;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 ring-1 ring-neutral-200">
          <Package2 className="h-7 w-7 text-brand-green-600" />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-neutral-900">{name}</h3>
          <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-base font-bold text-brand-green-600 sm:text-lg">{price}</p>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-brand-green-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-sm"
            type="button"
          >
            <ShoppingCart className="h-4 w-4" />
            ADD TO CART
          </button>

          <Link
            className="inline-flex items-center justify-center rounded-lg border border-brand-green-600 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm"
            href={href}
          >
            View Details
          </Link>

          <button
            aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:text-brand-green-600 hover:shadow-sm"
            onClick={() => setIsWishlisted((current) => !current)}
            type="button"
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-rose-500")} />
          </button>
        </div>
      </div>
    </article>
  );
}