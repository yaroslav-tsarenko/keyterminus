import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type TagVariant = "neutral" | "region" | "type" | "edition" | "success" | "warning" | "danger" | "info";

const SIGN = "font-display font-bold uppercase tracking-[0.1em]";

const VARIANT: Record<TagVariant, string> = {
  region: "border border-line-hover font-mono font-semibold uppercase tracking-[0.04em] text-ink",
  type: cn(SIGN, "bg-surface-2 text-ink"),
  edition: cn(SIGN, "border border-line-hover text-ink"),
  neutral: cn(SIGN, "bg-surface-2 text-ink-muted"),
  success: cn(SIGN, "bg-success-tint text-success"),
  warning: cn(SIGN, "bg-warning-tint text-warning"),
  danger: cn(SIGN, "bg-danger-tint text-danger"),
  info: cn(SIGN, "bg-info-tint text-info"),
};

const SQUARE: Partial<Record<TagVariant, string>> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: "sm" | "md";
  children: ReactNode;
}

export function Tag({ variant = "neutral", size = "md", className, children, ...rest }: TagProps) {
  const square = SQUARE[variant];
  return (
    <span
      data-tag={variant}
      className={cn(
        "inline-flex max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-flap leading-none",
        size === "sm" ? "h-5 px-1.5 text-[0.6875rem]" : "h-[22px] px-2 text-[0.75rem]",
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {square ? <span aria-hidden="true" className={cn("size-1.5 shrink-0", square)} /> : null}
      <span className="inline-flex min-w-0 items-center gap-1 truncate pt-px">{children}</span>
    </span>
  );
}

const ORDER_STATUS_VARIANT: Record<string, TagVariant> = {
  PENDING: "neutral",
  CONFIRMED: "info",
  PAID: "info",
  PROCESSING: "warning",
  SHIPPED: "info",
  DELIVERED: "success",
  REFUND_PENDING: "warning",
  CANCELLED: "neutral",
  REFUNDED: "neutral",
  FAILED: "danger",
};

export function statusTagVariant(status: string): TagVariant {
  return ORDER_STATUS_VARIANT[status.toUpperCase()] ?? "neutral";
}

export function StatusTag({ status, label, className }: { status: string; label?: string; className?: string }) {
  const text = label ?? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return (
    <Tag variant={statusTagVariant(status)} className={className}>
      {text}
    </Tag>
  );
}
