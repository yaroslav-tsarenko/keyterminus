import { FARE_ZONE_EDGES, MERCH } from "@/config/merchandising";

export const HOME_LEGACY = {
  ...MERCH,
  bandItems: 8,
  bandMinimum: 4,
  releases: 16,
  releaseMinimum: 4,
  doorCovers: 12,
  ctaCovers: 6,
  lockerCovers: 3,
  dealRail: 10,
  genres: 18,
  genrePeek: 3,
} as const;

export const PRICE_BAND_EDGES = FARE_ZONE_EDGES;
