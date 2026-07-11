import Link from "next/link";
import { PackageX } from "lucide-react";

type EmptyOrdersStateProps = {
  title?: string;
  message?: string;
};

export function EmptyOrdersState({
  title = "No orders yet",
  message = "When you place an order, it will appear here",
}: EmptyOrdersStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm">
      <PackageX className="h-14 w-14 text-neutral-300" strokeWidth={1.5} />
      <h3 className="mt-4 font-heading text-lg font-bold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">{message}</p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-green-600 px-6 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900 hover:bg-brand-green-900"
        href="/shop"
      >
        Start Shopping
      </Link>
    </div>
  );
}
