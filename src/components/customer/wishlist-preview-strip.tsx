import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type WishlistPreviewItem = {
  id: string;
  name: string;
  price: number;
  imageTone: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

type WishlistPreviewStripProps = {
  items: WishlistPreviewItem[];
};

export function WishlistPreviewStrip({ items }: WishlistPreviewStripProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-neutral-900">Wishlist</h2>
        <Link
          className="text-sm font-semibold text-brand-green-600 transition-colors duration-200 active:text-brand-green-900 hover:text-brand-green-900"
          href="/wishlist"
        >
          View Wishlist
        </Link>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory md:mx-0 md:px-0">
        {items.map((item) => (
          <Link
            key={item.id}
            className="w-[112px] shrink-0 snap-start transition-opacity duration-200 active:opacity-80"
            href={`/shop/${item.id}`}
          >
            <div
              className={`flex aspect-square items-center justify-center rounded-xl border border-neutral-200 ${item.imageTone}`}
            >
              <span className="px-2 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
                Product
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-medium leading-snug text-neutral-900">
              {item.name}
            </p>
            <p className="mt-1 text-xs font-semibold text-brand-green-600">{formatPrice(item.price)}</p>
          </Link>
        ))}

        <Link
          className="flex w-[112px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-green-600/40 bg-brand-green-100/60 p-3 text-center transition-colors duration-200 active:bg-brand-green-100"
          href="/wishlist"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-green-600 shadow-sm">
            <ChevronRight className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold text-brand-green-600">View Wishlist</span>
        </Link>
      </div>
    </section>
  );
}
