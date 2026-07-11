"use client";

import { Camera, CheckCircle2 } from "lucide-react";

type ProfileSummaryCardProps = {
  name: string;
  email: string;
  initials: string;
  memberSince: string;
  verified?: boolean;
  onChangePhoto?: () => void;
};

export function ProfileSummaryCard({
  name,
  email,
  initials,
  memberSince,
  verified = false,
  onChangePhoto,
}: ProfileSummaryCardProps) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="relative shrink-0">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-green-100 font-heading text-2xl font-bold text-brand-green-600">
            {initials}
          </span>

          <button
            aria-label="Change profile photo"
            className="absolute -bottom-0.5 -right-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
            onClick={onChangePhoto}
            type="button"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:items-center">
            <h2 className="font-heading text-lg font-bold text-neutral-900">{name}</h2>
            {verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green-100 px-2 py-0.5 text-xs font-semibold text-brand-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 truncate text-sm text-neutral-500">{email}</p>
          <p className="mt-1 text-xs text-neutral-400">Member since {memberSince}</p>
        </div>
      </div>
    </article>
  );
}
