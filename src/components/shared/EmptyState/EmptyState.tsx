"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  actionVariant?: "primary" | "outline";
  secondaryLabel?: string;
  secondaryHref?: string;
  headingLevel?: 1 | 2 | 3;
  align?: "center" | "start";
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function EmptyBox({ className }: { className?: string }) {
  const cells = Array.from({ length: 12 }, (_, i) => i);
  const rows = [0, 1, 2];
  return (
    <svg aria-hidden="true" viewBox="0 0 168 96" width="168" height="96" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={cn("text-ink-muted", className)}>
      <rect x="0.75" y="0.75" width="166.5" height="94.5" rx="10" />
      {rows.map((r) =>
        cells.map((c) => {
          const x = 12 + c * 12;
          const y = 14 + r * 24;
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width="10" height="18" rx="2" />
              <path d={`M${x} ${y + 9}h10`} opacity="0.6" />
            </g>
          );
        }),
      )}
    </svg>
  );
}

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  actionVariant = "primary",
  secondaryLabel,
  secondaryHref,
  headingLevel = 2,
  align = "center",
  children,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";
  const centered = align === "center";
  return (
    <div data-empty="" className={cn("flex flex-col gap-3 px-4 py-16", centered ? "items-center text-center" : "items-start", className)}>
      <EmptyBox />
      <Heading className="m-0 mt-4 text-step-2 font-bold leading-[1.15] text-ink">{title}</Heading>
      {subtitle ? <p className={cn("m-0 max-w-[48ch] text-ink-muted", centered && "mx-auto")}>{subtitle}</p> : null}
      {children}
      {(actionLabel && (actionHref || onAction)) || (secondaryLabel && secondaryHref) ? (
        <div className={cn("mt-3 flex flex-wrap items-center gap-x-6 gap-y-3", centered && "justify-center")}>
          {actionLabel && actionHref ? (
            <Button as={Link} href={actionHref} variant={actionVariant}>
              {actionLabel}
            </Button>
          ) : actionLabel && onAction ? (
            <Button variant={actionVariant} onPress={onAction}>
              {actionLabel}
            </Button>
          ) : null}
          {secondaryLabel && secondaryHref ? (
            <Button as={Link} href={secondaryHref} variant="ghost">
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
