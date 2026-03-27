import { motion } from "framer-motion";
import { Activity, CloudSun, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function MiniBarChart() {
  // Pure SVG so we avoid chart libs on landing.
  const bars = [18, 30, 22, 42, 38, 55, 44, 62, 58, 70, 66, 78];
  return (
    <svg viewBox="0 0 240 80" className="w-full h-[80px]" aria-hidden>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(16,185,129,0.65)" />
          <stop offset="0.6" stopColor="rgba(14,165,233,0.45)" />
          <stop offset="1" stopColor="rgba(132,204,22,0.50)" />
        </linearGradient>
      </defs>
      <path
        d="M0 64 C 30 52, 55 58, 80 46 C 110 32, 130 40, 150 30 C 175 18, 195 28, 240 10"
        fill="none"
        stroke="url(#g)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <g opacity="0.55">
        {bars.map((h, i) => (
          <rect
            key={i}
            x={i * 18 + 6}
            y={78 - h}
            width="10"
            height={h}
            rx="5"
            fill="rgba(16,185,129,0.18)"
            stroke="rgba(16,185,129,0.22)"
          />
        ))}
      </g>
    </svg>
  );
}

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className={cn(
        "relative rounded-3xl border border-border bg-white/60 backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_28px_80px_-44px_rgba(0,0,0,0.45)]",
        "overflow-hidden",
        className
      )}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full blur-[60px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.22), transparent 60%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-28 size-96 rounded-full blur-[70px]"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.16), transparent 62%)" }}
        aria-hidden
      />

      <div className="relative p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-emerald-500/10 border border-emerald-600/15 flex items-center justify-center">
              <Sparkles className="size-4 text-emerald-800" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-foreground">Live farm intelligence</div>
              <div className="text-xs text-muted-foreground">Updated 2m ago • Satellite + weather</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-600/15">
            <span className="inline-block size-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Live
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/70 border border-border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="size-4 text-emerald-800" />
              Yield accuracy
            </div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">94%</div>
            <div className="mt-2 h-2 rounded-full bg-emerald-500/10 overflow-hidden">
              <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-emerald-600 to-sky-600" />
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 border border-border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CloudSun className="size-4 text-sky-800" />
              Weather risk
            </div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">Low</div>
            <div className="mt-1 text-xs text-muted-foreground">Next 72h stable</div>
          </div>
          <div className="rounded-2xl bg-white/70 border border-border p-3">
            <div className="text-xs text-muted-foreground">Recommendation</div>
            <div className="mt-1 text-sm font-bold text-foreground">Irrigate tonight</div>
            <div className="mt-1 text-xs text-muted-foreground">Save ~12% water</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-foreground">7‑day yield trend</div>
            <div className="text-xs text-muted-foreground">+8.2% MoM</div>
          </div>
          <div className="mt-2">
            <MiniBarChart />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

