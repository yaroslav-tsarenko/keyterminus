"use client";

import { formatPrice } from "@/lib/utils/format-price";
import { useCurrency } from "@/providers/CurrencyProvider";
import { dealPercent } from "@/lib/catalog/remarks";
import { DealTile } from "@/components/ui/Remark";
import { cn } from "@/lib/utils/cn";

interface PriceDisplayProps {
  price: number;
  comparePrice?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  layout?: "stack" | "inline";
  className?: string;
  demo?: boolean;
}

const PRICE_SIZE = {
  sm: "text-step-1 leading-[1.1] tracking-[-0.01em]",
  md: "text-step-2 leading-[1.05]",
  lg: "text-step-3 leading-none tracking-[-0.02em]",
  xl: "text-step-4 leading-none tracking-[-0.02em]",
};

export function discountPercent(price: number, comparePrice?: number | null): number {
  return dealPercent(price, comparePrice) ?? 0;
}

export function DealPlate({ percent, className }: { percent: number; className?: string }) {
  if (percent <= 0) return null;
  return <DealTile percent={percent} className={className} />;
}

export function PriceDisplay({ price, comparePrice, size = "md", layout = "stack", className }: PriceDisplayProps) {
  const { currency, convert } = useCurrency();
  const percent = discountPercent(price, comparePrice);
  const was = percent > 0 && comparePrice ? formatPrice(convert(comparePrice), currency) : null;
  const now = (
    <span data-price="" className={cn("price text-ink", PRICE_SIZE[size])}>
      {was ? <span className="sr-only">Now </span> : null}
      {formatPrice(convert(price), currency)}
    </span>
  );

  if (!was) return <span className={cn("inline-flex items-baseline", className)}>{now}</span>;

  const struck = (
    <s className="font-mono text-[0.8125rem] font-normal leading-none text-ink-subtle">
      <span className="sr-only">Was </span>
      {was}
    </s>
  );

  if (layout === "inline") {
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-x-2.5 gap-y-1", className)}>
        {now}
        {struck}
        <DealPlate percent={percent} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-start gap-1", className)}>
      {struck}
      <span className="inline-flex items-center gap-2">
        {now}
        <DealPlate percent={percent} />
      </span>
    </span>
  );
}
