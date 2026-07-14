import Image from "next/image";
import Link from "next/link";

import {
  BRAND_LOGO,
  BRAND_NAME,
  BRAND_NAME_SHORT,
  BRAND_TAGLINE,
} from "@/lib/branding";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string | null;
  /** `full` = wordmark + icon. `mark` = icon only. `lockup` = mark + short text. */
  variant?: "full" | "mark" | "lockup";
  /** Visual density for navbar / footer / sidebar shells. */
  size?: "sm" | "md" | "lg";
  /** `light` for white/page backgrounds; `dark` for green/navy shells. */
  tone?: "light" | "dark";
  /** Optional subtitle under lockup text (e.g. Admin Panel). */
  subtitle?: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

const sizeMap = {
  sm: {
    mark: "h-9 w-9",
    markImg: 36,
    full: "h-10 w-auto max-w-[168px] sm:h-11 sm:max-w-[200px]",
    fullW: 200,
    fullH: 74,
    title: "text-sm",
    subtitle: "text-[11px]",
  },
  md: {
    mark: "h-11 w-11",
    markImg: 44,
    full: "h-11 w-auto max-w-[190px] sm:h-12 sm:max-w-[230px]",
    fullW: 230,
    fullH: 86,
    title: "text-sm sm:text-[15px]",
    subtitle: "text-xs",
  },
  lg: {
    mark: "h-12 w-12",
    markImg: 48,
    full: "h-14 w-auto max-w-[240px] sm:h-16 sm:max-w-[280px]",
    fullW: 280,
    fullH: 104,
    title: "text-base",
    subtitle: "text-xs",
  },
} as const;

export function BrandLogo({
  href = "/",
  variant = "full",
  size = "md",
  tone = "light",
  subtitle,
  className,
  priority = false,
  onClick,
}: BrandLogoProps) {
  const dim = sizeMap[size];
  const isDark = tone === "dark";

  const mark = (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
        dim.mark,
        isDark ? "bg-white shadow-sm ring-1 ring-white/20" : "bg-white"
      )}
    >
      <Image
        alt={`${BRAND_NAME} mark`}
        className="object-contain p-1"
        height={dim.markImg}
        priority={priority}
        src={BRAND_LOGO.mark}
        width={dim.markImg}
      />
    </span>
  );

  const full = (
    <span
      className={cn(
        "relative inline-flex items-center overflow-hidden",
        dim.full,
        isDark && "rounded-xl bg-white/95 px-2 py-1 shadow-sm ring-1 ring-white/15"
      )}
    >
      <Image
        alt={BRAND_NAME}
        className="h-full w-auto object-contain object-left"
        height={dim.fullH}
        priority={priority}
        src={BRAND_LOGO.full}
        width={dim.fullW}
      />
    </span>
  );

  const lockup = (
    <span className="inline-flex min-w-0 items-center gap-2.5 sm:gap-3">
      {mark}
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            "block truncate font-heading font-bold tracking-[0.12em]",
            dim.title,
            isDark ? "text-white" : "text-brand-green-900"
          )}
        >
          {BRAND_NAME_SHORT.toUpperCase()}
        </span>
        <span
          className={cn(
            "block truncate",
            dim.subtitle,
            isDark ? "text-white/60" : "text-neutral-500"
          )}
        >
          {subtitle ?? BRAND_TAGLINE}
        </span>
      </span>
    </span>
  );

  const content =
    variant === "mark" ? mark : variant === "lockup" ? lockup : full;

  if (!href) {
    return <span className={cn("inline-flex items-center", className)}>{content}</span>;
  }

  return (
    <Link
      aria-label={BRAND_NAME}
      className={cn(
        "inline-flex items-center transition-opacity duration-200 hover:opacity-90 active:opacity-80",
        className
      )}
      href={href}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
