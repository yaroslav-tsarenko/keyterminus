import { catalogConfig, type CatalogConfig } from "@/config/catalog";
import { ROUTE_WEIGHT, UNTAGGED_ROUTE_WEIGHT } from "@/config/merchandising";
import { CONSOLE_FACTOR, MULTI_PLATFORM_FACTOR, RECENCY_BOOST, RECENCY_HALF_LIFE_YEARS } from "@/lib/catalog/board-weights";
import type { ProductTypeKey } from "@/lib/keys/taxonomy";
import { normalizeKey, stableHash, type Classified, type RejectReason } from "./classify";
import { computeSellPrice } from "./pricing";

export type LiteItem = Pick<Classified, "esaId" | "dedupeKey" | "title" | "displayName" | "productType" | "platform" | "releaseYear" | "genres" | "cost" | "qty" | "faceValue" | "faceCurrency"> & {
  hasCover: boolean;
  hasDescription: boolean;
};

export function liteOf(item: Classified): LiteItem {
  return {
    esaId: item.esaId,
    dedupeKey: item.dedupeKey,
    title: item.title,
    displayName: item.displayName,
    productType: item.productType,
    platform: item.platform,
    releaseYear: item.releaseYear,
    genres: item.genres.slice(0, 8),
    cost: item.cost,
    qty: item.qty,
    faceValue: item.faceValue,
    faceCurrency: item.faceCurrency,
    hasCover: Boolean(item.cover),
    hasDescription: Boolean(item.description),
  };
}

export interface Candidate extends LiteItem {
  sell: number;
  alternates: { esaId: number; cost: number }[];
  descriptionFrom: number | null;
}

export type ClassifyStats = { products: number; rejected: Partial<Record<RejectReason, number>> };

export interface CandidateStats {
  products: number;
  classified: number;
  groups: number;
  duplicates: number;
  eligible: number;
  rejected: Partial<Record<RejectReason | "price_out_of_range" | "price_anomaly" | "face_value_anomaly", number>>;
}

const FACE_TO_EUR: Record<string, number> = { EUR: 1, USD: 0.86, GBP: 1.16 };

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))];
}

