"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

import { ChatBubbleIcon } from "@/components/chat/chat-bubble-icon";
import { type ChatMessageData } from "@/components/chat/chat-message";
import { ChatPanel } from "@/components/chat/chat-panel";

type ToastState = {
  visible: boolean;
  message: ChatMessageData | null;
};

const initialMessages: ChatMessageData[] = [
  {
    id: "msg-1",
    sender: "support",
    text: "Hello! 👋 Welcome to Well Health Trade International. How can we help you today?",
    timestamp: "09:12 AM",
  },
  {
    id: "msg-2",
    sender: "customer",
    text: "Hi, I want to know more about Eyecare-B and delivery options.",
    timestamp: "09:13 AM",
  },
  {
    id: "msg-3",
    sender: "support",
    text: "Certainly. Eyecare-B is one of our most requested products and we usually ship within 24 hours in Dhaka.",
    timestamp: "09:14 AM",
  },
  {
    id: "msg-4",
    sender: "customer",
    text: "Great, thanks. Is cash on delivery available?",
    timestamp: "09:15 AM",
  },
  {
    id: "msg-5",
    sender: "support",
    text: "Yes, COD is available for selected locations. We can also help you track your order after checkout.",
    timestamp: "09:16 AM",
  },
];

const quickReplies = ["Track my order", "Product questions", "Shipping info"];

function buildMessage(text: string, sender: ChatMessageData["sender"]): ChatMessageData {
  return {
    id: `${sender}-${Date.now()}`,
    sender,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: null });
  const [showQuickReplies, setShowQuickReplies] = useState(false);

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

    const timer = window.setTimeout(() => {
      setTyping(true);

      window.setTimeout(() => {
        const incomingMessage = buildMessage(
          "One of our team members can guide you on the best supplement options for your needs.",
          "support"
        );

        setMessages((current) => [...current, incomingMessage]);
        setTyping(false);
        setShowQuickReplies(false);

        if (!open) {
          setUnreadCount((current) => current + 1);
          setToast({ visible: true, message: incomingMessage });

          window.setTimeout(() => {
            setToast({ visible: false, message: null });
          }, 4500);
        }
      }, 1400);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [hideWidget, open]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      setToast({ visible: false, message: null });
    }
  }, [open]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, buildMessage(trimmed, "customer")]);
    setInput("");
    setShowQuickReplies(false);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setShowQuickReplies(false);
  };

  const visibleQuickReplies = useMemo(() => showQuickReplies && messages.length <= 1, [messages.length, showQuickReplies]);

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
                {toast.message.text.length > 72 ? `${toast.message.text.slice(0, 72)}...` : toast.message.text}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}