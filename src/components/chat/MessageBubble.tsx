import { cn } from "@/lib/utils";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const time = new Date(message.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-emerald-600 text-white rounded-br-md"
            : "bg-card border border-border text-foreground rounded-bl-md"
        )}
      >
        <div className="whitespace-pre-line">{message.content}</div>
        <div className={cn("mt-1 text-[10px]", isUser ? "text-white/75" : "text-muted-foreground")}>{time}</div>
      </div>
    </div>
  );
}

