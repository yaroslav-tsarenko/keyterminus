import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLATFORM_BOARD, ROUTE_WEIGHT, UNTAGGED_ROUTE_WEIGHT } from "@/config/merchandising";
import { CONSOLE_FACTOR, CROSS_PLATFORM_COPY_PENALTY, MULTI_PLATFORM_FACTOR, RECENCY_BOOST, RECENCY_HALF_LIFE_YEARS, REGIONAL_COPY_PENALTY } from "./board-weights";

export * from "./board-weights";

const DEFAULT_SHARE = 0.02;

function genreWeightSql(): Prisma.Sql {
  const cases = Object.entries(ROUTE_WEIGHT).map(([genre, weight]) => Prisma.sql`WHEN ${genre} THEN ${weight}::float`);
  return Prisma.sql`COALESCE((SELECT MAX(CASE g ${Prisma.join(cases, " ")} END) FROM unnest(k."genres") g), ${UNTAGGED_ROUTE_WEIGHT}::float)`;
}

function shareSql(column: Prisma.Sql): Prisma.Sql {
  const cases = PLATFORM_BOARD.map((p) => Prisma.sql`WHEN ${p.key} THEN ${p.share}::float`);
  return Prisma.sql`(CASE ${column} ${Prisma.join(cases, " ")} ELSE ${DEFAULT_SHARE}::float END)`;
}

export function boardScoreExpression(): Prisma.Sql {
  const ageYears = Prisma.sql`GREATEST(0, EXTRACT(EPOCH FROM (now() - COALESCE(k."releaseDate", make_date(k."releaseYear", 7, 1)::timestamp))) / 31557600.0)`;
  return Prisma.sql`(
    ${genreWeightSql()}
    * (CASE WHEN k."releaseDate" IS NULL AND k."releaseYear" IS NULL THEN 1 ELSE 1 + ${RECENCY_BOOST}::float * power(0.5, ${ageYears} / ${RECENCY_HALF_LIFE_YEARS}::float) END)
    * (CASE WHEN k."platform" IN ('xbox', 'playstation', 'nintendo') THEN ${CONSOLE_FACTOR}::float ELSE 1 END)
  )`;
}

export async function refreshBoardScores(): Promise<{ scored: number; ranked: number }> {
  const scored = await prisma.$executeRaw`
    WITH base AS (
      SELECT k."id", k."platform", k."productType", split_part(k."dedupeKey", '|', 2) AS "base", ${boardScoreExpression()} AS "score"
      FROM "KeyItem" k JOIN "Product" p ON p."id" = k."productId"
      WHERE p."status" = 'ACTIVE'::"ProductStatus"
    ),
    multi AS (
      SELECT "productType", "base" FROM base GROUP BY "productType", "base" HAVING COUNT(DISTINCT "platform") >= 2
    )
    UPDATE "KeyItem" k
    SET "boardScore" = round((b."score" * (CASE WHEN m."base" IS NOT NULL THEN ${MULTI_PLATFORM_FACTOR}::float ELSE 1 END))::numeric, 5)::float
    FROM base b LEFT JOIN multi m ON m."productType" = b."productType" AND m."base" = b."base"
    WHERE k."id" = b."id" AND k."boardScore" IS DISTINCT FROM round((b."score" * (CASE WHEN m."base" IS NOT NULL THEN ${MULTI_PLATFORM_FACTOR}::float ELSE 1 END))::numeric, 5)::float`;
  const ranked = await prisma.$executeRaw`
    WITH live AS (
      SELECT k."id", k."platform", COALESCE(k."boardScore", 0) AS "score", split_part(k."dedupeKey", '|', 2) AS "base"
      FROM "KeyItem" k JOIN "Product" p ON p."id" = k."productId"
      WHERE p."status" = 'ACTIVE'::"ProductStatus"
    ),
    copies AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY "platform", "base" ORDER BY "score" DESC, "id") AS "copy",
        ROW_NUMBER() OVER (PARTITION BY "base" ORDER BY "score" DESC, "id") AS "anyCopy"
      FROM live
    ),
    lanes AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY "platform" ORDER BY "score" DESC, "id") AS "rn" FROM copies
    ),
    ordered AS (
      SELECT "id", ROW_NUMBER() OVER (ORDER BY ("rn" * (CASE WHEN "copy" > 1 THEN ${REGIONAL_COPY_PENALTY} WHEN "anyCopy" > 1 THEN ${CROSS_PLATFORM_COPY_PENALTY} ELSE 1 END)) / ${shareSql(Prisma.sql`"platform"`)} ASC, "score" DESC, "id")::int AS "rank" FROM lanes
    )
    UPDATE "KeyItem" k SET "boardRank" = o."rank" FROM ordered o WHERE k."id" = o."id" AND k."boardRank" IS DISTINCT FROM o."rank"`;
  await prisma.$executeRaw`UPDATE "KeyItem" k SET "boardRank" = NULL FROM "Product" p WHERE p."id" = k."productId" AND p."status" <> 'ACTIVE'::"ProductStatus" AND k."boardRank" IS NOT NULL`;
  await prisma.$executeRaw`UPDATE "Product" p SET "boardRank" = k."boardRank" FROM "KeyItem" k WHERE k."productId" = p."id" AND p."boardRank" IS DISTINCT FROM k."boardRank"`;
  return { scored: Number(scored), ranked: Number(ranked) };
}
