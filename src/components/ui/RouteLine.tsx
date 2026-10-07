import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type StopState = "done" | "current" | "upcoming" | "station";

export interface RouteStop {
  key: string;
  label: ReactNode;
  meta?: ReactNode;
  href?: string;
  state?: StopState;
  check?: boolean;
  leading?: ReactNode;
  srLabel?: string;
}

export interface RouteTerminus {
  label?: ReactNode;
  href?: string;
  tone?: "terminus" | "ink" | "danger" | "muted";
  srLabel?: string;
}

export interface RouteLineProps {
  stops: RouteStop[];
  orientation?: "horizontal" | "vertical" | "responsive";
  terminus?: RouteTerminus | null;
  label?: string;
  className?: string;
  labelClassName?: string;
  compactLabels?: boolean;
  demo?: boolean;
  "data-route-line"?: string;
}

function Segment({ dashed }: { dashed: boolean }) {
  return (
    <svg aria-hidden="true" className="route-seg" data-dashed={dashed || undefined}>
      <line className="route-seg-h" x1="0" y1="50%" x2="100%" y2="50%" pathLength={dashed ? undefined : 1} />
      <line className="route-seg-v" x1="50%" y1="0" x2="50%" y2="100%" pathLength={dashed ? undefined : 1} />
    </svg>
  );
}

export function RouteLine({ stops, orientation = "horizontal", terminus, label, className, labelClassName, compactLabels = false, demo = false, ...rest }: RouteLineProps) {
  const states = stops.map((s) => s.state ?? "station");
  const lastDoneOrCurrent = states.reduce((acc, s, i) => (s !== "upcoming" ? i : acc), -1);
  const terminusDashed = states[states.length - 1] === "upcoming" || (states.includes("current") && states[states.length - 1] !== "done");
  return (
    <div data-route="" data-orientation={orientation} className={cn("route", className)} {...rest}>
      <ol aria-label={label} className="route-stops">
        {stops.map((stop, i) => {
          const state = states[i];
          const isLast = i === stops.length - 1;
          const nextUpcoming = isLast ? terminusDashed || !terminus : states[i + 1] === "upcoming" && i >= lastDoneOrCurrent;
          const showSegment = !isLast || Boolean(terminus);
          const content = (
            <>
              <span aria-hidden="true" className="route-stop" data-state={state}>
                {state === "done" && stop.check ? <Check size={10} strokeWidth={3.5} className="text-surface" /> : null}
              </span>
              <span className={cn("route-label", compactLabels && state !== "current" && "max-sm:sr-only", labelClassName)} data-state={state}>
                {stop.leading}
                <span className="route-name">{stop.label}</span>
                {stop.meta ? <span className="route-meta">{stop.meta}</span> : null}
                {stop.srLabel ? <span className="sr-only">{stop.srLabel}</span> : null}
              </span>
            </>
          );
          return (
            <li key={stop.key} data-state={state} aria-current={state === "current" ? "step" : undefined} className="route-item">
              {showSegment ? <Segment dashed={nextUpcoming} /> : null}
              {stop.href && !demo ? (
                <Link href={stop.href} className="route-link">
                  {content}
                </Link>
              ) : stop.href && demo ? (
                <span className="route-link">{content}</span>
              ) : (
                <span className="route-link">{content}</span>
              )}
            </li>
          );
        })}
      </ol>
      {terminus ? (
        <div className="route-terminus" data-tone={terminus.tone ?? "terminus"}>
          {terminus.href && !demo ? (
            <Link href={terminus.href} className="route-terminus-link">
              <span aria-hidden="true" className="route-bar" />
              {terminus.label ? <span className="route-terminus-label">{terminus.label}</span> : null}
              {terminus.srLabel ? <span className="sr-only">{terminus.srLabel}</span> : null}
            </Link>
          ) : (
            <span className="route-terminus-link">
              <span aria-hidden="true" className="route-bar" />
              {terminus.label ? <span className="route-terminus-label">{terminus.label}</span> : null}
              {terminus.srLabel ? <span className="sr-only">{terminus.srLabel}</span> : null}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
