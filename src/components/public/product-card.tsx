"use client";

import Link from "next/link";
import { Heart, Package2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductCardProps = {
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

export function ProductCard({ name, description, price }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const href = `/shop/${slugify(name)}`;

  return (
    <article className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-green-600 hover:shadow-md">
      <div className="relative bg-neutral-100 p-5">
        <button
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-brand-green-600 hover:shadow-md"
          onClick={() => setIsWishlisted((current) => !current)}
          type="button"
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-rose-500")} />
        </button>

        <div className="flex aspect-square items-center justify-center rounded-t-xl border border-dashed border-neutral-300 bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.08),_transparent_40%),linear-gradient(135deg,_#fafafa_0%,_#f3f4f6_100%)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
            <Package2 className="h-9 w-9 text-brand-green-600" />
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>
          <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
        </div>

        <p className="text-lg font-bold text-brand-green-600">{price}</p>

        <Link
          className="inline-flex w-full items-center justify-center rounded-lg border border-brand-green-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm"
          href={href}
        >
          VIEW DETAILS
        </Link>
      </div>
    </article>
  );
}