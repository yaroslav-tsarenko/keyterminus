"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardRowLite } from "@/components/home/board-types";
import { REDUCED_MOTION_QUERY } from "@/lib/hooks/useMediaQuery";
import { boardGlAllowed, mountBoard, type BoardHandle } from "@/lib/motion/board/controller";

export interface DepartureBoardGLProps {
  pages: BoardRowLite[][];
  activeQuery?: string;
  onReady?: () => void;
}

function glyphsOf(pages: BoardRowLite[][], query?: string): string[] {
  const out: string[] = [];
  for (const page of pages) for (const row of page) out.push(row.boardTitle.toUpperCase(), row.platformLabel.toUpperCase(), row.price, row.remark ?? "", String(row.platformNumber));
  if (query) out.push(query.toUpperCase());
  return out;
}

export default function DepartureBoardGL({ pages, activeQuery, onReady }: DepartureBoardGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handle = useRef<BoardHandle | null>(null);
  const ready = useRef(onReady);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    ready.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const decide = () => setEnabled(boardGlAllowed().ok);
    decide();
    media.addEventListener("change", decide);
    return () => media.removeEventListener("change", decide);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>("[data-board-root]");
    if (!enabled || !canvas || !root) return;
    const mounted = mountBoard(root, canvas, { seed: [], onReady: () => ready.current?.() });
    handle.current = mounted;
    return () => {
      mounted.dispose();
      handle.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    handle.current?.seed(glyphsOf(pages, activeQuery));
  }, [pages, activeQuery, enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} data-board-canvas="" aria-hidden="true" tabIndex={-1} />;
}
