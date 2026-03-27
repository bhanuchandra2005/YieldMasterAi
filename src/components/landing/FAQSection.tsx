import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { ArrowRight, Info, ShieldCheck, Zap, Database, Cpu } from "lucide-react";

const faqs = [
  {
    q: "How accurate are the crop yield predictions?",
    a: "Our ML models achieve 94% accuracy on average by analyzing historical yield data, real-time weather patterns, soil properties, and regional factors. Accuracy improves over time as more data is collected.",
    details: {
      icon: Cpu,
      title: "Prediction Engine Architecture",
      description: "Our proprietary neural network combines multi-modal data streams for unprecedented accuracy in agricultural outcomes.",
      points: [
        "Dynamic weight adjustment based on regional climate shifts",
        "Integration of sub-seasonal weather ensemble forecasts",
        "Automated outlier detection for anomalies in soil sensor data",
        "Continuous model retraining on a rolling 2-year window"
      ]
    }
  },
  {
    q: "What data do I need to provide?",
    a: "At minimum, you need your crop type and location. For better predictions, you can add soil test results, irrigation details, and fertilizer usage. Our system automatically fetches weather and climate data.",
    details: {
      icon: Database,
      title: "Data Acquisition Protocol",
      description: "YieldMaster AI leverages both user-provided inputs and global geospatial datasets to build a digital twin of your farm.",
      points: [
        "Satellite-derived vegetation indices (NDVI, EVI)",
        "Hyper-local weather station integration via API",
        "Historical soil profile mapping for your GPS coordinates",
        "Standardized fertilizer composition database integration"
      ]
    }
  },
  {
    q: "Which crops are supported?",
    a: "We support 50+ crop types including rice, wheat, maize, cotton, sugarcane, soybean, and most common vegetables. Enterprise plans can request custom crop model training.",
    details: {
      icon: Zap,
      title: "Crop Modeling Coverage",
      description: "Our botanical models are calibrated against regional growth cycles across 6 continents.",
      points: [
        "Grains: Wheat, Rice, Corn, Barley, Oats",
        "Legumes: Soybean, Pea, Chickpea, Lentil",
        "Fiber: Cotton, Jute, Hemp",
        "Horticulture: Tomato, Potato, Onion, Leafy Greens"
      ]
    }
  },
  {
    q: "Is my farm data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. We never share individual farm data. Aggregated, anonymized data is used to improve model accuracy.",
    details: {
      icon: ShieldCheck,
      title: "Data Sovereignty & Privacy",
      description: "We implement military-grade security protocols to ensure your competitive data remains exclusively yours.",
      points: [
        "AES-256 encryption at rest with rotatable key management",
        "Zero-knowledge architecture for individual field identifiers",
        "Full GDPR and SOC2 Type II compliance standards",
        "Granular access control for enterprise team members"
      ]
    }
  },
  {
    q: "Can I integrate YieldMaster with other farm tools?",
    a: "Yes, our Pro and Enterprise plans offer API access that integrates with popular farm management software, IoT sensor platforms, and ERP systems.",
    details: {
      icon: ArrowRight,
      title: "Interoperability & API",
      description: "Our system is designed to act as the brain of your existing agricultural technology stack.",
      points: [
        "RESTful API endpoints for yield forecast extraction",
        "Webhooks for real-time weather and pest alerts",
        "Native connectors for major IoT sensor gateways",
        "Export capabilities to standard CSV, PDF, and Shapefiles"
      ]
    }
  },
];

export function FAQSection() {
  const [selectedFaq, setSelectedFaq] = useState<typeof faqs[0] | null>(null);

  return (
    <section id="faq" className="landing-section-bg relative py-24 bg-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container max-w-3xl mx-auto px-6 relative z-10">
        <SectionHeader
          eyebrow="Intelligence Hub"
          title="Common"
          highlight="questions"
          subtitle="Precision agricultural insights to help you grow more with less."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-16"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="landing-card border border-border/60 rounded-3xl px-7 overflow-hidden bg-card/40 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 group"
              >
                <AccordionTrigger className="text-base font-bold text-foreground/90 hover:no-underline py-6 group-hover:text-primary transition-colors text-left leading-snug">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-8">
                  <div className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                    {faq.a}
                  </div>
                  <button
                    onClick={() => setSelectedFaq(faq)}
                    className="flex items-center gap-2.5 text-xs font-extra-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all group/btn"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover/btn:scale-110">
                      <Info className="w-4 h-4" />
                    </div>
                    Learn More Technical Details
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>

      {/* Details Modal */}
      <Dialog open={!!selectedFaq} onOpenChange={(open) => !open && setSelectedFaq(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-border/40 sm:rounded-[2rem] bg-white dark:bg-zinc-950">
          {selectedFaq && (
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5" />
                <div className="absolute -bottom-8 -right-8 opacity-10">
                  <selectedFaq.details.icon size={160} className="text-primary" />
                </div>
              </div>
              
              <div className="px-8 pb-10 pt-6">
                <div className="flex items-center gap-4 mb-6 -mt-12">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-card shadow-xl border border-border/50 flex items-center justify-center text-primary">
                    <selectedFaq.details.icon size={32} strokeWidth={1.5} />
                  </div>
                </div>

                <DialogTitle className="text-2xl font-black tracking-tight text-foreground mb-4">
                  {selectedFaq.details.title}
                </DialogTitle>
                
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed mb-8 font-medium">
                  {selectedFaq.details.description}
                </DialogDescription>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Key Indicators & Methodology</p>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedFaq.details.points.map((point, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span className="text-xs font-semibold text-foreground/80 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
