import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MERCH, PLATFORM_BOARD, platformBoard } from "@/config/merchandising";
import { catalogConfig } from "@/config/catalog";
import { dealPercent, remarkFor } from "@/lib/catalog/remarks";
import { boardTitle } from "@/lib/catalog/board-text";

export { boardTitle };
import type { RemarkKind } from "@/components/ui/Remark";

export interface BoardCandidate {
  productId: string;
  slug: string;
  title: string;
  platform: string;
  productType: string;
  region: string;
  price: number;
  comparePrice: number | null;
  releaseDate: Date | null;
  boardScore: number;
  coverUrl: string;
}

export interface BoardRow {
  productId: string;
  href: string;
  title: string;
  boardTitle: string;
  price: number;
  comparePrice: number | null;
  platform: string;
  platformNumber: number | null;
  platformBoardLabel: string;
  platformShortLabel: string;
  productType: string;
  region: string;
  coverUrl: string;
  remark: { kind: RemarkKind; percent: number | null };
}

export interface BoardPagesOptions {
  rows?: number;
  perPage?: number;
  perPlatform?: number;
  excludeTopOrdered?: number;
  deals?: number;
  fresh?: number;
  titleCells?: number;
  claimed?: Set<string>;
}

const LIVE = Prisma.sql`p."status" = 'ACTIVE'::"ProductStatus" AND p."quantity" > 0 AND (k."releaseDate" IS NULL OR k."releaseDate" <= now())`;

function editionWeightSql(): Prisma.Sql {
  const w = catalogConfig.selection.weights;
  const cases = w.edition.map((e) => Prisma.sql`WHEN lower(k."edition") ~ ${e.match.source} THEN ${e.weight}::float`);
  return Prisma.sql`(CASE WHEN k."edition" IS NULL OR k."edition" = '' THEN ${w.plainEdition}::float ${Prisma.join(cases, " ")} ELSE 1 END)`;
}

export const topOrderedProductIds = cache(async (limit: number = MERCH.boardExcludeTopOrdered): Promise<Set<string>> => {
  if (limit <= 0) return new Set();
  const rows = await prisma.$queryRaw<{ productId: string }[]>`
    SELECT "productId" FROM "OrderItem" WHERE "productId" IS NOT NULL GROUP BY "productId" ORDER BY SUM("quantity") DESC, "productId" LIMIT ${limit}`;
  return new Set(rows.map((r) => r.productId));
});

export const homeBoardPool = cache(async (perPlatform: number = MERCH.homePoolPerPlatform): Promise<BoardCandidate[]> => {
  const rows = await prisma.$queryRaw<(Omit<BoardCandidate, "price" | "comparePrice" | "boardScore"> & { price: number; comparePrice: number | null; boardScore: number | null })[]>`
    WITH editions AS (
      SELECT DISTINCT ON (k."platform", k."productType", split_part(k."dedupeKey", '|', 2))
        p."id" AS "productId", p."slug", k."title", k."platform", k."productType", k."region", p."price"::float AS "price", p."comparePrice"::float AS "comparePrice", k."releaseDate", COALESCE(k."boardScore", 0) AS "boardScore", c."url" AS "coverUrl"
      FROM "Product" p
      JOIN "KeyItem" k ON k."productId" = p."id"
      JOIN "ProductImage" c ON c."productId" = p."id" AND c."sortOrder" = 0
      WHERE ${LIVE}
      ORDER BY k."platform", k."productType", split_part(k."dedupeKey", '|', 2), ${editionWeightSql()} DESC, (k."region" = 'global') DESC, k."boardScore" DESC NULLS LAST, p."id"
    ),
    ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY "platform" ORDER BY "boardScore" DESC, "productId") AS "rn" FROM editions
    )
    SELECT "productId", "slug", "title", "platform", "productType", "region", "price", "comparePrice", "releaseDate", "boardScore", "coverUrl"
    FROM ranked WHERE "rn" <= ${perPlatform}
    ORDER BY "boardScore" DESC, "productId"`;
  return rows.map((r) => ({ ...r, boardScore: Number(r.boardScore ?? 0), price: Number(r.price), comparePrice: r.comparePrice == null ? null : Number(r.comparePrice) }));
});

