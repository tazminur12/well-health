"use client";

type SortDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const options = ["Newest", "Price Low to High", "Price High to Low", "Most Popular"];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <label className="inline-flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <span className="whitespace-nowrap text-sm font-medium text-neutral-500">Sort by:</span>
      <select
        className="bg-transparent text-sm font-medium text-neutral-900 outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}