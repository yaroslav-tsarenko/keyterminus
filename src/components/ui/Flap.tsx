"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

export type FlapSize = "xs" | "sm" | "md" | "lg" | "key";
export type FlapTone = "board" | "remark" | "muted";

const SIZE: Record<FlapSize, string> = {
  xs: "text-[0.75rem]",
  sm: "text-flap-sm",
  md: "text-flap-md",
  lg: "text-flap-lg",
  key: "text-key",
};

const WIDE_HINGE = new Set<FlapSize>(["lg", "key"]);

export interface FlapProps {
  char: string;
  previous?: string | null;
  flipKey?: number;
  tone?: FlapTone;
  size?: FlapSize;
  className?: string;
  style?: CSSProperties;
}

export function Flap({ char, previous, flipKey, tone = "board", size, className, style }: FlapProps) {
  const glyph = char === " " ? " " : char;
  return (
    <span
      aria-hidden="true"
      data-flap=""
      data-char={char}
      data-tone={tone === "board" ? undefined : tone}
      data-hinge={size && WIDE_HINGE.has(size) ? "2" : undefined}
      className={cn("flap", size ? SIZE[size] : null, className)}
      style={style}
    >
      <span className="flap-glyph">{glyph}</span>
      {previous != null && previous !== char ? (
        <span key={flipKey} className="flap-leaf animate-flap-fall [animation-duration:140ms]">
          <span>{previous === " " ? " " : previous}</span>
        </span>
      ) : null}
    </span>
  );
}

function pad(text: string, cells: number | undefined, align: "left" | "right") {
  if (!cells) return text;
  if (text.length >= cells) return text.slice(0, cells);
  return align === "right" ? text.padStart(cells, " ") : text.padEnd(cells, " ");
}

export interface FlapRowProps {
  text: string;
  cells?: number;
  align?: "left" | "right";
  tone?: FlapTone;
  size?: FlapSize;
  label?: string;
  uppercase?: boolean;
  className?: string;
  flapClassName?: string;
  "data-demo"?: string;
}

export function FlapRow({ text, cells, align = "left", tone = "board", size = "sm", label, uppercase = false, className, flapClassName, "data-demo": demo }: FlapRowProps) {
  const value = pad(uppercase ? text.toUpperCase() : text, cells, align);
  return (
    <span data-flap-row="" data-demo={demo} className={cn("inline-flex align-middle", className)}>
      <span aria-hidden="true" className={cn("flap-row", SIZE[size])}>
        {Array.from(value).map((c, i) => (
          <Flap key={i} char={c} tone={tone} size={size} className={flapClassName} />
        ))}
      </span>
      <span className="sr-only">{label ?? text}</span>
    </span>
  );
}

function format(value: string | number): string {
  return typeof value === "number" ? value.toLocaleString("en-GB") : value;
}

export interface FlapCounterProps {
  value: string | number;
  label?: string;
  live?: boolean;
  size?: FlapSize;
  tone?: FlapTone;
  minCells?: number;
  className?: string;
  "data-demo"?: string;
}

export function FlapCounter({ value, label, live = false, size = "sm", tone = "board", minCells = 1, className, "data-demo": demo }: FlapCounterProps) {
  const text = format(value).padStart(minCells, " ");
  const before = useRef(text);
  const [flip, setFlip] = useState<{ from: string; n: number }>({ from: text, n: 0 });

  useEffect(() => {
    if (before.current === text) return;
    const from = before.current;
    before.current = text;
    setFlip((f) => ({ from, n: f.n + 1 }));
  }, [text]);

  const chars = Array.from(text);
  const prev = Array.from(flip.from.padStart(chars.length, " ")).slice(-chars.length);

  return (
    <span data-flap-counter="" data-value={text} data-demo={demo} className={cn("inline-flex align-middle", className)}>
      <span aria-hidden="true" className={cn("flap-row", SIZE[size])}>
        {chars.map((c, i) => (
          <Flap key={i} char={c} previous={flip.n > 0 ? prev[i] : null} flipKey={flip.n} tone={tone} size={size} />
        ))}
      </span>
      {live ? (
        <span aria-live="polite" className="sr-only">
          {label ?? text.trim()}
        </span>
      ) : (
        <span className="sr-only">{label ?? text.trim()}</span>
      )}
    </span>
  );
}

export function FlapLoader({ size = 24, label = "Loading", className, showLabel = false }: { size?: 16 | 24; label?: string; className?: string; showLabel?: boolean }) {
  return (
    <span role="status" data-flap-loader="" className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden="true" className={cn("flap", size === 16 ? "text-[0.6875rem]" : "text-[1rem]")}>
        <span className="flap-glyph">{" "}</span>
        <span className="flap-leaf animate-flap-tick" />
      </span>
      <span className={cn("meta text-ink-muted", showLabel ? "" : "sr-only motion-reduce:not-sr-only")}>{showLabel ? label : `${label}…`}</span>
    </span>
  );
}

export function SkeletonBar({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block h-3 rounded-flap bg-surface-1", className)} />;
}

export function PageLoader({ label = "Loading", block = false, className }: { label?: string; block?: boolean; className?: string }) {
  const loader = <FlapLoader label={label} className={className} />;
  if (!block) return loader;
  return <div className="flex min-h-[100svh] items-start justify-center px-4 py-16">{loader}</div>;
}
