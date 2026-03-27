import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { PromoVideoModal } from "./PromoVideoModal";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);

  return (
    <>
    <PromoVideoModal open={promoOpen} onOpenChange={setPromoOpen} />
    <header className="fixed top-0 left-0 right-0 z-50 landing-navbar">
      <div className="container flex items-center justify-between h-16 max-w-7xl mx-auto px-6">
        <button
          type="button"
          onClick={() => setPromoOpen(true)}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-0 text-left group"
        >
          <Logo size="md" />
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="landing-nav-link px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-lg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/login">
            <button className="landing-nav-login px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg">
              Log in
            </button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="landing-nav-cta gradient-hero text-primary-foreground font-semibold rounded-lg border-0">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden landing-nav-mobile-trigger p-2.5 rounded-xl text-foreground/70 hover:text-foreground transition-all"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-border bg-card/95 backdrop-blur-xl landing-navbar-dropdown"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="landing-nav-link px-4 py-3 text-sm font-medium text-muted-foreground rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
                <div className="flex justify-center mb-1">
                  <LanguageSwitcher />
                </div>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <button className="landing-nav-login w-full py-2.5 text-sm text-muted-foreground">
                    Log in
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full gradient-hero text-primary-foreground border-0 font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}
