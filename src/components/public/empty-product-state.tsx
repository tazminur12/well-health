import { PackageX } from "lucide-react";

type EmptyProductStateProps = {
  onClearAll: () => void;
};

export function EmptyProductState({ onClearAll }: EmptyProductStateProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
        <PackageX className="h-10 w-10" />
      </div>

      <h3 className="mt-6 font-heading text-2xl font-bold text-neutral-900">
        No products found
      </h3>
      <p className="mt-3 text-sm leading-7 text-neutral-500">
        Try adjusting your filters to discover more products.
      </p>

      <button
        className="mt-6 inline-flex items-center justify-center rounded-lg border border-brand-green-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm"
        onClick={onClearAll}
        type="button"
      >
        Clear All Filters
      </button>
    </div>
  );
}