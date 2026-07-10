"use client";

import { AlertCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type AuthInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  prefixBadge?: string;
  rightSlot?: React.ReactNode;
};

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, icon: Icon, error, prefixBadge, rightSlot, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const inputId = id ?? fallbackId;

    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700" htmlFor={inputId}>
          {label}
        </label>

        <div
          className={cn(
            "flex h-11 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 transition-all duration-200",
            "focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-100",
            error && "border-red-300 focus-within:border-red-500 focus-within:ring-red-100"
          )}
        >
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-neutral-500" /> : null}

          {prefixBadge ? (
            <span className="inline-flex h-6 items-center rounded-md bg-neutral-100 px-2 text-xs font-medium text-neutral-600">
              {prefixBadge}
            </span>
          ) : null}

          <input
            {...props}
            className={cn("h-full w-full border-none bg-transparent p-0 text-sm text-neutral-800 outline-none", className)}
            id={inputId}
            ref={ref}
          />

          {rightSlot ? <span className="shrink-0">{rightSlot}</span> : null}
        </div>

        {error ? (
          <p className="inline-flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
