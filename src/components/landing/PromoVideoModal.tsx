import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Droplets, TrendingUp } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

/**
 * Cinematic promo: use public/promo-video.mp4 if present; otherwise YouTube fallback plays.
 */
const PROMO_VIDEO_MP4 = "/promo-video.mp4";
const PROMO_VIDEO_WEBM = "/promo-video.webm";
const YOUTUBE_FALLBACK_ID = "dQw4w9WgXcQ"; // precision agriculture — replace with your promo ID

const flowLines = [
  "AI-powered yield predictions for smarter farming.",
  "Weather, soil, and historical data in one place.",
  "Maximize yields. Minimize waste. Plan with confidence.",
];

export function PromoVideoModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useYoutubeFallback, setUseYoutubeFallback] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (open && !useYoutubeFallback) {
      videoRef.current.play().catch(() => setUseYoutubeFallback(true));
    } else if (!open) {
      videoRef.current?.pause();
      videoRef.current && (videoRef.current.currentTime = 0);
    }
  }, [open, useYoutubeFallback]);

  const handleVideoError = () => setUseYoutubeFallback(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 pt-12 gap-0 overflow-hidden border-0 shadow-2xl bg-card sm:rounded-xl">
        <div className="relative rounded-lg overflow-hidden">
          {/* Video: self-hosted MP4 or YouTube fallback when file is missing */}
          <div className="relative aspect-video w-full bg-muted overflow-hidden">
            {useYoutubeFallback ? (
              <iframe
                title="YieldMasterAI promo"
                src={open ? `https://www.youtube.com/embed/${YOUTUBE_FALLBACK_ID}?autoplay=1&rel=0` : undefined}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                title="YieldMasterAI — Smart farming, drone aerial"
                className="absolute inset-0 w-full h-full object-cover"
                src={PROMO_VIDEO_MP4}
                playsInline
                muted
                loop
                autoPlay
                onError={handleVideoError}
              >
                <source src={PROMO_VIDEO_MP4} type="video/mp4" />
                <source src={PROMO_VIDEO_WEBM} type="video/webm" />
              </video>
            )}

            {/* Futuristic AI agriculture HUD overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-end justify-between p-3 md:p-4 bg-gradient-to-t from-black/70 via-transparent to-transparent">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="flex flex-col gap-1.5 text-left"
              >
                <span className="text-[10px] md:text-xs font-mono text-primary-foreground/90 uppercase tracking-wider">
                  Crop health
                </span>
                <span className="text-lg md:text-xl font-bold text-white drop-shadow-md">
                  94%
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="flex items-center gap-1.5 rounded-lg bg-black/40 backdrop-blur-sm px-2.5 py-1.5 border border-white/10"
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-xs font-mono text-white">Moisture 78%</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="flex flex-col gap-1.5 text-right"
              >
                <span className="text-[10px] md:text-xs font-mono text-primary-foreground/90 uppercase tracking-wider">
                  Yield prediction
                </span>
                <span className="text-lg md:text-xl font-bold text-emerald-300 drop-shadow-md flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" /> 98%
                </span>
              </motion.div>
            </div>

            {/* Subtle scan line / AI analyzing feel */}
            <motion.div
              animate={{ opacity: [0.03, 0.08, 0.03] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"
              aria-hidden
            />
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl font-bold">
                <Logo size="md" />
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {flowLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.15 * (i + 1),
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="text-sm md:text-base text-muted-foreground leading-relaxed flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Button
                className="gradient-hero text-primary-foreground border-0 flex-1"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Continue to site
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
