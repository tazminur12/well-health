"use client";

import { Loader2 } from "lucide-react";
import { useTransition, type ComponentProps, type ReactNode } from "react";

import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
} & Omit<ComponentProps<"button">, "onClick" | "type" | "children" | "className">;

export function LogoutButton({ children, className, onClick, ...props }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={cn(className)}
      disabled={isPending || props.disabled}
      onClick={() => {
        onClick?.();
        startTransition(async () => {
          await logoutAction();
        });
      }}
      type="button"
      {...props}
    >
      {isPending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : children}
    </button>
  );
}
