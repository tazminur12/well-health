"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type DeleteAccountModalProps = {
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onConfirm: (confirmation: "DELETE") => void | Promise<void>;
};

export function DeleteAccountModal({
  open,
  isSaving = false,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [mounted, setMounted] = useState(false);
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setConfirm("");
      return;
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
  }, [isSaving, onClose, open]);

  if (!mounted || !open) return null;

  const canDelete = confirm === "DELETE" && !isSaving;

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
        aria-labelledby="delete-account-title"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
          <h3
            className="flex items-center gap-2 font-heading text-base font-bold text-red-700"
            id="delete-account-title"
          >
            <AlertTriangle className="h-5 w-5" />
            Delete Account
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

        <div className="space-y-4 px-5 py-4">
          <p className="text-sm leading-relaxed text-neutral-600">
            This action is permanent. All your orders, addresses, and wishlist items will be
            removed and cannot be recovered. Type{" "}
            <span className="font-semibold text-neutral-900">DELETE</span> to confirm.
          </p>
          <input
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            disabled={isSaving}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Type DELETE"
            value={confirm}
          />
        </div>

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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canDelete}
            onClick={() => onConfirm("DELETE")}
            type="button"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Delete Account
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
