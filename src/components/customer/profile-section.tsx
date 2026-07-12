"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ProfileSectionProps = {
  title: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  headerAction?: ReactNode;
  tone?: "default" | "danger";
  children: ReactNode;
};

export function ProfileSection({
  title,
  icon: Icon,
  defaultOpen = false,
  headerAction,
  tone = "default",
  children,
}: ProfileSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        tone === "danger" ? "border-red-200 bg-red-50/40" : "border-neutral-200"
      )}
    >
      <div className="flex items-center gap-2 px-4 py-1 sm:px-5">
        <button
          aria-controls={contentId}
          aria-expanded={open}
          className="flex min-h-12 flex-1 items-center gap-3 rounded-lg py-2 text-left transition-colors duration-200 active:opacity-70"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {Icon ? (
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                tone === "danger"
                  ? "bg-red-100 text-red-600"
                  : "bg-brand-green-100 text-brand-green-600"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
          ) : null}

          <span
            className={cn(
              "flex-1 font-heading text-base font-bold",
              tone === "danger" ? "text-red-700" : "text-neutral-900"
            )}
          >
            {title}
          </span>

          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        id={contentId}
      >
        <div className="overflow-hidden">
          <div className="border-t border-neutral-200 px-4 py-4 sm:px-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
