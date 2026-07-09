"use client";

import { Smile, Send } from "lucide-react";

type ChatInputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function ChatInputBar({ value, onChange, onSend }: ChatInputBarProps) {
  const canSend = value.trim().length > 0;

  return (
    <form
      className="border-t border-neutral-200 bg-white p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
    >
      <div className="flex items-center gap-2">
        <button
          aria-label="Add emoji"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900"
          type="button"
        >
          <Smile className="h-5 w-5" />
        </button>

        <input
          className="h-11 flex-1 rounded-full bg-neutral-100 px-4 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-brand-green-100"
          placeholder="Type your message..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) onSend();
            }
          }}
        />

        <button
          aria-label="Send message"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green-600 text-white transition-all duration-200 hover:bg-brand-green-900 disabled:cursor-not-allowed disabled:bg-neutral-300"
          disabled={!canSend}
          type="submit"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>
    </form>
  );
}