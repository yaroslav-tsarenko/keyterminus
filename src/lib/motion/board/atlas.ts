import { DRUM } from "../flap";

export const ATLAS = { width: 2048, height: 512, cellW: 64, cellH: 96 } as const;
export const ATLAS_COLS = ATLAS.width / ATLAS.cellW;
export const ATLAS_ROWS = ATLAS.height / ATLAS.cellH;
const CAPACITY = ATLAS_COLS * Math.floor(ATLAS_ROWS);
const TILE_EM = 1.55;

export interface GlyphFont {
  family: string;
  weight: string;
}

export interface GlyphAtlas {
  canvas: HTMLCanvasElement;
  index: (char: string) => number;
  ensure: (chars: Iterable<string>) => boolean;
}

export function createAtlas(font: GlyphFont, seed: Iterable<string>): GlyphAtlas {
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS.width;
  canvas.height = ATLAS.height;
  const ctx = canvas.getContext("2d");
  const glyphs: string[] = [];
  const lookup = new Map<string, number>();
  const size = ATLAS.cellH / TILE_EM;

  const paint = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${font.weight} ${size}px ${font.family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    const probe = ctx.measureText("H");
    const ascent = probe.fontBoundingBoxAscent || probe.actualBoundingBoxAscent || size * 0.8;
    const descent = probe.fontBoundingBoxDescent || size * 0.2;
    const baseline = ATLAS.cellH / 2 + (ascent - descent) / 2;
    glyphs.forEach((char, i) => {
      if (char === " ") return;
      const col = i % ATLAS_COLS;
      const row = Math.floor(i / ATLAS_COLS);
      ctx.fillText(char, col * ATLAS.cellW + ATLAS.cellW / 2, row * ATLAS.cellH + baseline);
    });
  };

  const add = (char: string) => {
    if (lookup.has(char) || glyphs.length >= CAPACITY) return false;
    lookup.set(char, glyphs.length);
    glyphs.push(char);
    return true;
  };

  const ensure = (chars: Iterable<string>) => {
    let changed = false;
    for (const char of chars) if (add(char)) changed = true;
    if (changed) paint();
    return changed;
  };

  add(" ");
  for (const char of DRUM) add(char);
  ensure(seed);
  paint();

  return { canvas, index: (char) => lookup.get(char) ?? 0, ensure };
}
