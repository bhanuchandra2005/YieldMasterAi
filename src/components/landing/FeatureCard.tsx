import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  microcopy,
  href,
  tone = "emerald",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  microcopy: string;
  href: string;
  tone?: "emerald" | "sky" | "amber" | "violet" | "lime" | "slate";
  className?: string;
}) {
  const toneStyles: Record<string, { ring: string; iconBg: string; iconFg: string; glow: string }> = {
    emerald: {
      ring: "hover:shadow-emerald-500/15",
      iconBg: "bg-emerald-500/10",
      iconFg: "text-emerald-800",
      glow: "from-emerald-600/18 via-emerald-500/10 to-sky-500/10",
    },
    sky: {
      ring: "hover:shadow-sky-500/15",
      iconBg: "bg-sky-500/10",
      iconFg: "text-sky-800",
      glow: "from-sky-600/16 via-sky-500/10 to-emerald-500/10",
    },
    amber: {
      ring: "hover:shadow-amber-500/15",
      iconBg: "bg-amber-500/12",
      iconFg: "text-amber-800",
      glow: "from-amber-600/16 via-amber-500/10 to-emerald-500/10",
    },
    violet: {
      ring: "hover:shadow-violet-500/15",
      iconBg: "bg-violet-500/12",
      iconFg: "text-violet-800",
      glow: "from-violet-600/16 via-violet-500/10 to-sky-500/10",
    },
    lime: {
      ring: "hover:shadow-lime-500/15",
      iconBg: "bg-lime-500/12",
      iconFg: "text-lime-900",
      glow: "from-lime-600/16 via-lime-500/10 to-emerald-500/10",
    },
    slate: {
      ring: "hover:shadow-slate-500/10",
      iconBg: "bg-slate-500/10",
      iconFg: "text-slate-800",
      glow: "from-slate-600/14 via-slate-500/10 to-emerald-500/10",
    },
  };

  const t = toneStyles[tone] ?? toneStyles.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative rounded-2xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_16px_40px_-28px_rgba(0,0,0,0.35)]",
        "transition-[box-shadow,transform,background-color,border-color] duration-300 ease-out",
        t.ring,
        className
      )}
    >
      {/* Gradient border glow */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-[0.5px] transition-opacity duration-300",
          "group-hover:opacity-100"
        )}
        aria-hidden
      >
        <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br", t.glow)} />
      </div>

      {/* Soft spotlight */}
      <div
        className="pointer-events-none absolute -top-28 -right-28 size-72 rounded-full opacity-0 blur-[48px] transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent 62%)" }}
      />

      {/* Subtle top shine */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.20) 18%, rgba(255,255,255,0.0) 55%)",
          maskImage: "linear-gradient(180deg, #000 0%, #000 35%, transparent 70%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 35%, transparent 70%)",
        }}
      />

      {/* Hover shimmer sweep */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: 1 }}
      >
        <div className="absolute -inset-y-10 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute -inset-y-10 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 motion-safe:group-hover:animate-[landing-shimmer_1.15s_ease-out_1] transition-opacity duration-300" />
      </motion.div>

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <motion.div
            className={cn(
              "flex items-center justify-center size-12 rounded-2xl border border-border",
              t.iconBg
            )}
            initial={false}
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
          >
            <motion.div
              initial={false}
              whileHover={{ rotate: -2 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Icon className={cn("size-5", t.iconFg)} />
            </motion.div>
          </motion.div>

          <div className="inline-flex items-center rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            {microcopy}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <div className="mt-5">
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
          >
            <span className="relative">
              Learn more
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-emerald-600/70 transition-all duration-300 group-hover:w-full" />
            </span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

