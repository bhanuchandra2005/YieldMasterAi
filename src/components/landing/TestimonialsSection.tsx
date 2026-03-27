import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Patel",
    role: "Rice Farmer, Gujarat",
    quote: "YieldMaster AI helped me increase my rice yield by 23% in one season. The weather predictions alone saved my crop from unexpected rainfall.",
    avatar: "RP",
    accentColor: "emerald",
  },
  {
    name: "Dr. Priya Sharma",
    role: "Agricultural Scientist",
    quote: "The accuracy of the ML model is impressive. We've integrated it into our state agricultural planning. It's a game-changer for food security.",
    avatar: "PS",
    accentColor: "cyan",
  },
  {
    name: "Kamal Singh",
    role: "Wheat Farmer, Punjab",
    quote: "Simple interface, powerful predictions. I can now plan my fertilizer and irrigation schedules weeks in advance with confidence.",
    avatar: "KS",
    accentColor: "violet",
  },
];

const avatarBg: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  cyan: "bg-cyan-500/15 text-cyan-700 border-cyan-500/25",
  violet: "bg-violet-500/15 text-violet-700 border-violet-500/25",
};

export function TestimonialsSection() {
  return (
    <section className="landing-section-bg relative py-24 bg-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-emerald-700">Testimonials</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-600 bg-clip-text text-transparent">
              thousands of farmers
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="landing-card rounded-xl border border-border bg-card/70 hover:bg-card hover:border-border transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${avatarBg[t.accentColor]} border flex items-center justify-center text-xs font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
