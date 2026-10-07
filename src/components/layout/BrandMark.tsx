import type { SVGProps } from "react";
import { LOCKUP, MARK, WORDMARK } from "@/lib/brand-mark";

type MarkProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  title?: string;
};

type Drawing = "full" | "small";

function a11y(title?: string) {
  return title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
}

function MarkShape({ size = "full" }: { size?: Drawing }) {
  const { key, bar } = MARK[size];
  return (
    <>
      <path d={key} fill="currentColor" />
      <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill="var(--logo-bar, currentColor)" />
    </>
  );
}

export function Mark({ title, className, size = "full", ...rest }: MarkProps & { size?: Drawing }) {
  const { crop } = MARK;
  return (
    <svg viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} xmlns="http://www.w3.org/2000/svg" className={className} focusable="false" {...a11y(title)} {...rest}>
      <MarkShape size={size} />
    </svg>
  );
}

export function Wordmark({ title, className, mark = true, ...rest }: MarkProps & { mark?: boolean }) {
  if (!mark) {
    const top = -WORDMARK.ascender;
    return (
      <svg
        viewBox={`${WORDMARK.left} ${top} ${WORDMARK.width - WORDMARK.left} ${WORDMARK.ascender + WORDMARK.descender}`}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        focusable="false"
        {...a11y(title)}
        {...rest}
      >
        <path d={WORDMARK.letters} fill="currentColor" />
      </svg>
    );
  }
  const { viewBox, mark: m, lettersX } = LOCKUP;
  return (
    <svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} xmlns="http://www.w3.org/2000/svg" className={className} focusable="false" {...a11y(title)} {...rest}>
      <g transform={`translate(${m.translateX} ${m.translateY}) scale(${m.scale})`}>
        <MarkShape size="full" />
      </g>
      <path d={WORDMARK.letters} fill="currentColor" transform={`translate(${lettersX} 0)`} />
    </svg>
  );
}
