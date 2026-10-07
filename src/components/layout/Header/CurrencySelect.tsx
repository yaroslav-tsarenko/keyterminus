"use client";

import { useId } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useCurrency, type Currency } from "@/providers/CurrencyProvider";
import { CURRENCIES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

const SYMBOL: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£" };

export function CurrencySelect({ size = "xs", className, showLabel = false }: { size?: "xs" | "md"; className?: string; showLabel?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const id = useId();
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor={id} className={showLabel ? "text-step-0 text-ink" : "sr-only"}>
        Currency
      </label>
      <div className="relative">
        <select
          id={id}
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className={cn(
            "cursor-pointer appearance-none border font-mono transition-colors duration-[120ms]",
            size === "xs"
              ? "h-8 w-14 rounded-sign border-transparent bg-transparent pl-2 pr-5 text-[0.8125rem] text-on-board hover-device:hover:bg-flap [&>option]:bg-raised [&>option]:text-ink"
              : "h-11 rounded-control border-control bg-raised pl-3.5 pr-10 text-data text-ink",
          )}
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {size === "xs" ? code : `${code} ${SYMBOL[code]}`}
            </option>
          ))}
        </select>
        <ChevronsUpDown size={14} aria-hidden="true" className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2", size === "xs" ? "right-1 text-on-board-muted" : "right-3.5 text-ink-muted")} />
      </div>
    </div>
  );
}
