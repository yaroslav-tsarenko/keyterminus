import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { genrePlatformCounts } from "@/lib/catalog/live-stock";
import { pageMetadata, pagedDescription } from "@/lib/seo/metadata";
import { GENRES, genreDef } from "@/lib/keys/taxonomy";
import { PLATFORM_ORDER, ROUTE_ORDER, orderIndex } from "@/config/merchandising";
import { RouteLine } from "@/components/ui/RouteLine";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { FlapCounter } from "@/components/ui/Flap";
import { platformInfo } from "@/lib/catalog/platforms";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { queryCatalog } from "@/components/catalog/catalog-query";
import { buildCatalogHref, hasActiveFilters, parseCatalogParams, type RawSearchParams } from "@/components/catalog/catalog-url";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ params, searchParams }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const genre = genreDef(slug);
  if (!genre) return { title: "Genre not found", robots: { index: false, follow: true } };
  const t = await getTranslations("catalog");
  const query = parseCatalogParams(await searchParams, "board");
  const counts = await genrePlatformCounts(genre.key);
  const total = counts.reduce((a, b) => a + b.count, 0);
  const title = query.page > 1 ? t("titleWithPage", { title: `${genre.label} game keys`, page: query.page }) : `${genre.label} game keys`;
  const description = pagedDescription(`${genre.label} games and DLC for Steam, Xbox, PlayStation and more: ${total} keys in stock, each with its platform, region and languages listed.`, query.page, (text, page) => t("descriptionWithPage", { description: text, page }));
  const filtered = hasActiveFilters(query);
  return pageMetadata({ title, description, path: query.page > 1 ? `/genre/${genre.key}?page=${query.page}` : `/genre/${genre.key}`, canonical: !filtered, index: !filtered && total > 0 });
}

export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.key }));
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { slug } = await params;
  const genre = genreDef(slug);
  if (!genre) notFound();
  const t = await getTranslations("catalog");
  const query = parseCatalogParams(await searchParams, "board");
  const basePath = `/genre/${genre.key}`;
  const [counts, result] = await Promise.all([genrePlatformCounts(genre.key), queryCatalog({ kind: "genre", genre }, { ...query, category: null, genres: [] }, { basePath, defaultSort: "board" })]);
  const total = counts.reduce((a, b) => a + b.count, 0);
  const stops = counts
    .filter((c) => c.platform !== "other" && c.count > 0)
    .sort((a, b) => orderIndex(PLATFORM_ORDER, a.platform) - orderIndex(PLATFORM_ORDER, b.platform))
    .slice(0, 6)
    .map((c) => {
      const info = platformInfo(c.platform);
      const current = query.platforms.length === 1 && query.platforms[0] === c.platform;
      return {
        key: c.platform,
        label: info.short,
        meta: c.count.toLocaleString("en-GB"),
        href: buildCatalogHref(basePath, { ...query, genres: [] }, { platforms: [c.platform] }, { defaultSort: "board" }),
        leading: <PlatformTile number={info.number} size="sm" />,
        state: current ? ("current" as const) : ("station" as const),
        srLabel: `${c.count} keys`,
      };
    });
  const others = [...GENRES]
    .filter((g) => g.key !== genre.key)
    .sort((a, b) => orderIndex(ROUTE_ORDER, a.key) - orderIndex(ROUTE_ORDER, b.key))
    .slice(0, 4)
    .map((g) => ({ name: g.label, href: `/genre/${g.key}` }));

  return (
    <div className="mx-auto max-w-container px-gutter pb-24">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: "Catalogue", href: "/catalog" }, { label: genre.label }]} />
      <header data-genre-opener="" className="pb-10 pt-2">
        <p className="eyebrow m-0 mb-3">Genre</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="m-0 pt-1 text-step-4 leading-[1.04] text-ink">{genre.label} games</h1>
          <FlapCounter value={total} label={`${total.toLocaleString("en-GB")} keys`} size="sm" />
        </div>
        <p className="measure m-0 mt-3 text-step-1 leading-[1.5] text-ink-muted">{genre.label} games and DLC in stock, by the platform they activate on.</p>
        {stops.length ? (
          <nav aria-label={`${genre.label} by platform`} className="mt-8 border-t border-line pt-6">
            <RouteLine stops={stops} orientation="responsive" label={`${genre.label} by platform`} terminus={{ label: `All ${total.toLocaleString("en-GB")}`, href: basePath, tone: "ink" }} />
          </nav>
        ) : null}
      </header>
      <CatalogBrowser
        basePath={basePath}
        params={{ ...query, category: null, genres: [], page: result.page }}
        products={result.products}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        facets={result.facets}
        defaultSort="board"
        related={others}
        headingId="genre-results"
        heading={t("resultsIn", { name: genre.label })}
        hide={["genres"]}
      />
    </div>
  );
}
