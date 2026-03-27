import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/landing/SectionHeader";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    desc: "For small farms getting started",
    features: ["5 predictions/month", "Basic weather data", "1 crop type", "Email support"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/Year",
    desc: "For serious farmers & agri-businesses",
    features: ["Unlimited predictions", "Real-time weather + soil", "All crop types", "Analytics dashboard", "Risk alerts", "Priority support"],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For agricultural organizations",
    features: ["Everything in Pro", "API access", "Custom ML models", "Multi-region support", "Dedicated account manager", "SLA guarantee"],
    cta: "Contact Sales",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="landing-section-bg relative py-24 bg-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <SectionHeader
          eyebrow="Pricing"
          title="Plans that"
          highlight="grow with you"
          subtitle="Start free. Upgrade when you’re ready. Built for farms from 1 field to 1,000+."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`landing-card rounded-2xl border ${
                plan.featured ? "border-emerald-600/25 relative" : "border-border"
              } ${
                plan.featured
                  ? "bg-emerald-50/90 dark:bg-emerald-950/25"
                  : "bg-card/70 hover:bg-card"
              } transition-all duration-300`}
            >
              <div className="h-full p-7 relative overflow-hidden flex flex-col">
                {/* Popular badge */}
                {plan.featured && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Popular</span>
                  </div>
                )}

                <p className="text-sm font-semibold mb-2 text-foreground/70">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-bold tabular-nums ${plan.featured ? "bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-600 bg-clip-text text-transparent" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm mb-7 text-muted-foreground">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.featured ? "text-emerald-700" : "text-muted-foreground"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Link to="/signup">
                    <Button
                      className={`w-full ${
                        plan.featured
                          ? "landing-primary-btn bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                          : "bg-card hover:bg-card/80 text-foreground border border-border"
                      } font-semibold rounded-lg`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
