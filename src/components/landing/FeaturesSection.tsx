import { Brain, CloudRain, Leaf, BarChart3, MapPin, Shield } from "lucide-react";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { SectionHeader } from "@/components/landing/SectionHeader";

const features = [
  {
    icon: Brain,
    title: "AI Yield Prediction",
    description:
      "Forecast yield by crop + season using weather, soil and field history—explained in plain language.",
    microcopy: "Accuracy you can trust",
    href: "/predictions",
    tone: "emerald" as const,
  },
  {
    icon: CloudRain,
    title: "Weather Intelligence",
    description:
      "Hyper-local forecasts, rainfall windows, and risk alerts so you can plan operations confidently.",
    microcopy: "Real-time alerts",
    href: "/weather",
    tone: "sky" as const,
  },
  {
    icon: Leaf,
    title: "Soil Health Analysis",
    description:
      "Turn soil tests into clear actions: nutrient balance, pH guidance, and sustainable input planning.",
    microcopy: "Actionable insights",
    href: "/fields",
    tone: "lime" as const,
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track performance over time, compare seasons, and measure what changed—with clean visuals.",
    microcopy: "See trends fast",
    href: "/analytics",
    tone: "slate" as const,
  },
  {
    icon: MapPin,
    title: "Regional Insights",
    description:
      "Localized guidance for crop selection and timing based on your region’s climate patterns.",
    microcopy: "Made for your area",
    href: "/planning",
    tone: "amber" as const,
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description:
      "Spot risk early—pest pressure, stress signals, and weather threats—before they cost you yield.",
    microcopy: "Reduce losses",
    href: "/dashboard",
    tone: "violet" as const,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="landing-section-bg relative py-24 bg-background overflow-hidden">
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need for"
          highlight="smarter farming"
          subtitle="A modern toolkit for planning, predicting and protecting yield—built to be understandable on day one."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
              microcopy={f.microcopy}
              href={f.href}
              tone={f.tone}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
