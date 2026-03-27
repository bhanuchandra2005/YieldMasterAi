import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, Volume2, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

type Language = "en-IN" | "hi-IN" | "te-IN" | "mr-IN";

const LANGUAGES = [
  { code: "en-IN", name: "English" },
  { code: "hi-IN", name: "हिंदी" },
  { code: "te-IN", name: "తెలుగు" },
  { code: "mr-IN", name: "मराठी" }
];

export const BoliVoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [language, setLanguage] = useState<Language>("hi-IN");

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error(`Microphone error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      toast.error("Voice Assistant is not supported in this browser. Please use Chrome.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Update language when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  useEffect(() => {
    // Force load voices to ensure they are available
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    if (!isListening && transcript.trim() && !isProcessing && !aiResponse) {
      processVoiceQuery(transcript);
    }
  }, [isListening]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any current audio
      setTranscript("");
      setAiResponse("");
      setIsPlaying(false);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        // Handle case where it might already be started
        console.error(e);
      }
    }
  };

  const processVoiceQuery = async (query: string) => {
    setIsProcessing(true);
    setAiResponse("Thinking...");

    try {
      const langName = LANGUAGES.find(l => l.code === language)?.name || "English";

      const prompt = `Act as "Boli", an extremely friendly, helpful agricultural voice assistant for Indian farmers. 
The farmer just said: "${query}" (Spoken locally). 
Provide an ultra-short, conversational answer. YOU MUST KEEP IT UNDER 15 WORDS TOTAL.
Do not exceed two very short sentences so it fits perfectly in 3 visual lines.
Speak specifically in ${langName}, BUT YOU MUST WRITE IT USING ONLY ENGLISH ALPHABET LETTERS (Transliteration, e.g. "Namaste, ela unnavu" or "Bagunnara"). 
Do not use native scripts like Hindi or Telugu characters because my voice engine cannot read them. Use English letters only.
Do not use markdown formatting, emojis, or bullet points. Just raw spoken conversational text.`;

      const res = await api.chat.send({ message: prompt });
      const replyText = res.reply.replace(/[\*\_]/g, ""); // strip any accidental markdown

      setAiResponse(replyText);
      speakResponse(replyText);
    } catch (error: any) {
      setAiResponse("Sorry, I could not connect right now. Please try again later.");
      toast.error("Boli AI failed to respond.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    // Ensure Chrome doesn't randomly pause
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    synthesisRef.current = utterance;

    // Crucial anti-garbage-collection hack for Chrome
    (window as any)._hackyPrcGlobalUtterance = utterance;

    utterance.lang = language;
    // Telugu native TTS is notoriously fast, so slow it down specifically
    utterance.rate = language === "te-IN" ? 0.7 : 0.9;
    utterance.pitch = 1.1; // Slightly higher/friendly pitch

    const voices = window.speechSynthesis.getVoices();
    // Find known female Indian voices based on OS/Browser
    // User requested to aggressively use Hindi Girl Voice for all languages
    let nativeVoice = voices.find(v =>
      v.name.includes("Swara") ||
      v.name.includes("Aditi") ||
      v.name.includes("Neerja") ||
      v.name.includes("Google हिन्दी") ||
      (v.lang === language && v.name.toLowerCase().includes("female"))
    );

    // Generic Fallback
    if (!nativeVoice) {
      nativeVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
    }

    if (nativeVoice) {
      utterance.voice = nativeVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      window.speechSynthesis.resume();
    };
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);

    // Second Chrome fallback to kickstart audio queue
    setTimeout(() => {
      window.speechSynthesis.resume();
    }, 50);
  };

  return (
    <>
      <motion.div 
        drag
        dragMomentum={false}
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="bg-card w-80 rounded-2xl shadow-2xl border border-primary/20 overflow-hidden flex flex-col relative"
            >
              <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Boli Voice Assistant</h3>
                    <p className="text-[10px] opacity-80">Ask me anything about farming!</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20 rounded-full text-primary-foreground" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-3 bg-muted/30 border-b border-border/50 flex flex-wrap gap-1.5 justify-center">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code as Language)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all relative outline-none ${language === l.code ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                  >
                    {language === l.code && (
                      <motion.div
                        layoutId="bolilangtab"
                        className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/20"
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    )}
                    <span className="relative z-10">{l.name}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 flex flex-col items-center justify-center min-h-[160px] text-center gap-4 relative">
                {/* Visualizer Background */}
                {(isListening || isPlaying) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                    <div className="w-32 h-32 rounded-full bg-primary animate-ping" />
                  </div>
                )}

                <div className="z-10 w-full">
                  {!transcript && !aiResponse && !isListening && (
                    <p className="text-sm text-muted-foreground font-medium">Tap the microphone and ask a question...</p>
                  )}

                  {transcript && (
                    <div className="mb-4">
                      <p className="text-[10px] uppercase font-bold text-primary/70 tracking-wider mb-1">You said</p>
                      <p className="text-base font-medium text-foreground italic">"{transcript}"</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex flex-col items-center gap-2 mt-4 text-primary">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold animate-pulse">Boli is thinking...</span>
                    </div>
                  )}

                  {aiResponse && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 bg-primary/5 p-3 rounded-xl border border-primary/10"
                    >
                      <p className="text-[10px] uppercase font-bold text-primary/70 tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Volume2 className={`w-3 h-3 ${isPlaying ? 'animate-pulse text-primary' : ''}`} />
                        Boli says
                      </p>
                      <p className="text-sm font-bold text-foreground">{aiResponse}</p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-background border-t border-border flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleListen}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-colors ${isListening ? 'bg-red-500 text-white shadow-red-500/30' :
                    isProcessing ? 'bg-muted text-muted-foreground cursor-not-allowed' :
                      'bg-primary text-primary-foreground shadow-primary/30'
                    }`}
                  disabled={isProcessing}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating FAB */}
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center border-4 border-background group"
          >
            <Mic className="w-6 h-6 group-hover:animate-pulse" />
          </motion.button>
        )}
      </motion.div>
    </>
  );
};
