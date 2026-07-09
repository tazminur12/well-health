import { cn } from "@/lib/utils";

export type ChatMessageData = {
  id: string;
  sender: "support" | "customer";
  text: string;
  timestamp: string;
};

type ChatMessageProps = {
  message: ChatMessageData;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isSupport = message.sender === "support";

  return (
    <div className={cn("flex", isSupport ? "justify-start" : "justify-end")}>
      <div className={cn("max-w-[75%]", isSupport ? "text-left" : "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
            isSupport
              ? "rounded-bl-md bg-white text-neutral-700"
              : "rounded-br-md bg-brand-green-600 text-white"
          )}
        >
          {message.text}
        </div>
        <p className={cn("mt-1 text-xs text-neutral-400", isSupport ? "text-left" : "text-right")}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}