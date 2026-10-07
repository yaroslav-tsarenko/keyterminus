"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PlatformTile } from "./PlatformTile";

export function FilterChip({ label, onRemove, platform, className }: { label: string; onRemove: () => void; platform?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-sign border border-control bg-raised pl-2 text-ui-sm font-semibold text-ink transition-colors duration-[120ms]",
        "has-[button:hover]:border-ink",
        className,
      )}
    >
      {platform ? <PlatformTile platform={platform} size="xs" className="h-5 text-[0.6875rem]" /> : null}
      <span className={cn("whitespace-nowrap pt-px", !platform && "pl-1")}>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="-ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-sign text-ink-muted hover-device:hover:text-ink"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </span>
  );
}

export function FilterChipRow({ children, onClearAll, className }: { children: ReactNode; onClearAll?: () => void; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
      {onClearAll ? (
        <button type="button" onClick={onClearAll} className="btn-text ml-2 min-h-8 cursor-pointer text-ui-sm font-semibold text-ink">
          <span data-label="">Clear all</span>
        </button>
      ) : null}
    </div>
  );
}