function isFresh(c: BoardCandidate, now: number): boolean {
  if (!c.releaseDate) return false;
  const t = new Date(c.releaseDate).getTime();
  return t <= now && t >= now - MERCH.releaseWindowDays * 86_400_000;
}

function toRow(c: BoardCandidate, cells: number, now: number): BoardRow {
  const board = platformBoard(c.platform);
  return {
    productId: c.productId,
    href: `/product/${c.slug}`,
    title: c.title,
    boardTitle: boardTitle(c.title, cells),
    price: c.price,
    comparePrice: c.comparePrice,
    platform: c.platform,
    platformNumber: board.number,
    platformBoardLabel: board.boardLabel,
    platformShortLabel: board.shortLabel,
    productType: c.productType,
    region: c.region,
    coverUrl: c.coverUrl,
    remark: remarkFor({ price: c.price, comparePrice: c.comparePrice, isNew: isFresh(c, now) }),
  };
}

export async function getBoardPages(options: BoardPagesOptions = {}): Promise<{ pages: BoardRow[][]; rows: BoardRow[]; claimed: Set<string> }> {
  const total = options.rows ?? MERCH.boardRows;
  const perPage = options.perPage ?? 6;
  const perPlatform = options.perPlatform ?? MERCH.boardPerPlatform;
  const dealCap = options.deals ?? MERCH.boardDeals;
  const freshCap = options.fresh ?? MERCH.boardNew;
  const cells = options.titleCells ?? 22;
  const claimed = options.claimed ?? new Set<string>();
  const now = Date.now();
  const [pool, excluded] = await Promise.all([homeBoardPool(), topOrderedProductIds(options.excludeTopOrdered ?? MERCH.boardExcludeTopOrdered)]);
  const eligible = pool.filter((c) => !excluded.has(c.productId) && !claimed.has(c.productId) && (c.productType === "game" || c.productType === "dlc" || c.productType === "gift-card"));

  const picked: BoardCandidate[] = [];
  const titles = new Set<string>();
  const perPlat = new Map<string, number>();
  let giftCards = 0;
  const key = (c: BoardCandidate) => c.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const take = (c: BoardCandidate) => {
    if (picked.length >= total || picked.includes(c) || titles.has(key(c))) return false;
    if ((perPlat.get(c.platform) ?? 0) >= perPlatform) return false;
    if (c.productType === "gift-card" && giftCards >= 1) return false;
    picked.push(c);
    titles.add(key(c));
    perPlat.set(c.platform, (perPlat.get(c.platform) ?? 0) + 1);
    if (c.productType === "gift-card") giftCards++;
    return true;
  };

  let deals = 0;
  for (const c of eligible) {
    if (deals >= dealCap) break;
    if (dealPercent(c.price, c.comparePrice) && take(c)) deals++;
  }
  let fresh = 0;
  for (const c of eligible) {
    if (fresh >= freshCap) break;
    if (isFresh(c, now) && !dealPercent(c.price, c.comparePrice) && take(c)) fresh++;
  }
  for (const entry of PLATFORM_BOARD.filter((p) => p.number !== null && p.number <= 4)) {
    if (picked.some((c) => c.platform === entry.key)) continue;
    const first = eligible.find((c) => c.platform === entry.key && c.productType !== "gift-card");
    if (first) take(first);
  }
  for (const c of eligible) {
    if (picked.length >= total) break;
    take(c);
  }

  const order = new Map(eligible.map((c, i) => [c.productId, i]));
  const lane = new Map<string, number>();
  const slot = new Map<string, number>();
  for (const c of [...picked].sort((a, b) => (order.get(a.productId) ?? 0) - (order.get(b.productId) ?? 0))) {
    const rn = (lane.get(c.platform) ?? 0) + 1;
    lane.set(c.platform, rn);
    slot.set(c.productId, rn / platformBoard(c.platform).share);
  }
  const rows = picked.sort((a, b) => (slot.get(a.productId) ?? 0) - (slot.get(b.productId) ?? 0) || (order.get(a.productId) ?? 0) - (order.get(b.productId) ?? 0)).map((c) => toRow(c, cells, now));
  const pages: BoardRow[][] = [];
  for (let i = 0; i < rows.length; i += perPage) pages.push(rows.slice(i, i + perPage));
  const nextClaimed = new Set(claimed);
  for (const r of rows) nextClaimed.add(r.productId);
  return { pages, rows, claimed: nextClaimed };
}
