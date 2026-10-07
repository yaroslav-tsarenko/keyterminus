import type { PlatformKey, ProductTypeKey, RegionKey } from "@/lib/keys/taxonomy";
import { FARE_ZONE_EDGES } from "@/config/merchandising";

export interface TypeQuota {
  type: ProductTypeKey;
  cap: number;
  platformShares?: Partial<Record<PlatformKey, number>>;
}

export interface SelectionWeights {
  region: Partial<Record<RegionKey, number>>;
  zone: number[];
  edition: { match: RegExp; weight: number }[];
  plainEdition: number;
  stock: { min: number; max: number };
  stability: number;
  jitter: number;
  salt: string;
  offerTolerance: number;
}

export interface CatalogConfig {
  target: { min: number; max: number };
  quotas: TypeQuota[];
  pricing: {
    margin: number;
    minMarginAbs: number;
    priceTolerance: number;
    orderPriceTolerance: number;
    minPrice: number;
    maxPriceByType: Record<ProductTypeKey, number>;
    bands: number[];
  };
  anomaly: {
    cohortPercentile: number;
    cohortMultiplier: number;
    cohortFloor: number;
    siblingMultiplier: number;
    minCohortSize: number;
    faceValueMin: number;
    faceValueMax: number;
  };
  include: {
    regions: RegionKey[];
    minTextQty: number;
    requireCover: boolean;
    requireEnglishName: boolean;
    allowPreorders: boolean;
  };
  exclude: {
    regionTerms: string[];
    titleTerms: string[];
    adultTerms: string[];
    gamblingTerms: string[];
    publishers: string[];
    languagesOnly: string[];
    platforms: string[];
  };
  selection: {
    keepExisting: boolean;
    maxPerTitle: number;
    editionsPerWork: number;
    spillover: ProductTypeKey[];
    weights: SelectionWeights;
  };
  sync: {
    pageSize: number;
    concurrency: number;
    maxPages: number | null;
    chunkSize: number;
    stagingDir: string;
    resumeMaxAgeHours: number;
    refreshBatch: number;
    refreshConcurrency: number;
    refreshBudgetMs: number;
  };
}

export const catalogConfig: CatalogConfig = {
  target: { min: 65000, max: 75000 },
  quotas: [
    { type: "game", cap: 40000, platformShares: { steam: 0.48, gog: 0.14, xbox: 0.16, nintendo: 0.12, epic: 0.08 } },
    { type: "dlc", cap: 14000, platformShares: { steam: 0.8 } },
    { type: "gift-card", cap: 4500 },
    { type: "subscription", cap: 2500 },
    { type: "top-up", cap: 5000 },
    { type: "software", cap: 2000 },
  ],
  pricing: {
    margin: 0.125,
    minMarginAbs: 0.32,
    priceTolerance: 0.05,
    orderPriceTolerance: 0.02,
    minPrice: 0.49,
    maxPriceByType: {
      game: 150,
      dlc: 90,
      subscription: 180,
      "gift-card": 220,
      "top-up": 180,
      software: 260,
    },
    bands: [...FARE_ZONE_EDGES],
  },
  anomaly: {
    cohortPercentile: 0.95,
    cohortMultiplier: 1.6,
    cohortFloor: 30,
    siblingMultiplier: 4,
    minCohortSize: 15,
    faceValueMin: 0.6,
    faceValueMax: 1.35,
  },
  include: {
    regions: ["global", "europe", "uk", "us", "north-america"],
    minTextQty: 1,
    requireCover: true,
    requireEnglishName: true,
    allowPreorders: false,
  },
  exclude: {
    regionTerms: ["russia", "russian federation", "ru vpn", "ru/cis", "cis", "belarus", "iran", "north korea", "syria", "cuba", "crimea", "donetsk", "luhansk"],
    titleTerms: ["vpn", "ru/cis", "cis only", "russia only", "ru only", "ru language", "russian language only", "cis key", " ru key", "(ru)", "[ru]", "- ru", "russia", "belarus"],
    adultTerms: ["hentai", "nsfw", "adult only", "adults only", "18+", "nudity", "sexual content", "erotic", "porn", "xxx", "uncensored"],
    gamblingTerms: ["random", "mystery", "loot box", "lootbox", "surprise key", "casino", "slots", "gambling", "lucky box", "blind box", "mystery box"],
    publishers: ["kaspersky"],
    languagesOnly: ["Russian", "Belarusian", "Kazakh"],
    platforms: ["xbox 360", "playstation 3", "ps3", "android", "ios", "mog station"],
  },
  selection: {
    keepExisting: true,
    maxPerTitle: 3,
    editionsPerWork: 3,
    spillover: ["game", "dlc"],
    weights: {
      region: { global: 1.05, europe: 1, uk: 0.98, us: 0.96, "north-america": 0.96 },
      zone: [1.0, 1.1, 1.08, 1.0, 0.94, 0.85],
      edition: [
        { match: /collector/, weight: 0.9 },
        { match: /ultimate/, weight: 0.96 },
        { match: /complete|definitive/, weight: 0.98 },
        { match: /deluxe/, weight: 1.0 },
        { match: /gold/, weight: 1.02 },
        { match: /standard/, weight: 1.06 },
      ],
      plainEdition: 1.06,
      stock: { min: 0.94, max: 1 },
      stability: 1.25,
      jitter: 0.06,
      salt: "keyterminus",
      offerTolerance: 0.04,
    },
  },
  sync: {
    pageSize: 100,
    concurrency: 4,
    maxPages: null,
    chunkSize: 500,
    stagingDir: ".cache/catalog-sync",
    resumeMaxAgeHours: 24,
    refreshBatch: 100,
    refreshConcurrency: 3,
    refreshBudgetMs: 240_000,
  },
};

export function quotaTotal(): number {
  return catalogConfig.quotas.reduce((sum, q) => sum + q.cap, 0);
}

export type ProductFeedId = "google" | "facebook" | "generic";

export const PRODUCT_FEEDS: Record<ProductFeedId, { enabled: boolean; reason: string }> = {
  google: {
    enabled: false,
    reason: "Off: Google Shopping does not accept activation keys and other digital codes, and repeated disapprovals can suspend the Merchant Center account.",
  },
  facebook: {
    enabled: false,
    reason: "Off: Meta's commerce policies do not allow digital products in catalogues and shops.",
  },
  generic: {
    enabled: false,
    reason: "Off: no partner consumes this feed yet. Turn it on in src/config/catalog.ts when one does.",
  },
};

export const ANY_PRODUCT_FEED_ENABLED = Object.values(PRODUCT_FEEDS).some((feed) => feed.enabled);

export type { PlatformKey };
