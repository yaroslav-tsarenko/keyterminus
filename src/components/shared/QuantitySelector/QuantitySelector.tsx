"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FlapCounter } from "@/components/ui/Flap";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onChange: (quantity: number) => void;
  size?: "md" | "compact";
  showStockHint?: boolean;
  label?: string;
  className?: string;
}

export function QuantitySelector({
  quantity,
  maxQuantity,
  onChange,
  size = "md",
  showStockHint = true,
  label = "Quantity",
  className,
}: QuantitySelectorProps) {
  const id = useId();
  const [announcement, setAnnouncement] = useState("");
  const max = Math.max(1, maxQuantity);

  useEffect(() => {
    if (quantity > max) {
      setAnnouncement(`Quantity set to ${max}, up to ${max} per order`);
      onChange(max);
    }
  }, [quantity, max, onChange]);

  const compact = size === "compact";
  const segment = cn(
    "flex shrink-0 cursor-pointer items-center justify-center text-ink transition-colors duration-[120ms]",
    "hover-device:enabled:hover:bg-surface-1 active:translate-y-px disabled:cursor-not-allowed disabled:text-ink-subtle",
    compact ? "size-9 touch-device:size-11" : "size-10 touch-device:size-11",
  );

  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      <div role="group" aria-labelledby={`${id}-label`} className="inline-flex w-fit items-center overflow-hidden rounded-control border border-control bg-raised">
        <span id={`${id}-label`} className="sr-only">
          {label}
        </span>
        <button type="button" className={segment} onClick={() => onChange(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
          <ChevronDown size={18} aria-hidden="true" />
        </button>
        <span className={cn("flex items-center justify-center border-x border-control bg-board px-1.5", compact ? "h-9 touch-device:h-11" : "h-10 touch-device:h-11")}>
          <FlapCounter value={quantity} size={compact ? "sm" : "md"} label={`${label}: ${quantity}`} live />
        </span>
        <button type="button" className={segment} onClick={() => onChange(Math.min(max, quantity + 1))} disabled={quantity >= max} aria-label="Increase quantity">
          <ChevronUp size={18} aria-hidden="true" />
        </button>
      </div>
      {showStockHint && max > 1 ? <p className="m-0 text-ui-sm text-ink-muted">Up to {max} per order</p> : null}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