export function buildCandidates(
  items: Iterable<LiteItem>,
  classification: ClassifyStats,
  pricing: { margin: number; minMarginAbs: number },
  config: CatalogConfig = catalogConfig,
): { candidates: Candidate[]; stats: CandidateStats } {
  const rejected: CandidateStats["rejected"] = { ...classification.rejected };
  const reject = (reason: keyof CandidateStats["rejected"]) => {
    rejected[reason] = (rejected[reason] ?? 0) + 1;
  };

  const groups = new Map<string, LiteItem[]>();
  let classified = 0;
  for (const item of items) {
    classified++;
    const list = groups.get(item.dedupeKey) ?? [];
    list.push(item);
    groups.set(item.dedupeKey, list);
  }

  const capsRatio = (value: string) => {
    const letters = value.replace(/[^A-Za-z]/g, "");
    return letters.length ? letters.replace(/[^A-Z]/g, "").length / letters.length : 0;
  };
  const picked: Candidate[] = [];
  const tolerance = config.selection.weights.offerTolerance;
  const salt = config.selection.weights.salt;
  for (const list of groups.values()) {
    list.sort((a, b) => a.cost - b.cost || b.qty - a.qty || a.esaId - b.esaId);
    const ceiling = list[0].cost * (1 + tolerance);
    const close = list.filter((c) => c.cost <= ceiling + 1e-9);
    const best = close.sort((a, b) => b.qty - a.qty || stableHash(`${salt}|${a.esaId}`).localeCompare(stableHash(`${salt}|${b.esaId}`)))[0];
    const rest = list.filter((c) => c !== best);
    list.splice(0, list.length, best, ...rest);
    const named = [...list].sort((a, b) => capsRatio(a.title) - capsRatio(b.title))[0];
    picked.push({
      ...list[0],
      title: named.title,
      displayName: named.displayName,
      descriptionFrom: list[0].hasDescription || !named.hasDescription ? null : named.esaId,
      sell: computeSellPrice(list[0].cost, pricing),
      alternates: list.slice(1).map((c) => ({ esaId: c.esaId, cost: c.cost })),
    });
  }

  const cohorts = new Map<string, number[]>();
  const cohortKey = (c: Candidate) => `${c.productType}|${c.releaseYear ? Math.min(Math.floor((new Date().getUTCFullYear() - c.releaseYear) / 2), 6) : "x"}`;
  for (const c of picked) {
    if (c.productType !== "game" && c.productType !== "dlc") continue;
    const list = cohorts.get(cohortKey(c)) ?? [];
    list.push(c.cost);
    cohorts.set(cohortKey(c), list);
  }
  const cohortCeiling = new Map(
    [...cohorts.entries()].filter(([, v]) => v.length >= config.anomaly.minCohortSize).map(([k, v]) => [k, Math.max(config.anomaly.cohortFloor, percentile(v, config.anomaly.cohortPercentile) * config.anomaly.cohortMultiplier)]),
  );
  const siblings = new Map<string, number[]>();
  for (const c of picked) {
    const key = `${c.productType}|${normalizeKey(c.title)}`;
    const list = siblings.get(key) ?? [];
    list.push(c.cost);
    siblings.set(key, list);
  }

  const candidates: Candidate[] = [];
  for (const c of picked) {
    if (c.sell < config.pricing.minPrice || c.sell > config.pricing.maxPriceByType[c.productType]) {
      reject("price_out_of_range");
      continue;
    }
    const ceiling = cohortCeiling.get(cohortKey(c));
    const others = (siblings.get(`${c.productType}|${normalizeKey(c.title)}`) ?? []).filter((v) => v !== c.cost);
    const siblingMedian = others.length ? median(others) : null;
    if ((ceiling !== undefined && c.cost > ceiling) || (siblingMedian !== null && c.cost > config.anomaly.cohortFloor && c.cost > siblingMedian * config.anomaly.siblingMultiplier)) {
      reject("price_anomaly");
      continue;
    }
    if (c.faceValue && c.faceCurrency) {
      const faceEur = c.faceValue * (FACE_TO_EUR[c.faceCurrency] ?? 1);
      if (c.cost < faceEur * config.anomaly.faceValueMin || c.cost > faceEur * config.anomaly.faceValueMax) {
        reject("face_value_anomaly");
        continue;
      }
    }
    candidates.push(c);
  }

  return {
    candidates,
    stats: {
      products: classification.products,
      classified,
      groups: groups.size,
      duplicates: classified - groups.size,
      eligible: candidates.length,
      rejected,
    },
  };
}

export function priceBand(price: number, bands: number[] = catalogConfig.pricing.bands): number {
  const index = bands.findIndex((limit) => price < limit);
  return index === -1 ? bands.length : index;
}

function dedupeParts(dedupeKey: string) {
  const [type = "", base = "", edition = "", platform = "", region = ""] = dedupeKey.split("|");
  return { type, base, edition, platform, region };
}

function saltedUnit(salt: string, key: string): number {
  return parseInt(stableHash(`${salt}|${key}`).slice(0, 8), 16) / 0xffffffff;
}

export function candidateBoardScore(c: Pick<Candidate, "genres" | "releaseYear" | "platform">, multiPlatform: boolean, now = new Date()): number {
  const genre = c.genres.length ? Math.max(...c.genres.map((g) => ROUTE_WEIGHT[g] ?? UNTAGGED_ROUTE_WEIGHT)) : UNTAGGED_ROUTE_WEIGHT;
  const age = c.releaseYear ? Math.max(0, now.getUTCFullYear() + now.getUTCMonth() / 12 - (c.releaseYear + 0.5)) : null;
  const recency = age === null ? 1 : 1 + RECENCY_BOOST * Math.pow(0.5, age / RECENCY_HALF_LIFE_YEARS);
  const console = c.platform === "xbox" || c.platform === "playstation" || c.platform === "nintendo" ? CONSOLE_FACTOR : 1;
  return genre * recency * console * (multiPlatform ? MULTI_PLATFORM_FACTOR : 1);
}

