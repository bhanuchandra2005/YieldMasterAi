import { ArrowRight, BarChart3, Sprout, Cloud, Zap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 landing-hero-sheen"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/hero-farm.svg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/35 to-background/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_60%_at_50%_25%,rgba(16,185,129,0.18),transparent_55%)]" />

      {/* Content */}
      <div className="relative z-10 container max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="landing-badge inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 border border-emerald-600/20 mb-8 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-800">
                AI-powered smart farming
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.04]">
              Predict crop yields{" "}
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-sky-600 bg-clip-text text-transparent">
                with precision AI
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-foreground/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Turn weather, soil and field history into clear decisions. YieldMaster helps farmers plan inputs,
              reduce risk, and maximize harvest outcomes with confidence.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="landing-primary-btn h-12 rounded-xl px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl px-6 border-foreground/15 bg-white/70 hover:bg-white/80 text-foreground backdrop-blur-md"
                >
                  Live Demo
                </Button>
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0">
              {[
                { icon: BarChart3, value: "94%", label: "Accuracy" },
                { icon: Cloud, value: "50+", label: "Data sources" },
                { icon: Sprout, value: "10K+", label: "Farmers" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="landing-card rounded-2xl border border-border bg-white/60 backdrop-blur-md p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="w-4 h-4 text-emerald-800" />
                    {label}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-800" />
              Data encrypted • Privacy-first • Built for real farms
            </div>
          </div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
