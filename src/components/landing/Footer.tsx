import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const links = {
  Product: ["Features", "Pricing", "Dashboard", "API"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Resources: ["Documentation", "Help Center", "Community", "Status"],
  Legal: ["Privacy", "Terms", "Security", "GDPR"],
};

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-black/20 border-t border-border/40">
      {/* Dynamic top gradient for a premium feel */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
      
      <div className="container max-w-7xl mx-auto px-8 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Brand & Mission Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 transition-transform hover:scale-[1.02]">
              <Logo size="sm" withText={false} />
              <span className="font-extrabold tracking-tight text-lg">YieldMaster<span className="text-primary">AI</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-8 font-medium">
              Empowering global food security through high-fidelity crop yield prediction and sustainable agricultural intelligence.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Github, label: "GitHub" },
                { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Mail, label: "Email" }
              ].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl bg-card/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 shadow-sm"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Group - Simplified for professional look */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="col-span-1 md:col-span-2 lg:col-span-2">
              <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-6 opacity-60">{title}</p>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[13px] text-muted-foreground font-semibold hover:text-primary hover:translate-x-1 inline-block transition-all duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section - Ultra Clean */}
        <div className="mt-20 pt-10 border-t border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <p>© 2026 YieldMaster AI</p>
              <span className="w-1 h-1 rounded-full bg-border" />
              <p>Global Agronomic Intelligence</p>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
              <span>Optimizing with</span>
              <span className="text-primary/80 animate-pulse">●</span>
              <span>Advanced Data Fidelity</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
