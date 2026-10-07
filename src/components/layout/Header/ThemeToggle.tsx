"use client";

import { Sunrise, Sunset } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { Segmented } from "@/components/ui/Choice";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ variant = "strip", className }: { variant?: "strip" | "row"; className?: string }) {
  const { theme, toggleTheme, setTheme } = useTheme();

  if (variant === "row") {
    return (
      <div className={cn("flex min-h-14 flex-wrap items-center justify-between gap-3", className)}>
        <span className="text-step-0 text-ink">Theme</span>
        <Segmented
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Day" },
            { value: "dark", label: "Night" },
          ]}
        />
      </div>
    );
  }

  const night = theme === "dark";
  const Icon = night ? Sunset : Sunrise;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={night ? "Switch to Day" : "Switch to Night"}
      className={cn("flex h-8 cursor-pointer items-center gap-1.5 rounded-sign px-2 text-[0.8125rem] font-semibold text-on-board transition-colors duration-[120ms] hover-device:hover:bg-flap", className)}
    >
      <Icon size={16} aria-hidden="true" />
      <span className="pt-px">{night ? "Night" : "Day"}</span>
    </button>
  );
}
