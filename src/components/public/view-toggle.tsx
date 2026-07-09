"use client";

import { Grid2x2, List } from "lucide-react";

type ViewToggleProps = {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
};

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
      <button
        aria-label="Grid view"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-md transition-all duration-200 ${view === "grid" ? "bg-brand-green-600 text-white" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"}`}
        onClick={() => onChange("grid")}
        type="button"
      >
        <Grid2x2 className="h-4.5 w-4.5" />
      </button>
      <button
        aria-label="List view"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-md transition-all duration-200 ${view === "list" ? "bg-brand-green-600 text-white" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"}`}
        onClick={() => onChange("list")}
        type="button"
      >
        <List className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}