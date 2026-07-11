import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type QuickActionCardProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  className?: string;
};

export function QuickActionCard({ href, icon: Icon, label, className }: QuickActionCardProps) {
  return (
    <Link
      className={cn(
        "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl bg-brand-green-100 p-4 text-center transition-colors duration-200 active:bg-[#d5ebe0] hover:bg-[#dcefe5]",
        className
      )}
      href={href}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-green-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-brand-green-900">{label}</span>
    </Link>
  );
}
