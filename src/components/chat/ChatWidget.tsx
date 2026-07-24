"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

import { ChatBubbleIcon } from "@/components/chat/chat-bubble-icon";
import { type ChatMessageData } from "@/components/chat/chat-message";
import { ChatPanel } from "@/components/chat/chat-panel";
import {
  askChatbotAction,
  getChatbotBootstrapAction,
} from "@/lib/chatbot/actions";

type ToastState = {
  visible: boolean;
  message: ChatMessageData | null;
};

function buildMessage(text: string, sender: ChatMessageData["sender"]): ChatMessageData {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

const DEFAULT_WELCOME =
  "Hello! Welcome to Well Health Trade International. How can we help you today?";

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageData[]>(() => [
    buildMessage(DEFAULT_WELCOME, "support"),
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: null });
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  const isAdminRoute = pathname?.startsWith("/admin");
  const isCustomerAccountRoute =
    pathname === "/dashboard" ||
    pathname?.startsWith("/dashboard/") ||
    pathname === "/orders" ||
    pathname?.startsWith("/orders/") ||
    pathname === "/wishlist" ||
    pathname?.startsWith("/wishlist/") ||
    pathname === "/profile" ||
    pathname?.startsWith("/profile/");
  const hideWidget = isAdminRoute || isCustomerAccountRoute;

  useEffect(() => {
    if (hideWidget) return;

    let cancelled = false;
    void getChatbotBootstrapAction().then((result) => {
      if (cancelled || !result.data) return;
      setQuickReplies(result.data.quickReplies);
      setShowQuickReplies(result.data.quickReplies.length > 0);
      setMessages([buildMessage(result.data.welcome, "support")]);
    });

    return () => {
      cancelled = true;
    };
  }, [hideWidget]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      setToast({ visible: false, message: null });
    }
  }, [open]);

  async function replyTo(text: string) {
    setTyping(true);
    try {
      const result = await askChatbotAction({ message: text });
      const answer =
        result.data?.answer ??
        result.error ??
        "Sorry — something went wrong. Please try again or visit Contact.";
      const botMessage = buildMessage(answer, "support");
      setMessages((current) => [...current, botMessage]);
      if (result.data?.quickReplies?.length) {
        setQuickReplies(result.data.quickReplies);
      }

      if (!open) {
        setUnreadCount((current) => current + 1);
        setToast({ visible: true, message: botMessage });
        window.setTimeout(() => {
          setToast({ visible: false, message: null });
        }, 4500);
      }
    } finally {
      setTyping(false);
    }
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || typing) return;

    setMessages((current) => [...current, buildMessage(trimmed, "customer")]);
    setInput("");
    setShowQuickReplies(false);
    startTransition(() => {
      void replyTo(trimmed);
    });
  }

  function handleQuickReply(reply: string) {
    if (typing) return;
    setMessages((current) => [...current, buildMessage(reply, "customer")]);
    setInput("");
    setShowQuickReplies(false);
    startTransition(() => {
      void replyTo(reply);
    });
  }

  const visibleQuickReplies = useMemo(
    () =>
      showQuickReplies &&
      !typing &&
      messages.filter((m) => m.sender === "customer").length === 0,
    [messages, showQuickReplies, typing]
  );

  if (hideWidget) return null;

  return (
    <>
      {open ? (
        <ChatPanel
          input={input}
          messages={messages}
          onClose={() => setOpen(false)}
          onInputChange={setInput}
          onQuickReply={handleQuickReply}
          onSend={handleSend}
          quickReplies={quickReplies}
          showQuickReplies={visibleQuickReplies}
          typing={typing}
        />
      ) : (
        <ChatBubbleIcon badgeCount={unreadCount} onClick={() => setOpen(true)} />
      )}

      {!open && toast.visible && toast.message ? (
        <div className="fixed bottom-24 right-4 z-50 max-w-[20rem] rounded-xl border border-neutral-200 bg-white p-3 shadow-md sm:bottom-24 sm:right-6">
          <button
            aria-label="Dismiss chat preview"
            className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-700"
            onClick={() => setToast({ visible: false, message: null })}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600">
              <MessageCircle className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900">Well Health Team</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                {toast.message.text.length > 72
                  ? `${toast.message.text.slice(0, 72)}...`
                  : toast.message.text}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
