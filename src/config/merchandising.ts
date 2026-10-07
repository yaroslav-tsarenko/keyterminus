import type { PlatformKey, ProductTypeKey } from "@/lib/keys/taxonomy";

export interface PlatformBoardEntry {
  key: PlatformKey;
  number: number | null;
  name: string;
  boardLabel: string;
  shortLabel: string;
  share: number;
}

export const PLATFORM_BOARD: PlatformBoardEntry[] = [
  { key: "steam", number: 1, name: "Steam", boardLabel: "STEAM", shortLabel: "STEAM", share: 0.38 },
  { key: "xbox", number: 2, name: "Xbox", boardLabel: "XBOX", shortLabel: "XBOX", share: 0.16 },
  { key: "playstation", number: 3, name: "PlayStation", boardLabel: "PLAYSTATION", shortLabel: "PS", share: 0.08 },
  { key: "nintendo", number: 4, name: "Nintendo", boardLabel: "NINTENDO", shortLabel: "NINTENDO", share: 0.12 },
  { key: "epic", number: 5, name: "Epic Games", boardLabel: "EPIC GAMES", shortLabel: "EPIC", share: 0.08 },
  { key: "gog", number: 6, name: "GOG", boardLabel: "GOG", shortLabel: "GOG", share: 0.1 },
  { key: "ea-app", number: 7, name: "EA app", boardLabel: "EA APP", shortLabel: "EA APP", share: 0.02 },
  { key: "ubisoft-connect", number: 8, name: "Ubisoft Connect", boardLabel: "UBISOFT", shortLabel: "UBISOFT", share: 0.02 },
  { key: "battle-net", number: 9, name: "Battle.net", boardLabel: "BATTLE.NET", shortLabel: "BNET", share: 0.02 },
  { key: "rockstar", number: 10, name: "Rockstar", boardLabel: "ROCKSTAR", shortLabel: "ROCKSTAR", share: 0.02 },
  { key: "other", number: null, name: "Other", boardLabel: "OTHER", shortLabel: "OTHER", share: 0.02 },
];

export const PLATFORM_ORDER: PlatformKey[] = PLATFORM_BOARD.map((p) => p.key);

export function platformBoard(key: string | null | undefined): PlatformBoardEntry {
  return PLATFORM_BOARD.find((p) => p.key === key) ?? PLATFORM_BOARD[PLATFORM_BOARD.length - 1];
}

export const TYPE_ORDER: ProductTypeKey[] = ["game", "gift-card", "subscription", "dlc", "top-up", "software"];

export const ROUTE_ORDER = [
  "racing",
  "sports",
  "fighting",
  "shooter",
  "co-op",
  "action",
  "survival",
  "open-world",
  "simulation",
  "strategy",
  "horror",
  "platformer",
  "rpg",
  "adventure",
  "puzzle",
  "story-rich",
  "casual",
  "indie",
  "vr",
  "mmo",
] as const;

export const ROUTE_WEIGHT: Record<string, number> = {
  racing: 1.4,
  sports: 1.35,
  fighting: 1.3,
  shooter: 1.3,
  "co-op": 1.3,
  action: 1.2,
  survival: 1.15,
  "open-world": 1.12,
  simulation: 1.05,
  strategy: 1,
  horror: 1,
  platformer: 0.98,
  rpg: 0.95,
  adventure: 0.92,
  mmo: 0.9,
  puzzle: 0.85,
  "story-rich": 0.85,
  casual: 0.82,
  indie: 0.8,
  vr: 0.72,
};

export const UNTAGGED_ROUTE_WEIGHT = 0.9;

export function orderIndex<T extends string>(order: readonly T[], key: string): number {
  const i = order.indexOf(key as T);
  return i < 0 ? order.length : i;
}

export interface FareZone {
  key: string;
  min: number | null;
  max: number | null;
}

export const FARE_ZONE_EDGES = [3, 8, 18, 35, 70] as const;

export const FARE_ZONES: FareZone[] = [
  { key: "under-3", min: null, max: 3 },
  { key: "3-8", min: 3, max: 8 },
  { key: "8-18", min: 8, max: 18 },
  { key: "18-35", min: 18, max: 35 },
  { key: "35-70", min: 35, max: 70 },
  { key: "70-up", min: 70, max: null },
];

export const MERCH = {
  boardRows: 18,
  boardPerPlatform: 5,
  boardExcludeTopOrdered: 200,
  boardDeals: 3,
  boardNew: 3,
  peek: 3,
  lineItems: 12,
  lineMinimum: 6,
  linePerPlatform: 3,
  routes: 8,
  routeStops: 4,
  routeMinimum: 50,
  fares: 10,
  dealMinimum: 4,
  giftCardPlatforms: 5,
  timetableRows: 8,
  releaseWindowDays: 56,
  related: 5,
  recentlyViewed: 8,
  homePoolPerPlatform: 600,
} as const;
