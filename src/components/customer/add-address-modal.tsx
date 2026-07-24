"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  bdDivisions,
  getBdDistricts,
  getBdDivisionForDistrict,
  getBdThanas,
  type CustomerAddress,
} from "@/components/customer/address-card";

type AddAddressModalProps = {
  open: boolean;
  address: CustomerAddress | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (address: Omit<CustomerAddress, "id"> & { id?: string }) => void | Promise<void>;
};

const emptyForm = {
  fullName: "",
  phone: "",
  division: "",
  district: "",
  area: "",
  details: "",
  isDefault: false,
};

export function AddAddressModal({
  open,
  address,
  isSaving = false,
  onClose,
  onSave,
}: AddAddressModalProps) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    if (address) {
      setForm({
        fullName: address.fullName,
        phone: address.phone,
        division: getBdDivisionForDistrict(address.district),
        district: address.district,
        area: address.area,
        details: address.details,
        isDefault: address.isDefault,
      });
    } else {
      setForm(emptyForm);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [address, isSaving, onClose, open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    const { division, ...addressFields } = form;
    void division;
    await onSave({
      id: address?.id,
      ...addressFields,
    });
  }

  const fieldClass =
    "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-[2px]"
        onClick={() => {
          if (!isSaving) onClose();
        }}
        type="button"
      />

      <div
        aria-labelledby="address-modal-title"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
          <h3 className="font-heading text-base font-bold text-neutral-900" id="address-modal-title">
            {address ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
            disabled={isSaving}
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
            <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 transition-all duration-200 focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-600/20">
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
            <label className="text-sm font-medium text-neutral-700" htmlFor="addr-division">
              Division
            </label>
            <select
              className={fieldClass}
              id="addr-division"
              onChange={(event) =>
                setForm((f) => ({
                  ...f,
                  division: event.target.value,
                  district: "",
                  area: "",
                }))
              }
              required
              value={form.division}
            >
              <option disabled value="">
                Select division
              </option>
              {bdDivisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700" htmlFor="addr-district">
              District
            </label>
            <select
              className={fieldClass}
              disabled={!form.division}
              id="addr-district"
              onChange={(event) =>
                setForm((f) => ({ ...f, district: event.target.value, area: "" }))
              }
              required
              value={form.district}
            >
              <option disabled value="">
                {form.division ? "Select district" : "Select division first"}
              </option>
              {getBdDistricts(form.division).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
              {form.district &&
              !getBdDistricts(form.division).includes(form.district) ? (
                <option value={form.district}>{form.district}</option>
              ) : null}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700" htmlFor="addr-area">
              Area / Thana
            </label>
            <select
              className={fieldClass}
              disabled={!form.district}
              id="addr-area"
              onChange={(event) => setForm((f) => ({ ...f, area: event.target.value }))}
              required
              value={form.area}
            >
              <option disabled value="">
                {form.district ? "Select thana" : "Select district first"}
              </option>
              {getBdThanas(form.district).map((thana) => (
                <option key={thana} value={thana}>
                  {thana}
                </option>
              ))}
              {form.area && !getBdThanas(form.district).includes(form.area) ? (
                <option value={form.area}>{form.area}</option>
              ) : null}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700" htmlFor="addr-details">
              Detailed Address
            </label>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
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
            className="min-h-11 rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white hover:bg-brand-green-900 disabled:opacity-50"
            disabled={isSaving}
            onClick={handleSubmit}
            type="button"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {address ? "Save Address" : "Add Address"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
