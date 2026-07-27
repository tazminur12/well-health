import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CTABannerProps = {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  href?: string;
  buttonClassName?: string;
  buttonIcon?: ReactNode;
  /** `brand` = solid dark green. `soft` = warm cream/gold (contrasts footer green). */
  variant?: "brand" | "soft";
};

export function CTABanner({
  title = "Ready to Start Your Wellness Journey?",
  subtitle = "Explore premium supplements built with care, quality, and science at the center.",
  buttonLabel = "Shop Now",
  href = "/shop",
  buttonClassName,
  buttonIcon,
  variant = "brand",
}: CTABannerProps) {
  const isSoft = variant === "soft";

  const resolvedButtonClass =
    buttonClassName ??
    (isSoft
      ? "bg-brand-green-900 text-white hover:bg-brand-green-600"
      : "bg-gold-accent text-brand-green-900 hover:bg-[#b88f3f]");

  return (
    <section
      className={cn(
        "relative overflow-hidden py-16 sm:py-20 lg:py-24",
        isSoft
          ? "border-y border-[#E6DCC8] bg-gradient-to-br from-[#FBF7F0] via-[#F5EFE3] to-[#EDE4D4]"
          : "bg-brand-green-900"
      )}
    >
      {isSoft ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,162,75,0.22),_transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(201,162,75,0.1),_transparent_50%)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C9A24B] via-[#E0C378] to-[#A8843A]"
          />
        </>
      ) : null}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {isSoft ? (
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A8843A]">
              Next step
            </p>
          ) : null}
          <h2
            className={cn(
              "font-heading text-3xl font-bold tracking-tight sm:text-4xl",
              isSoft ? "mt-3 text-neutral-900" : "text-white"
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mt-4 text-base leading-8 sm:text-lg",
              isSoft ? "text-neutral-600" : "text-white/80"
            )}
          >
            {subtitle}
          </p>

          <div className="mt-8">
            <Link
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                resolvedButtonClass
              )}
              href={href}
            >
              {buttonIcon ? <span className="mr-2">{buttonIcon}</span> : null}
              {buttonLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
