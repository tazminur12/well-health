"use client";

import { Pencil, Trash2 } from "lucide-react";

export type CustomerAddress = {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  area: string;
  details: string;
  isDefault: boolean;
};

export const bdDistricts = [
  "Dhaka",
  "Chattogram",
  "Khulna",
  "Rajshahi",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Comilla",
  "Gazipur",
  "Narayanganj",
  "Bogura",
  "Jashore",
  "Cox's Bazar",
];

type AddressCardProps = {
  address: CustomerAddress;
  onEdit: (address: CustomerAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
};

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-neutral-50/40 p-4 transition-colors duration-200 hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-semibold text-neutral-900">{address.fullName}</p>
          {address.isDefault ? (
            <span className="inline-flex shrink-0 rounded-full bg-brand-green-100 px-2 py-0.5 text-[11px] font-semibold text-brand-green-600">
              Default
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label="Edit address"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50 hover:text-neutral-900"
            onClick={() => onEdit(address)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="Delete address"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-colors duration-200 active:bg-red-100 hover:bg-red-50"
            onClick={() => onDelete(address.id)}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-1 text-sm text-neutral-500">+880 {address.phone}</p>
      <p className="mt-2 text-sm text-neutral-700">
        {address.details}, {address.area}, {address.district}
      </p>

      {!address.isDefault ? (
        <button
          className="mt-3 inline-flex min-h-9 items-center text-sm font-semibold text-brand-green-600 transition-colors duration-200 active:text-brand-green-900 hover:text-brand-green-900"
          onClick={() => onSetDefault(address.id)}
          type="button"
        >
          Set as Default
        </button>
      ) : null}
    </article>
  );
}