export function selectionScores(candidates: Candidate[], stable: Set<string>, config: CatalogConfig = catalogConfig): Map<string, number> {
  const w = config.selection.weights;
  const platformsByBase = new Map<string, Set<string>>();
  for (const c of candidates) {
    const { type, base, platform } = dedupeParts(c.dedupeKey);
    const key = `${type}|${base}`;
    const set = platformsByBase.get(key) ?? new Set<string>();
    set.add(platform);
    platformsByBase.set(key, set);
  }
  const scores = new Map<string, number>();
  for (const c of candidates) {
    const { type, base, edition, region } = dedupeParts(c.dedupeKey);
    const multi = (platformsByBase.get(`${type}|${base}`)?.size ?? 0) >= 2;
    const editionWeight = edition ? (w.edition.find((e) => e.match.test(edition))?.weight ?? 1) : w.plainEdition;
    const zoneWeight = w.zone[priceBand(c.sell, config.pricing.bands)] ?? 1;
    const stock = w.stock.min + (w.stock.max - w.stock.min) * Math.min(1, Math.log10(c.qty + 1) / 3);
    const score =
      candidateBoardScore(c, multi) *
      (w.region[region as keyof typeof w.region] ?? 1) *
      zoneWeight *
      editionWeight *
      stock *
      (stable.has(c.dedupeKey) ? w.stability : 1) *
      (1 + w.jitter * saltedUnit(w.salt, c.dedupeKey));
    scores.set(c.dedupeKey, score);
  }
  return scores;
}

export function selectCatalog(candidates: Candidate[], stable: Set<string> = new Set(), config: CatalogConfig = catalogConfig): Candidate[] {
  const scores = selectionScores(candidates, stable, config);
  const ranked = [...candidates].sort((a, b) => (scores.get(b.dedupeKey) ?? 0) - (scores.get(a.dedupeKey) ?? 0) || a.dedupeKey.localeCompare(b.dedupeKey));
  const titleKey = (c: Candidate) => `${c.productType}|${normalizeKey(c.title)}`;
  const workKey = (c: Candidate) => {
    const { type, base, platform } = dedupeParts(c.dedupeKey);
    return `${type}|${base}|${platform}`;
  };
  const selected: Candidate[] = [];
  const chosen = new Set<string>();
  const perTitle = new Map<string, number>();
  const perWork = new Map<string, number>();
  const take = (c: Candidate) => {
    const key = titleKey(c);
    const work = workKey(c);
    const n = perTitle.get(key) ?? 0;
    const e = perWork.get(work) ?? 0;
    if (n >= config.selection.maxPerTitle || e >= config.selection.editionsPerWork) return false;
    perTitle.set(key, n + 1);
    perWork.set(work, e + 1);
    selected.push(c);
    chosen.add(c.dedupeKey);
    return true;
  };

  for (const quota of config.quotas) {
    const pool = ranked.filter((c) => c.productType === (quota.type as ProductTypeKey));
    const caps = new Map(Object.entries(quota.platformShares ?? {}).map(([platform, share]) => [platform, Math.ceil(quota.cap * (share ?? 1))]));
    const perPlatform = new Map<string, number>();
    let count = 0;
    for (const c of pool) {
      if (count >= quota.cap) break;
      const used = perPlatform.get(c.platform) ?? 0;
      const cap = caps.get(c.platform);
      if (cap !== undefined && used >= cap) continue;
      if (!take(c)) continue;
      perPlatform.set(c.platform, used + 1);
      count++;
    }
  }

  const limit = Math.min(config.target.max, config.quotas.reduce((sum, q) => sum + q.cap, 0));
  if (selected.length < limit && config.selection.spillover.length) {
    for (const type of config.selection.spillover) {
      for (const c of ranked) {
        if (selected.length >= limit) break;
        if (c.productType !== type || chosen.has(c.dedupeKey)) continue;
        take(c);
      }
    }
  }

  return selected.slice(0, config.target.max);
}
