"use client";

import { FlapLoader } from "@/components/ui/Flap";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <FlapLoader size={size === "sm" ? 16 : 24} label={label ?? "Loading"} showLabel={Boolean(label)} />
    </div>
  );
}
