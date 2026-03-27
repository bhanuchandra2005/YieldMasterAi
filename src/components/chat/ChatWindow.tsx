import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MessageBubble, type ChatMessage } from "./MessageBubble";
import { SuggestionChips } from "./SuggestionChips";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-200ms]" />
          <span className="inline-block size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-100ms]" />
          <span className="inline-block size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
        </span>
      </div>
    </div>
  );
}

export function ChatWindow({
  open,
  onClose,
  className,
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
}) {
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  // Mock dashboard metrics for now (can be wired to real stats later)
  const context = useMemo(
    () => ({
      avgYield: 4.2,
      temperatureC: 28,
      rainfallMm: 45,
      predictions: 24,
    }),
    []
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: "assistant",
      ts: Date.now(),
      content:
        "Hi! I’m YieldMaster AI. Ask me about yield insights, irrigation, weather risks, or crop recommendations.",
    },
  ]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || minimized) return;
    // scroll to bottom on open
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [open, minimized]);

  useEffect(() => {
    if (!open || minimized) return;
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [messages.length, open, minimized]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", ts: Date.now(), content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // tiny delay so the typing indicator feels natural
      await new Promise((r) => setTimeout(r, 300));
      const res = await api.chat.send({ message: trimmed, context });
      const botMsg: ChatMessage = { id: uid(), role: "assistant", ts: Date.now(), content: res.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      const botMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        ts: Date.now(),
        content: e?.message ? `I couldn’t respond: ${e.message}` : "I couldn’t respond right now. Please try again.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={cn(
            "fixed bottom-5 right-5 z-[60]",
            "w-[min(420px,calc(100vw-40px))]",
            className
          )}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl border border-border bg-background/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_28px_80px_-44px_rgba(0,0,0,0.55)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card/60">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-2xl bg-emerald-600 text-white grid place-items-center shadow-sm">
                  <Sparkles className="size-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-extrabold tracking-tight text-foreground">YieldMaster AI</div>
                  <div className="text-xs text-muted-foreground">Smart farming assistant</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMinimized((v) => !v)}
                  className="h-9 w-9 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors grid place-items-center"
                  aria-label={minimized ? "Expand chat" : "Minimize chat"}
                >
                  <Minus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 w-9 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors grid place-items-center"
                  aria-label="Close chat"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence initial={false}>
              {!minimized ? (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pt-3">
                    <SuggestionChips onPick={(t) => send(t)} disabled={typing} />
                  </div>

                  <div
                    ref={scrollerRef}
                    className="mt-3 px-4 pb-3 h-[340px] overflow-auto space-y-3"
                  >
                    {messages.map((m) => (
                      <MessageBubble key={m.id} message={m} />
                    ))}
                    {typing ? <TypingIndicator /> : null}
                  </div>

                  {/* Composer */}
                  <div className="border-t border-border bg-card/40 px-3 py-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        send(input);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask YieldMaster AI…"
                        className="h-11 rounded-2xl bg-background/70"
                      />
                      <Button
                        type="submit"
                        disabled={!input.trim() || typing}
                        className="h-11 w-11 rounded-2xl p-0 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                        aria-label="Send"
                      >
                        <Send className="size-4" />
                      </Button>
                    </form>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

