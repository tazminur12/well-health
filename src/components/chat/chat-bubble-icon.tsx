"use client";

import { MessageCircle } from "lucide-react";

type ChatBubbleIconProps = {
  badgeCount: number;
  onClick: () => void;
};

export function ChatBubbleIcon({ badgeCount, onClick }: ChatBubbleIconProps) {
  return (
    <button
      aria-label="Open chat"
      className="group fixed bottom-4 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:bottom-6 sm:right-6"
      onClick={onClick}
      type="button"
    >
      <span className="absolute inset-0 rounded-full border border-brand-green-400/40 opacity-70 animate-[ping_3s_ease-out_infinite]" />
      <span className="absolute inset-0 rounded-full border border-brand-green-200/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <MessageCircle className="relative h-6 w-6" />

      {badgeCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold-accent px-1 text-[10px] font-semibold text-white shadow-sm">
          {badgeCount}
        </span>
      ) : null}
    </button>
  );
}