import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { memoize } from "@/lib/utils/memo";
import { PLATFORMS, genreDef } from "@/lib/keys/taxonomy";
import { platformInfo } from "@/lib/catalog/platforms";
import { getBoardPages, homeBoardPool } from "@/lib/catalog/board-pool";
import { boardPrice, boardTitle } from "@/lib/catalog/board-text";
import { dealPercent, remarkFor } from "@/lib/catalog/remarks";
import { genrePlatformCounts } from "@/lib/catalog/live-stock";
import { giftCardGroups, subscriptionTimetable, type GiftCardGroup, type Timetable, type TimetableRow } from "@/lib/catalog/prepaid";
import { loadKeyProducts } from "@/components/catalog/catalog-query";
import { remarkLabel, remarkText } from "@/components/ui/Remark";
import { MERCH, PLATFORM_ORDER, ROUTE_ORDER, orderIndex } from "@/config/merchandising";
import { ACTIVATION } from "@/config/activation";
import { STORE_POLICY } from "@/config/store-policy";
import type { BoardRow } from "@/lib/catalog/board-pool";
import type { BoardRowView, FareRow, HomeData, HomeGiftCard, HomeLine, HomePlatform, HomeRoute } from "./types";

const LIVE = Prisma.sql`p."status" = 'ACTIVE'::"ProductStatus" AND p."quantity" > 0 AND (k."releaseDate" IS NULL OR k."releaseDate" <= now())`;
const HAS_COVER = Prisma.sql`EXISTS (SELECT 1 FROM "ProductImage" c WHERE c."productId" = p."id" AND c."sortOrder" = 0)`;
const CONSOLES = ["xbox", "playstation", "nintendo"];
const REGION_RANK = ["global", "europe", "uk", "us", "north-america"];

function notClaimed(ids: Set<string>) {
  return ids.size ? Prisma.sql`AND NOT (p."id" = ANY(${[...ids]}))` : Prisma.empty;
}

function toView(row: BoardRow): BoardRowView {
  const info = platformInfo(row.platform);
  return {
    id: row.productId,
    href: row.href,
    title: row.title,
    boardTitle: row.boardTitle,
    shortTitle: boardTitle(row.title, 16),
    platformNumber: row.platformNumber ?? 0,
    platformLabel: row.platformBoardLabel,
    platformKey: info.key,
    platformName: info.short,
    platformShort: row.platformShortLabel,
    price: boardPrice(row.price, STORE_POLICY.currency),
    amount: row.price,
    remark: remarkText(row.remark.kind, row.remark.percent),
    remarkLabel: remarkLabel(row.remark.kind, row.remark.percent),
  };
}

function faceLabel(value: number | null, currency: string | null): string | null {
  if (value == null || !currency) return null;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 }).format(value);
}

function homeTimetable(table: Timetable, limit: number): Timetable {
  const best = new Map<string, TimetableRow>();
  const score = (r: TimetableRow) => Object.keys(r.cells).length * 10 - Math.max(0, REGION_RANK.indexOf(r.region));
  for (const row of table.rows) {
    const id = row.service.toLowerCase();
    const prev = best.get(id);
    if (!prev || score(row) > score(prev)) best.set(id, row);
  }
  const picked = [...best.values()].sort((a, b) => orderIndex(PLATFORM_ORDER, a.platform) - orderIndex(PLATFORM_ORDER, b.platform) || Object.keys(b.cells).length - Object.keys(a.cells).length || a.service.localeCompare(b.service, "en-GB")).slice(0, limit);
  const uses = new Map<string, number>();
  for (const r of picked) for (const k of Object.keys(r.cells)) uses.set(k, (uses.get(k) ?? 0) + 1);
  const columns = table.columns.filter((c) => (uses.get(c.key) ?? 0) >= 2);
  const keep = new Set(columns.map((c) => c.key));
  const rows = picked.map((r) => ({ ...r, cells: Object.fromEntries(Object.entries(r.cells).filter(([k]) => keep.has(k))) })).filter((r) => Object.keys(r.cells).length > 0);
  return { columns, rows };
}

