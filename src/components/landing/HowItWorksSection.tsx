import { motion } from "framer-motion";
import { Upload, Cpu, TrendingUp, CheckCircle } from "lucide-react";
import { SectionHeader } from "@/components/landing/SectionHeader";

const steps = [
  {
    icon: Upload,
    title: "Input Data",
    desc: "Enter crop type, location, soil details, and season.",
    color: "emerald",
    number: 1,
  },
  {
    icon: Cpu,
    title: "AI Analyzes",
    desc: "Our ML engine processes weather, soil, and historical yield data.",
    color: "cyan",
    number: 2,
  },
  {
    icon: TrendingUp,
    title: "Get Prediction",
    desc: "Receive accurate yield forecasts with confidence intervals.",
    color: "violet",
    number: 3,
  },
  {
    icon: CheckCircle,
    title: "Optimize",
    desc: "Act on AI recommendations to maximize your harvest.",
    color: "amber",
    number: 4,
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    text: "text-emerald-700",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    text: "text-cyan-700",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20 hover:border-violet-500/40",
    text: "text-violet-700",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20 hover:border-amber-500/40",
    text: "text-amber-700",
  },
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-section-bg relative py-24 bg-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <SectionHeader
          eyebrow="How it works"
          title="From data to"
          highlight="decisions"
          subtitle="A simple, guided flow designed for the field—not spreadsheets."
        />

        <div className="mt-14 grid md:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-[52px] left-[12%] right-[12%] h-[2px]">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 via-violet-500/40 to-amber-500/40"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {steps.map((step, i) => {
            const colors = colorMap[step.color];
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center relative group"
              >
                <div
                  className={`landing-card w-[104px] h-[104px] rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mx-auto mb-5 relative z-10 transition-all duration-300`}
                >
                  {/* Step number */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border ${colors.border} flex items-center justify-center`}>
                    <span className={`text-[10px] font-bold ${colors.text}`}>{step.number}</span>
                  </div>
                  <step.icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="text-sm font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
