"use client";

import { cn } from "@/lib/utils";

type PasswordStrengthIndicatorProps = {
  password: string;
};

function getPasswordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const score = getPasswordScore(password);
  const label = score <= 1 ? "Weak" : score === 2 ? "Medium" : "Strong";

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1.5 rounded-full bg-neutral-200 transition-colors duration-200",
              score >= segment && segment === 1 && "bg-red-500",
              score >= segment && segment === 2 && "bg-amber-500",
              score >= segment && segment === 3 && "bg-brand-green-600"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        Password strength: <span className="font-semibold text-neutral-700">{label}</span>
      </p>
    </div>
  );
}