function bestGiftCards(groups: GiftCardGroup[], topUps: Map<string, number>): HomeGiftCard[] {
  const byPlatform = new Map<string, GiftCardGroup>();
  for (const g of groups) {
    const prev = byPlatform.get(g.platform);
    const better = !prev || g.products.length > prev.products.length || (g.products.length === prev.products.length && g.region === "global" && prev.region !== "global");
    if (better) byPlatform.set(g.platform, g);
  }
  return [...byPlatform.values()]
    .filter((g) => g.platform !== "other")
    .sort((a, b) => orderIndex(PLATFORM_ORDER, a.platform) - orderIndex(PLATFORM_ORDER, b.platform))
    .slice(0, MERCH.giftCardPlatforms)
    .map((g) => ({
      key: g.key,
      platform: g.platform,
      region: g.region,
      title: g.title,
      topUps: topUps.get(g.platform) ?? 0,
      values: g.products.map((p) => ({ id: p.id, slug: p.slug, value: p.value, currency: p.currency, label: faceLabel(p.value, p.currency), price: p.price })),
    }));
}

async function newArrivals(claimed: Set<string>): Promise<{ ids: string[]; total: number }> {
  const [rows, total] = await Promise.all([
    prisma.$queryRaw<{ id: string }[]>`
      SELECT x."id" FROM (
        SELECT DISTINCT ON (lower(k."title")) p."id", k."releaseDate" AS rd, k."boardRank" AS br
        FROM "Product" p JOIN "KeyItem" k ON k."productId" = p."id"
        WHERE ${LIVE} AND k."productType" = 'game' AND ${HAS_COVER} AND k."releaseDate" > now() - make_interval(days => ${MERCH.releaseWindowDays}) ${notClaimed(claimed)}
        ORDER BY lower(k."title"), k."boardRank" ASC NULLS LAST, p."id"
      ) x ORDER BY date_trunc('week', x.rd) DESC, x.br ASC NULLS LAST, x."id" LIMIT ${MERCH.lineItems}`,
    prisma.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM "Product" p JOIN "KeyItem" k ON k."productId" = p."id"
      WHERE ${LIVE} AND k."productType" = 'game' AND k."releaseDate" > now() - make_interval(days => ${MERCH.releaseWindowDays})`,
  ]);
  return { ids: rows.map((r) => r.id), total: total[0]?.n ?? 0 };
}

async function coopLine(claimed: Set<string>): Promise<{ ids: string[]; total: number }> {
  const [rows, total] = await Promise.all([
    prisma.$queryRaw<{ id: string; platform: string }[]>`
      SELECT x."id", x."platform" FROM (
        SELECT DISTINCT ON (lower(k."title")) p."id", k."platform", k."boardRank" AS br
        FROM "Product" p JOIN "KeyItem" k ON k."productId" = p."id"
        WHERE ${LIVE} AND k."productType" = 'game' AND 'co-op' = ANY(k."genres") AND ${HAS_COVER} ${notClaimed(claimed)}
        ORDER BY lower(k."title"), k."boardRank" ASC NULLS LAST, p."id"
      ) x ORDER BY x.br ASC NULLS LAST, x."id" LIMIT 240`,
    prisma.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM "Product" p JOIN "KeyItem" k ON k."productId" = p."id" WHERE ${LIVE} AND 'co-op' = ANY(k."genres")`,
  ]);
  const per = new Map<string, number>();
  const ids: string[] = [];
  for (const r of rows) {
    if (ids.length >= MERCH.lineItems) break;
    const n = per.get(r.platform) ?? 0;
    if (n >= MERCH.linePerPlatform) continue;
    per.set(r.platform, n + 1);
    ids.push(r.id);
  }
  return { ids, total: total[0]?.n ?? 0 };
}

