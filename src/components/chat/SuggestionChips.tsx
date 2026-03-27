import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Give yield insights",
  "Should I irrigate today?",
  "Weather risks",
  "Crop recommendations",
] as const;

export function SuggestionChips({
  onPick,
  disabled,
  className,
}: {
  onPick: (text: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold border transition-all",
            "bg-background/70 border-border text-foreground/80 hover:bg-emerald-500/10 hover:border-emerald-600/25 hover:text-foreground",
            "disabled:opacity-50 disabled:pointer-events-none"
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

