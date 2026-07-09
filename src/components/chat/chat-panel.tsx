"use client";

import { MessageCircleMore, MoreVertical, X } from "lucide-react";

import { ChatInputBar } from "@/components/chat/chat-input-bar";
import { ChatMessage, type ChatMessageData } from "@/components/chat/chat-message";
import { QuickReplyPills } from "@/components/chat/quick-reply-pills";
import { TypingIndicator } from "@/components/chat/typing-indicator";

type ChatPanelProps = {
  messages: ChatMessageData[];
  input: string;
  typing: boolean;
  quickReplies: string[];
  showQuickReplies: boolean;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onQuickReply: (suggestion: string) => void;
};

export function ChatPanel({
  messages,
  input,
  typing,
  quickReplies,
  showQuickReplies,
  onClose,
  onInputChange,
  onSend,
  onQuickReply,
}: ChatPanelProps) {
  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl transition-all duration-300 ease-out md:bottom-6 md:right-6 md:h-[520px] md:w-[380px] md:rounded-2xl">
      <header className="flex items-center justify-between gap-3 bg-brand-green-600 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
            <MessageCircleMore className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">Well Health Team</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Online
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button aria-label="More options" className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/10" type="button">
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
          <button aria-label="Close chat" className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/10" onClick={onClose} type="button">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-neutral-100 p-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {typing ? <TypingIndicator /> : null}
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white p-3">
        {showQuickReplies ? <QuickReplyPills onSelect={onQuickReply} suggestions={quickReplies} /> : null}
        <ChatInputBar onChange={onInputChange} onSend={onSend} value={input} />
      </div>
    </div>
  );
}