async function consoleLine(claimed: Set<string>): Promise<{ ids: string[]; total: number }> {
  const [rows, total] = await Promise.all([
    prisma.$queryRaw<{ id: string; platform: string; rn: number }[]>`
      SELECT y."id", y."platform", y.rn FROM (
        SELECT x.*, ROW_NUMBER() OVER (PARTITION BY x."platform" ORDER BY x.br ASC NULLS LAST, x."id") AS rn FROM (
          SELECT DISTINCT ON (k."platform", lower(k."title")) p."id", k."platform", k."boardRank" AS br
          FROM "Product" p JOIN "KeyItem" k ON k."productId" = p."id"
          WHERE ${LIVE} AND k."productType" = 'game' AND k."platform" = ANY(${CONSOLES}) AND ${HAS_COVER} ${notClaimed(claimed)}
          ORDER BY k."platform", lower(k."title"), k."boardRank" ASC NULLS LAST, p."id"
        ) x
      ) y WHERE y.rn <= ${MERCH.lineItems} ORDER BY y.rn, y."platform"`,
    prisma.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM "Product" p JOIN "KeyItem" k ON k."productId" = p."id" WHERE ${LIVE} AND k."productType" = 'game' AND k."platform" = ANY(${CONSOLES})`,
  ]);
  const order = (p: string) => orderIndex(PLATFORM_ORDER, p);
  const sorted = [...rows].sort((a, b) => Number(a.rn) - Number(b.rn) || order(a.platform) - order(b.platform));
  return { ids: sorted.slice(0, MERCH.lineItems).map((r) => r.id), total: total[0]?.n ?? 0 };
}

async function priceCuts(claimed: Set<string>): Promise<FareRow[]> {
  const rows = await prisma.$queryRaw<{ id: string; slug: string; title: string; platform: string; price: number; compare: number; score: number; cover: string | null }[]>`
    SELECT p."id", p."slug", k."title", k."platform", p."price"::float AS price, p."comparePrice"::float AS compare, COALESCE(k."boardScore", 0) AS score,
      (SELECT c."url" FROM "ProductImage" c WHERE c."productId" = p."id" AND c."sortOrder" = 0 LIMIT 1) AS cover
    FROM "Product" p JOIN "KeyItem" k ON k."productId" = p."id"
    WHERE ${LIVE} AND p."comparePrice" IS NOT NULL AND p."comparePrice" > p."price" ${notClaimed(claimed)}
    ORDER BY (p."comparePrice" - p."price") / p."comparePrice" DESC LIMIT 400`;
  const titles = new Set<string>();
  return rows
    .map((r) => ({ r, percent: dealPercent(r.price, r.compare) }))
    .filter((x): x is { r: (typeof rows)[number]; percent: number } => x.percent !== null)
    .sort((a, b) => b.r.score * b.percent - a.r.score * a.percent || a.r.id.localeCompare(b.r.id))
    .filter(({ r }) => {
      const t = r.title.toLowerCase();
      if (titles.has(t)) return false;
      titles.add(t);
      return true;
    })
    .slice(0, MERCH.fares)
    .map(({ r, percent }) => ({ id: r.id, href: `/product/${r.slug}`, title: r.title, boardTitle: boardTitle(r.title, 22), platform: r.platform, amount: r.price, was: r.compare, percent, cover: r.cover }));
}

async function computeHomeData(): Promise<HomeData> {
  const [board, pool, platformRows, totals, syncRows, groups, timetable, genreRows, dealCount, topUpRows] = await Promise.all([
    getBoardPages(),
    homeBoardPool(),
    prisma.$queryRaw<{ platform: string; count: number; min: number }[]>`
      SELECT k."platform", COUNT(*)::int AS count, MIN(p."price")::float AS min FROM "KeyItem" k JOIN "Product" p ON p."id" = k."productId"
      WHERE p."status" = 'ACTIVE'::"ProductStatus" AND p."quantity" > 0 GROUP BY k."platform"`,
    prisma.$queryRaw<{ live: number }[]>`SELECT COUNT(*)::int AS live FROM "Product" p WHERE p."status" = 'ACTIVE'::"ProductStatus" AND p."quantity" > 0`,
    prisma.$queryRaw<{ finishedAt: Date }[]>`SELECT "finishedAt" FROM "CatalogSyncRun" WHERE "status" = 'ok' AND "finishedAt" IS NOT NULL ORDER BY "finishedAt" DESC LIMIT 1`,
    giftCardGroups(),
    subscriptionTimetable(500),
    prisma.$queryRaw<{ genre: string; count: number }[]>`
      SELECT g AS genre, COUNT(*)::int AS count FROM "KeyItem" k JOIN "Product" p ON p."id" = k."productId", unnest(k."genres") g
      WHERE p."status" = 'ACTIVE'::"ProductStatus" AND p."quantity" > 0 GROUP BY g`,
    prisma.$queryRaw<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM "Product" p WHERE p."status" = 'ACTIVE'::"ProductStatus" AND p."quantity" > 0 AND p."comparePrice" IS NOT NULL AND p."comparePrice" > p."price"`,
    prisma.$queryRaw<{ platform: string; n: number }[]>`
      SELECT k."platform", COUNT(*)::int AS n FROM "KeyItem" k JOIN "Product" p ON p."id" = k."productId"
      WHERE p."status" = 'ACTIVE'::"ProductStatus" AND p."quantity" > 0 AND k."productType" = 'top-up' GROUP BY k."platform"`,
  ]);

  const claimed = new Set(board.claimed);
  const stats = new Map(platformRows.map((r) => [r.platform, r]));
  const stocked = PLATFORMS.filter((p) => p.key !== "other" && (stats.get(p.key)?.count ?? 0) > 0).sort((a, b) => orderIndex(PLATFORM_ORDER, a.key) - orderIndex(PLATFORM_ORDER, b.key));
  const now = Date.now();

  const platforms: HomePlatform[] = stocked.map((p) => {
    const info = platformInfo(p.key);
    const titles = new Set<string>();
    const peek = pool
      .filter((c) => c.platform === p.key && (c.productType === "game" || c.productType === "dlc") && !claimed.has(c.productId))
      .filter((c) => {
        const t = c.title.toLowerCase();
        if (titles.has(t)) return false;
        titles.add(t);
        return true;
      })
      .slice(0, MERCH.peek)
      .map((c) => {
        claimed.add(c.productId);
        const fresh = c.releaseDate ? new Date(c.releaseDate).getTime() >= now - MERCH.releaseWindowDays * 86_400_000 : false;
        return { id: c.productId, href: `/product/${c.slug}`, title: c.title, boardTitle: boardTitle(c.title, 18), amount: c.price, remark: remarkFor({ price: c.price, comparePrice: c.comparePrice, isNew: fresh }), cover: c.coverUrl };
      });
    return { key: p.key, slug: p.slug, name: info.short, number: info.number, href: `/platform/${p.slug}`, count: stats.get(p.key)?.count ?? 0, minPrice: stats.get(p.key)?.min ?? null, peek };
  });

  const lineDefs: { key: HomeLine["key"]; letter: string; title: string; rule: string; href: string; load: (c: Set<string>) => Promise<{ ids: string[]; total: number }> }[] = [
    { key: "new", letter: "A", title: "New arrivals", rule: "Games released in the last eight weeks, newest first.", href: "/new-releases", load: newArrivals },
    { key: "coop", letter: "B", title: "Co-op", rule: "Tagged co-op by the publisher, mixed across platforms.", href: "/genre/co-op", load: coopLine },
    { key: "console", letter: "C", title: "Console departures", rule: "Xbox, PlayStation and Nintendo games, taking turns.", href: "/catalog/games?platform=nintendo,playstation,xbox", load: consoleLine },
  ];
  const lines: HomeLine[] = [];
  for (const def of lineDefs) {
    const { ids, total } = await def.load(claimed);
    if (ids.length < MERCH.lineMinimum) continue;
    ids.forEach((id) => claimed.add(id));
    const products = await loadKeyProducts(ids);
    const byId = new Map(products.map((p) => [p.id, p]));
    lines.push({ key: def.key, letter: def.letter, title: def.title, rule: def.rule, href: def.href, total, products: ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])) });
  }

  const genreCount = new Map(genreRows.map((r) => [r.genre, r.count]));
  const routeKeys = ROUTE_ORDER.filter((g) => genreDef(g) && (genreCount.get(g) ?? 0) >= MERCH.routeMinimum).slice(0, MERCH.routes);
  const routes: HomeRoute[] = await Promise.all(
    routeKeys.map(async (g) => {
      const stops = (await genrePlatformCounts(g)).filter((s) => s.platform !== "other" && PLATFORMS.some((p) => p.key === s.platform)).slice(0, MERCH.routeStops);
      return {
        key: g,
        label: genreDef(g)?.label ?? g,
        href: `/genre/${g}`,
        count: genreCount.get(g) ?? 0,
        stops: stops.map((s) => ({ platform: s.platform, count: s.count, href: `/genre/${g}?platform=${s.platform}` })),
      };
    }),
  );

  const cuts = await priceCuts(claimed);
  const showFares = cuts.length >= MERCH.dealMinimum;
  const feature = showFares ? (cuts.find((c) => c.cover) ?? null) : null;
  if (showFares) cuts.forEach((c) => claimed.add(c.id));

  const topUps = new Map(topUpRows.map((r) => [r.platform, r.n]));
  const activation = ["steam", "xbox", "playstation", "nintendo", "epic", "gog", "battle-net"].filter((k) => k in ACTIVATION && (stats.get(k)?.count ?? 0) > 0);

  return {
    live: totals[0]?.live ?? 0,
    platformCount: stocked.length,
    syncedAt: syncRows[0]?.finishedAt ? syncRows[0].finishedAt.toISOString() : null,
    board: board.pages.map((page) => page.map(toView)),
    platforms,
    lines,
    routes: routes.filter((r) => r.stops.length > 0),
    fares: { total: dealCount[0]?.n ?? 0, feature, rows: showFares ? cuts.filter((c) => c !== feature) : [] },
    giftCards: bestGiftCards(groups, topUps),
    timetable: homeTimetable(timetable, MERCH.timetableRows),
    activationPlatforms: activation,
  };
}

const homeData = memoize(5 * 60_000, computeHomeData, { staleMs: 60 * 60_000 });

export const getHomeData = cache((): Promise<HomeData> => homeData());
