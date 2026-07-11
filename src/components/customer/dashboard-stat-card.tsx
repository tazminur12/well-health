import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  icon: LucideIcon;
  iconClassName: string;
  value: string;
  label: string;
  className?: string;
};

export function DashboardStatCard({
  icon: Icon,
  iconClassName,
  value,
  label,
  className,
}: DashboardStatCardProps) {
  return (
    <article
      className={cn(
        "w-[140px] shrink-0 snap-start rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:w-auto",
        className
      )}
    >
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", iconClassName)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="mt-3 font-heading text-xl font-bold tracking-tight text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </article>
  );
}
