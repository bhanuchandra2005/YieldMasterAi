import { useState } from "react";
import { Sprout } from "lucide-react";

const LOGO_SRC = "/logo.png";

type LogoSize = "sm" | "md" | "lg";

const sizeClasses = {
  sm: { img: "h-6 w-6", iconBox: "w-6 h-6", icon: "w-3 h-3", text: "text-sm" },
  md: { img: "h-8 w-8", iconBox: "w-8 h-8", icon: "w-4 h-4", text: "text-lg" },
  lg: { img: "h-10 w-10", iconBox: "w-10 h-10", icon: "w-5 h-5", text: "text-xl" },
};

interface LogoProps {
  withText?: boolean;
  iconOnly?: boolean;
  size?: LogoSize;
  className?: string;
  /** Use white icon on green (e.g. splash panels) */
  variant?: "default" | "light";
}

export function Logo({ withText = true, iconOnly = false, size = "md", className = "", variant = "default" }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const sizes = sizeClasses[size];
  const useImg = !imgError;

  const content = (
    <>
      {useImg ? (
        <img
          src={LOGO_SRC}
          alt="YieldMasterAI"
          className={`object-contain flex-shrink-0 ${sizes.img}`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`${sizes.iconBox} rounded-lg gradient-hero flex items-center justify-center flex-shrink-0`}>
          <Sprout className={`${sizes.icon} text-primary-foreground`} />
        </div>
      )}
      {withText && !iconOnly && (
        <span className={`font-bold tracking-tight ${sizes.text} ${variant === "light" ? "text-primary-foreground" : "text-foreground"}`}>
          YieldMaster<span className={variant === "light" ? "text-white/90" : "gradient-text"}>AI</span>
        </span>
      )}
    </>
  );

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {content}
    </span>
  );
}
