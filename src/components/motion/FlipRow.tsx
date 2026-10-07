"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Flap, type FlapRowProps } from "@/components/ui/Flap";
import { REDUCED_MOTION_QUERY } from "@/lib/hooks/useMediaQuery";
import { addTick } from "@/lib/motion/ticker";
import { arrivalPath, flapPath, flapStepAt, FLAP_COLUMN_STAGGER, FLAP_ROW_STAGGER, FLAP_STEP_MS } from "@/lib/motion/flap";
import { cn } from "@/lib/utils/cn";

export interface FlipRowProps extends FlapRowProps {
  arrive?: boolean;
  from?: string;
  delay?: number;
  row?: number;
  "data-was"?: string;
  [data: `data-${string}`]: string | undefined;
}

interface Arrival {
  key: number;
  from: string | null;
}

interface Shown {
  char: string;
  prev: string | null;
  n: number;
}

function pad(text: string, cells: number | undefined, align: "left" | "right") {
  if (!cells) return text;
  if (text.length >= cells) return text.slice(0, cells);
  return align === "right" ? text.padStart(cells, " ") : text.padEnd(cells, " ");
}

function instantFor(el: HTMLElement | null): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return true;
  return Boolean(el?.closest("[data-board-root][data-gl-ready]"));
}

function FlipCell({
  target,
  delay,
  arrival,
  armed,
  host,
  tone,
  size,
  className,
}: {
  target: string;
  delay: number;
  arrival: Arrival | null;
  armed: string | null;
  host: RefObject<HTMLSpanElement | null>;
  tone: FlapRowProps["tone"];
  size: FlapRowProps["size"];
  className?: string;
}) {
  const [shown, setShown] = useState<Shown>({ char: target, prev: null, n: 0 });
  const displayed = useRef(target);
  const jitter = useRef(0);

  useLayoutEffect(() => {
    if (armed === null || armed === displayed.current) return;
    displayed.current = armed;
    setShown((s) => ({ char: armed, prev: null, n: s.n }));
  }, [armed]);

  useEffect(() => {
    const from = displayed.current;
    const path = arrival && arrival.from === null && from === " " ? arrivalPath(target) : flapPath(from, target);
    if (path.length === 0) return;
    if (instantFor(host.current)) {
      displayed.current = target;
      setShown((s) => ({ char: target, prev: null, n: s.n }));
      return;
    }
    if (!jitter.current) jitter.current = 1 + Math.random() * 10;
    const start = performance.now() + delay + jitter.current;
    let last = -1;
    const stop = addTick((_dt, now) => {
      const step = flapStepAt(path, from, now - start, FLAP_STEP_MS);
      if (!step) {
        if (now - start < 0) return true;
        displayed.current = target;
        setShown((s) => (s.char === target ? s : { char: target, prev: path[path.length - 2] ?? from, n: s.n + 1 }));
        return false;
      }
      if (step.index === last) return true;
      last = step.index;
      displayed.current = step.next;
      setShown((s) => ({ char: step.next, prev: step.current, n: s.n + 1 }));
      return true;
    });
    return stop;
  }, [target, delay, arrival, host]);

  return <Flap char={shown.char} previous={shown.prev} flipKey={shown.n} tone={tone} size={size} className={className} />;
}

export function FlipRow({
  text,
  cells,
  align = "left",
  tone = "board",
  size = "sm",
  label,
  uppercase = false,
  className,
  flapClassName,
  arrive = false,
  from,
  delay = 0,
  row = 0,
  ...rest
}: FlipRowProps) {
  const value = pad(uppercase ? text.toUpperCase() : text, cells, align);
  const was = from ?? rest["data-was"];
  const origin = was === undefined ? null : pad(uppercase ? was.toUpperCase() : was, value.length, align);
  const host = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [arrival, setArrival] = useState<Arrival | null>(null);
  const wantsArrival = arrive || origin !== null;

  useEffect(() => {
    const el = host.current;
    if (!wantsArrival || !el || instantFor(el)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setArmed(origin ?? " ".repeat(value.length));
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setArrival({ key: Date.now(), from: origin });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [wantsArrival]);

  const chars = Array.from(value);
  const armedChars = armed === null ? null : Array.from(armed.padEnd(chars.length, " "));
  const waiting = armed !== null && arrival === null;

  return (
    <span ref={host} data-flap-row="" data-flip-row="" data-text={value} className={cn("inline-flex align-middle", className)} {...rest}>
      <span aria-hidden="true" className="flap-row">
        {chars.map((c, i) => (
          <FlipCell
            key={i}
            target={waiting && armedChars ? armedChars[i] : c}
            delay={delay + i * FLAP_COLUMN_STAGGER + row * FLAP_ROW_STAGGER}
            arrival={arrival}
            armed={armedChars ? armedChars[i] : null}
            host={host}
            tone={tone}
            size={size}
            className={flapClassName}
          />
        ))}
      </span>
      <span className="sr-only">{label ?? text}</span>
    </span>
  );
}
