"use client";

type ActiveFilterPillsProps = {
  pills: Array<{ label: string; onRemove: () => void }>;
  onClearAll: () => void;
};

export function ActiveFilterPills({ pills, onClearAll }: ActiveFilterPillsProps) {
  if (!pills.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
      {pills.map((pill) => (
        <button
          key={pill.label}
          className="inline-flex items-center gap-2 rounded-full bg-brand-green-100 px-4 py-2 text-sm font-medium text-brand-green-600 transition-colors duration-200 hover:bg-brand-green-200"
          onClick={pill.onRemove}
          type="button"
        >
          {pill.label}
          <span className="text-base leading-none">×</span>
        </button>
      ))}

      <button
        className="text-sm font-semibold text-brand-green-600 underline-offset-4 transition-colors duration-200 hover:underline"
        onClick={onClearAll}
        type="button"
      >
        Clear All
      </button>
    </div>
  );
}