import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" ? "text-center mx-auto" : "text-left",
        className
      )}
    >
      {eyebrow ? (
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
            "bg-emerald-500/10 text-emerald-800 border border-emerald-600/15",
            "backdrop-blur"
          )}
        >
          <span className="inline-block size-1.5 rounded-full bg-emerald-600" />
          <span>{eyebrow}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <h2 className={cn("text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground")}>
          {title}{" "}
          {highlight ? (
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-sky-600 bg-clip-text text-transparent">
              {highlight}
            </span>
          ) : null}
        </h2>
        {subtitle ? (
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

