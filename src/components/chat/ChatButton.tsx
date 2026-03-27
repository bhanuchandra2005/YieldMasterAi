import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatButton({
  open,
  onClick,
  unread = 0,
  className,
}: {
  open: boolean;
  onClick: () => void;
  unread?: number;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "fixed bottom-5 right-5 z-[60] grid place-items-center",
        "h-12 w-12 rounded-2xl text-white",
        "bg-emerald-600 shadow-lg shadow-emerald-600/25",
        "hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label={open ? "Close chat" : "Open chat"}
    >
      <MessageCircle className="h-5 w-5" />
      {unread > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center ring-2 ring-background">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </motion.button>
  );
}

