"use client";

import { ShoppingCart } from "lucide-react";

type BulkAddToCartBarProps = {
  count: number;
  onAddAll: () => void;
};

export function BulkAddToCartBar({ count, onAddAll }: BulkAddToCartBarProps) {
  if (count === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-neutral-200 bg-neutral-100/95 px-4 py-3 backdrop-blur-sm md:hidden">
      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green-600 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900 hover:bg-brand-green-900"
        onClick={onAddAll}
        type="button"
      >
        <ShoppingCart className="h-4 w-4" />
        Add All to Cart ({count})
      </button>
    </div>
  );
}
