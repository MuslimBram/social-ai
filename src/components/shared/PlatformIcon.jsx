import React from "react";
import { cn } from "@/lib/utils";

const platformConfig = {
  facebook: { emoji: "📘", bg: "bg-blue-50", text: "text-blue-600", label: "Facebook" },
  instagram: { emoji: "📸", bg: "bg-pink-50", text: "text-pink-600", label: "Instagram" },
  linkedin: { emoji: "💼", bg: "bg-sky-50", text: "text-sky-600", label: "LinkedIn" },
  twitter: { emoji: "🐦", bg: "bg-gray-50", text: "text-gray-700", label: "Twitter / X" },
};

export default function PlatformIcon({ platform, size = "md", showLabel = false }) {
  const config = platformConfig[platform] || platformConfig.facebook;
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-lg",
    lg: "w-14 h-14 text-2xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-xl flex items-center justify-center", sizes[size], config.bg)}>
        {config.emoji}
      </div>
      {showLabel && <span className={cn("text-sm font-medium", config.text)}>{config.label}</span>}
    </div>
  );
}

export { platformConfig };