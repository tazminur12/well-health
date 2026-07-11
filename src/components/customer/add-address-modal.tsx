"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  bdDistricts,
  type CustomerAddress,
} from "@/components/customer/address-card";
import { cn } from "@/lib/utils";

type AddAddressModalProps = {
  open: boolean;
  address: CustomerAddress | null;
  onClose: () => void;
  onSave: (address: CustomerAddress) => void;
};

const emptyForm = {
  fullName: "",
  phone: "",
  district: "",
  area: "",
  details: "",
  isDefault: false,
};

export function AddAddressModal({ open, address, onClose, onSave }: AddAddressModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (address) {
      setForm({
        fullName: address.fullName,
        phone: address.phone,
        district: address.district,
        area: address.area,
        details: address.details,
        isDefault: address.isDefault,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, address]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      id: address?.id ?? `addr-${Date.now()}`,
      ...form,
    });
  };

  const fieldClass =
    "h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-100";

  return (
    <div
      aria-hidden={!open}
      className={cn("fixed inset-0 z-[60]", open ? "pointer-events-auto" : "pointer-events-none")}
    >
      <button
        aria-label="Close"
        className={cn(
          "absolute inset-0 bg-neutral-950/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        type="button"
      />

      <div className="absolute inset-0 flex items-end justify-center sm:items-center">
        <div
          className={cn(
            "flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-xl transition-transform duration-200 sm:max-w-md sm:rounded-2xl",
            open ? "translate-y-0" : "translate-y-full sm:translate-y-4"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
            <h3 className="font-heading text-base font-bold text-neutral-900">
              {address ? "Edit Address" : "Add New Address"}
            </h3>
            <button
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="flex-1 space-y-4 overflow-y-auto px-5 py-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="addr-name">
                Full Name
              </label>
              <input
                className={fieldClass}
                id="addr-name"
                onChange={(event) => setForm((f) => ({ ...f, fullName: event.target.value }))}
                required
                value={form.fullName}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="addr-phone">
                Phone
              </label>
              <div className="flex h-11 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 transition-all duration-200 focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-100">
                <span className="inline-flex h-6 items-center rounded-md bg-neutral-100 px-2 text-xs font-medium text-neutral-600">
                  +880
                </span>
                <input
                  className="h-full w-full border-none bg-transparent p-0 text-sm text-neutral-800 outline-none"
                  id="addr-phone"
                  inputMode="tel"
                  onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
                  placeholder="1XXXXXXXXX"
                  required
                  value={form.phone}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="addr-district">
                District
              </label>
              <select
                className={fieldClass}
                id="addr-district"
                onChange={(event) => setForm((f) => ({ ...f, district: event.target.value }))}
                required
                value={form.district}
              >
                <option disabled value="">
                  Select district
                </option>
                {bdDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="addr-area">
                Area / Thana
              </label>
              <input
                className={fieldClass}
                id="addr-area"
                onChange={(event) => setForm((f) => ({ ...f, area: event.target.value }))}
                required
                value={form.area}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="addr-details">
                Detailed Address
              </label>
              <textarea
                className="min-h-[88px] w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-100"
                id="addr-details"
                onChange={(event) => setForm((f) => ({ ...f, details: event.target.value }))}
                placeholder="House / Road / Landmark"
                required
                value={form.details}
              />
            </div>

            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                checked={form.isDefault}
                className="h-5 w-5 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
                onChange={(event) => setForm((f) => ({ ...f, isDefault: event.target.checked }))}
                type="checkbox"
              />
              <span className="text-sm text-neutral-700">Set as default address</span>
            </label>
          </form>

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-lg border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-brand-green-600 px-5 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900 hover:bg-brand-green-900"
              onClick={handleSubmit}
              type="button"
            >
              {address ? "Save Address" : "Add Address"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
