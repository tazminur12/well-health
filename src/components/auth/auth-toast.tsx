"use client";

import { CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthToastProps = {
  message: string | null;
  onClose: () => void;
};

export function AuthToast({ message, onClose }: AuthToastProps) {
  return (
    <div
      className={cn(
        "fixed right-6 top-6 z-[70] flex items-center gap-3 rounded-lg border border-brand-green-200 bg-white px-4 py-3 text-sm text-brand-green-700 shadow-lg transition-all duration-200",
        message ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      )}
      role="status"
    >
      <CheckCircle2 className="h-4 w-4" />
      <p className="font-medium">{message ?? ""}</p>
      <button
        aria-label="Dismiss"
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
        onClick={onClose}
        type="button"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
