export const MOTION_DURATION = {
  micro: 120,
  ui: 180,
  panel: 240,
  panelClose: 180,
  flap: 70,
  reveal: 560,
  reduced: 100,
  cartFlight: 380,
  keyFlip: 1100,
  boardPage: 7000,
  boardFade: 400,
  boardArrival: 900,
  gateFlip: 140,
  routeDraw: 700,
  stopIn: 160,
  routeMarker: 600,
  nextStop: 420,
} as const;

export const MOTION_EASE = {
  flap: [0.55, 0, 1, 0.45],
  sign: [0.2, 0, 0, 1],
  std: [0.4, 0, 0.2, 1],
  inOut: [0.76, 0, 0.24, 1],
  outExpo: [0.16, 1, 0.3, 1],
} as const;

export type MotionEase = keyof typeof MOTION_EASE;

export function cssEase(name: MotionEase): string {
  return `cubic-bezier(${MOTION_EASE[name].join(", ")})`;
}

export const MOTION_DEPTH = {
  D0: { pointer: 0, scroll: 0 },
  D1: { pointer: 2, scroll: 0.03 },
  D2: { pointer: 4, scroll: 0.06 },
  D3: { pointer: 6, scroll: 0.1 },
  L0: { pointer: 0, scroll: 0 },
} as const;

export const MOTION_STAGGER = { chars: 18, rows: 60, cards: 70, stops: 90, keyChars: 30 } as const;

export const MOTION_LIMITS = {
  flapMaxSteps: 10,
  flapRebound: 3,
  riffleAngle: 10,
  riffleMin: 4,
  riffleRadius: 60,
  boardPitch: 12,
  boardRest: 4,
  dprCap: 1.5,
  pointerTilt: 2,
  depthMax: 12,
  railRise: 6,
  cartGhost: 40,
  cartGhostOpacity: 0.9,
} as const;

export const MOTION_QUERY = {
  finePointer: "(hover: hover) and (pointer: fine)",
  coarsePointer: "(pointer: coarse)",
} as const;
