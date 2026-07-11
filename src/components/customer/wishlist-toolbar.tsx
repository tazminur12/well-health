"use client";

import { wishlistSortOptions, type WishlistSort } from "@/components/customer/wishlist-data";

type WishlistToolbarProps = {
  count: number;
  sort: WishlistSort;
  onSortChange: (value: WishlistSort) => void;
};

export function WishlistToolbar({ count, sort, onSortChange }: WishlistToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-neutral-500">
        {count} {count === 1 ? "item" : "items"} saved
      </p>

      <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 shadow-sm">
        <span className="whitespace-nowrap text-xs font-medium text-neutral-500">Sort:</span>
        <select
          aria-label="Sort wishlist"
          className="bg-transparent text-sm font-medium text-neutral-900 outline-none"
          onChange={(event) => onSortChange(event.target.value as WishlistSort)}
          value={sort}
        >
          {wishlistSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
