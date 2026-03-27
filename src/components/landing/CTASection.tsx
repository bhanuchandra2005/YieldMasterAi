import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="landing-section-bg relative py-24 bg-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="container max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative rounded-2xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-violet-500/15" />

            {/* Glow spots */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]" />

            {/* Border */}
            <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />

            <div className="relative z-10 p-10 md:p-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
                  Free to start
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
                Ready to grow smarter?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-base">
                Join 10,000+ farmers using AI to predict yields, reduce waste,
                and increase profitability.
              </p>

              <Link to="/signup">
                <Button size="lg" className="landing-primary-btn bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all">
                  Start Free Today
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
