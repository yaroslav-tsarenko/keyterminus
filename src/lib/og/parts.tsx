import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { LOCKUP, MARK, WORDMARK } from "@/lib/brand-mark";
import { OG_PALETTE as P, OG_SIZE, ogFonts } from "./assets";

export async function ogResponse(element: ReactElement, cacheSeconds = 86400) {
  const fonts = await ogFonts();
  return new ImageResponse(element, {
    ...OG_SIZE,
    fonts,
    headers: { "Cache-Control": `public, max-age=${Math.min(cacheSeconds, 3600)}, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds}` },
  });
}

export function Wordmark({ height, color = P.ink, bar = P.bar }: { height: number; color?: string; bar?: string }) {
  const { viewBox, mark, lettersX } = LOCKUP;
  const width = (height * viewBox.width) / viewBox.height;
  return (
    <svg width={width} height={height} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}>
      <g transform={`translate(${mark.translateX} ${mark.translateY}) scale(${mark.scale})`}>
        <path d={MARK.full.key} fill={color} />
        <rect x={MARK.full.bar.x} y={MARK.full.bar.y} width={MARK.full.bar.width} height={MARK.full.bar.height} fill={bar} />
      </g>
      <path d={WORDMARK.letters} fill={color} transform={`translate(${lettersX} 0)`} />
    </svg>
  );
}

export function SignLabel({ children, color = P.inkMuted, size = 18 }: { children: string; color?: string; size?: number }) {
  return <div style={{ display: "flex", fontFamily: "Overpass", fontWeight: 700, fontSize: size, letterSpacing: size * 0.14, textTransform: "uppercase", color }}>{children}</div>;
}

export function Flap({ char, size, remark = false }: { char: string; size: number; remark?: boolean }) {
  const w = Math.round(size * 0.98);
  const h = Math.round(size * 1.55);
  return (
    <div style={{ display: "flex", position: "relative", width: w, height: h, borderRadius: 2, background: P.flap, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ display: "flex", position: "absolute", left: 0, right: 0, top: 0, height: h / 2, background: P.flapTop }} />
      <div style={{ display: "flex", position: "relative", fontFamily: "Sometype Mono", fontWeight: 600, fontSize: size, color: remark ? P.remark : P.onBoard, lineHeight: 1 }}>{char === " " ? "" : char}</div>
      <div style={{ display: "flex", position: "absolute", left: 0, right: 0, top: h / 2 - 1, height: 2, background: P.hinge }} />
    </div>
  );
}

export function FlapText({ text, cells, size, remark = false, align = "left" }: { text: string; cells: number; size: number; remark?: boolean; align?: "left" | "right" }) {
  const value = text.length >= cells ? text.slice(0, cells) : align === "right" ? text.padStart(cells, " ") : text.padEnd(cells, " ");
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from(value).map((c, i) => (
        <Flap key={i} char={c} size={size} remark={remark} />
      ))}
    </div>
  );
}

export function BoardPanel({ rows, cells, remarkCells, size, heads }: { rows: { text: string; remark: string }[]; cells: number; remarkCells: number; size: number; heads?: [string, string] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 22, borderRadius: 10, background: P.board, border: `1px solid ${P.boardEdge}` }}>
      {heads ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <SignLabel color={P.onBoardMuted} size={14}>
            {heads[0]}
          </SignLabel>
          <SignLabel color={P.onBoardMuted} size={14}>
            {heads[1]}
          </SignLabel>
        </div>
      ) : null}
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: size * 0.8 }}>
          <FlapText text={row.text} cells={cells} size={size} />
          <FlapText text={row.remark} cells={remarkCells} size={size} remark />
        </div>
      ))}
    </div>
  );
}

export function TerminusRule({ width }: { width: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width }}>
      <div style={{ display: "flex", flex: 1, height: 3, background: P.ink }} />
      <div style={{ display: "flex", width: 6, height: 28, background: P.bar }} />
    </div>
  );
}

export function titleSize(text: string, sizes: [number, number][]): number {
  for (const [max, size] of sizes) if (text.length <= max) return size;
  return sizes[sizes.length - 1][1];
}
