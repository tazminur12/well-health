import Link from "next/link";
import { Heart } from "lucide-react";

export function EmptyWishlistState() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm">
      <Heart className="h-14 w-14 text-neutral-300" strokeWidth={1.5} />
      <h3 className="mt-4 font-heading text-lg font-bold text-neutral-900">
        Your wishlist is empty
      </h3>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">
        Save items you love and they&apos;ll show up here
      </p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-green-600 px-6 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900 hover:bg-brand-green-900"
        href="/shop"
      >
        Browse Products
      </Link>
    </div>
  );
}
