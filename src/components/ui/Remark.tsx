import { cn } from "@/lib/utils/cn";
import { FlapRow, type FlapSize } from "./Flap";

export type RemarkKind = "on-time" | "deal" | "new" | "not-in-stock" | "check-in" | "boarding" | "departed" | "arrived" | "help-desk";

const TEXT: Record<RemarkKind, string> = {
  "on-time": "ON TIME",
  deal: "NOW",
  new: "NEW",
  "not-in-stock": "NOT IN STOCK",
  "check-in": "CHECK-IN",
  boarding: "BOARDING",
  departed: "DEPARTED",
  arrived: "ARRIVED",
  "help-desk": "HELP DESK",
};

export function remarkText(kind: RemarkKind, percent?: number | null): string {
  if (kind === "deal" && percent) return `NOW −${percent}%`;
  return TEXT[kind];
}

export function remarkLabel(kind: RemarkKind, percent?: number | null): string {
  if (kind === "on-time") return "In stock at its regular price";
  if (kind === "deal" && percent) return `Price cut ${percent}%`;
  if (kind === "new") return "New release";
  if (kind === "not-in-stock") return "Not in stock";
  return remarkText(kind, percent);
}

export function Remark({
  kind,
  percent,
  surface = "page",
  size = "xs",
  className,
}: {
  kind: RemarkKind;
  percent?: number | null;
  surface?: "page" | "board";
  size?: FlapSize;
  className?: string;
}) {
  const text = remarkText(kind, percent);
  if (surface === "board") return <FlapRow text={text} tone="remark" size={size} label={remarkLabel(kind, percent)} className={className} />;
  return (
    <span className={cn("inline-flex h-[22px] items-center rounded-flap bg-surface-2 px-2 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-ink", className)}>
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{remarkLabel(kind, percent)}</span>
    </span>
  );
}

export function DealTile({ percent, className, size = "xs" }: { percent: number; className?: string; size?: FlapSize }) {
  return <FlapRow text={`NOW −${percent}%`} tone="remark" size={size} label={`Price cut ${percent}%`} className={className} />;
}
