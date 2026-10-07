export const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-–−·/&'!?+%€£$()";

export const FLAP_STEP_MS = 70;
export const FLAP_FAST_STEP_MS = 40;
export const FLAP_MAX_STEPS = 10;
export const FLAP_COLUMN_STAGGER = 18;
export const FLAP_ROW_STAGGER = 60;

function drumIndex(char: string): number {
  const i = DRUM.indexOf(char.toUpperCase());
  return i < 0 ? 0 : i;
}

export function flapPath(from: string, to: string): string[] {
  if (from === to) return [];
  const start = drumIndex(from);
  const end = drumIndex(to);
  const known = DRUM.includes(to.toUpperCase());
  const steps: string[] = [];
  let i = start;
  while (i !== end && steps.length < DRUM.length) {
    i = (i + 1) % DRUM.length;
    steps.push(DRUM[i]);
  }
  if (!known || steps[steps.length - 1] !== to) steps.push(to);
  if (steps.length <= FLAP_MAX_STEPS) return steps;
  return steps.slice(steps.length - FLAP_MAX_STEPS);
}

export function arrivalPath(target: string, steps = 4): string[] {
  if (target === " ") return [];
  const end = drumIndex(target);
  const path = [" "];
  if (DRUM.includes(target.toUpperCase())) {
    for (let k = Math.min(steps, end - 1); k >= 1; k--) path.push(DRUM[end - k]);
  }
  path.push(target);
  return path;
}

export function flapStepAt(path: string[], from: string, local: number, stepMs = FLAP_STEP_MS): { index: number; current: string; next: string; progress: number } | null {
  if (path.length === 0 || local < 0) return null;
  const index = Math.floor(local / stepMs);
  if (index >= path.length) return null;
  return { index, current: index === 0 ? from : path[index - 1], next: path[index], progress: (local - index * stepMs) / stepMs };
}

export interface FlapFrame {
  top: string;
  bottom: string;
  falling: string | null;
  angle: number;
  done: boolean;
}

export function flapFrame(from: string, to: string, cellIndex: number, t: number, rowIndex = 0): FlapFrame {
  const path = flapPath(from, to);
  const delay = cellIndex * FLAP_COLUMN_STAGGER + rowIndex * FLAP_ROW_STAGGER;
  const local = t - delay;
  if (path.length === 0 || local >= path.length * FLAP_STEP_MS) return { top: to, bottom: to, falling: null, angle: 0, done: true };
  if (local <= 0) return { top: from, bottom: from, falling: null, angle: 0, done: false };
  const step = Math.min(path.length - 1, Math.floor(local / FLAP_STEP_MS));
  const progress = (local - step * FLAP_STEP_MS) / FLAP_STEP_MS;
  const current = step === 0 ? from : path[step - 1];
  const next = path[step];
  const eased = progress * progress * progress;
  return { top: next, bottom: current, falling: current, angle: -180 * eased, done: false };
}

export function flapDuration(from: string, to: string, cells: number, rows = 1): number {
  const longest = Math.max(from.length, to.length);
  let steps = 0;
  for (let i = 0; i < longest; i++) steps = Math.max(steps, flapPath(from[i] ?? " ", to[i] ?? " ").length);
  return steps * FLAP_STEP_MS + (cells - 1) * FLAP_COLUMN_STAGGER + (rows - 1) * FLAP_ROW_STAGGER;
}
