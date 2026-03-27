import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    // Try to recover language from cookie or localStorage
    const cookie = document.cookie.split('; ').find(row => row.trim().startsWith('googtrans='));
    if (cookie) {
      const parts = cookie.split('=')[1].split('/');
      return parts[parts.length - 1] || 'en';
    }
    return localStorage.getItem('ym_lang') || 'en';
  });
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initTranslate = () => {
      if (typeof window.google !== 'undefined' && window.google.translate) {
        // Only initialize if not already present
        if (!document.querySelector('.goog-te-combo')) {
          new window.google.translate.TranslateElement(
            { 
              pageLanguage: 'en', 
              layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL 
            },
            'google_hidden_init'
          );
        }
      }
    };

    window.googleTranslateElementInit = initTranslate;

    // Create singleton hidden div if it doesn't exist
    if (!document.getElementById("google_hidden_init")) {
      const div = document.createElement("div");
      div.id = "google_hidden_init";
      div.className = "opacity-0 absolute pointer-events-none w-0 h-0 overflow-hidden";
      div.style.position = 'fixed';
      div.style.top = '-100px';
      document.body.appendChild(div);
    }

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      
      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };
    
    // Sync language across multiple instances (desktop/mobile)
    const syncLang = () => {
      const lang = localStorage.getItem('ym_lang') || 'en';
      setCurrentLang(lang);
    };

    const handleResize = () => {
      if (isOpen) updateCoords();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener('storage', syncLang);
    window.addEventListener('scroll', handleResize, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('storage', syncLang);
      window.removeEventListener('scroll', handleResize, true);
      window.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({ 
        top: rect.bottom, 
        left: rect.left,
        width: rect.width
      });
    }
  };

  const toggleDropdown = () => {
    updateCoords();
    setIsOpen(!isOpen);
  };

  const changeLanguage = (langCode: string) => {
    // 1. Local UI state update
    setCurrentLang(langCode);
    localStorage.setItem('ym_lang', langCode);
    setIsOpen(false);

    // 2. Set Cookie (Persistent across sessions/refreshes)
    const cookieString = `/en/${langCode}`;
    const domain = window.location.hostname;
    document.cookie = `googtrans=${cookieString}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    if (domain !== 'localhost') {
        document.cookie = `googtrans=${cookieString}; path=/; domain=${domain}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    }

    // 3. Trigger Google Translate DOM elements
    const attemptTranslation = () => {
      const combo = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
        // Sometimes second trigger after a tiny delay helps Google "catch up"
        setTimeout(() => {
          if (combo.value !== langCode) {
            combo.value = langCode;
            combo.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, 100);
        return true;
      }
      return false;
    };

    // Retry for up to 5 seconds if Google script hasn't fully injected elements yet
    if (!attemptTranslation()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (attemptTranslation() || attempts > 50) {
          clearInterval(interval);
          if (attempts > 50) {
             console.warn("LanguageSwitcher: Could not find Google Translate elements. Falling back to page reload.");
             window.location.reload();
          }
        }
      }, 100);
    }
  };

  const selectedLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative" ref={containerRef}>
      {/* 
         GHOST DIV FOR GOOGLE INITIALIZATION
         Rendered at least once to ensure ID availability if needed, 
         though we now mainly use the body singleton.
      */}
      {!document.getElementById("google_hidden_init") && (
        <div 
          id="google_hidden_init" 
          className="opacity-0 absolute pointer-events-none p-0 m-0 w-0 h-0 overflow-hidden" 
          style={{ top: -100, left: -100 }}
        ></div>
      )}
      <style>{`
        .goog-te-banner-frame, .goog-te-banner-frame.skiptranslate, .goog-te-gadget, .goog-te-gadget-simple, #goog-gt-tt, .goog-te-balloon-frame, .goog-tooltip, .goog-tooltip:hover { 
          display: none !important; 
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          pointer-events: none !important;
        }
        body { top: 0 !important; margin-top: 0 !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
      `}</style>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDropdown}
        className={cn(
          "flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all duration-300 select-none",
          isOpen ? "bg-primary/20 border-primary/40 shadow-lg" : "bg-white/40 dark:bg-primary/5 border-primary/20"
        )}
      >
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
           <Globe className={cn("w-3.5 h-3.5 text-primary transition-transform duration-700", isOpen && "rotate-180")} />
        </div>
        <span className="text-xs font-bold text-foreground tracking-tight min-w-[65px] text-left">
          {selectedLang.label.split(' ')[0]}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-500", isOpen && "rotate-180")} />
      </motion.button>

      {createPortal(
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              style={{ 
                position: 'fixed', 
                top: coords.top + 8, 
                left: Math.max(10, coords.left + coords.width - 224), 
                width: '224px',
                zIndex: 999999
              }}
              className="bg-white/90 dark:bg-card/90 backdrop-blur-2xl rounded-2xl border border-primary/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] p-2"
            >
              <div className="grid gap-1">
                {LANGUAGES.map((lang, idx) => (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => changeLanguage(lang.code)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                      currentLang === lang.code 
                        ? "bg-primary text-white shadow-lg shadow-primary/30" 
                        : "hover:bg-primary/10 text-foreground hover:text-primary active:scale-95"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base group-hover:scale-120 transition-transform">{lang.flag}</span>
                      <span className="tracking-tight">{lang.label}</span>
                    </div>
                    {currentLang === lang.code && <Check className="w-3.5 h-3.5" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}
