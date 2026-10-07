import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pageMetadata, pagedDescription } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { CategoryOpener } from "@/components/catalog/CategoryOpener";
import { queryCatalog } from "@/components/catalog/catalog-query";
import { hasActiveFilters, parseCatalogParams, type RawSearchParams } from "@/components/catalog/catalog-url";

interface ReleasesPageProps {
  searchParams: Promise<RawSearchParams>;
}

const WEEKS = 8;
const DAY = 86_400_000;

interface ReleaseWeek {
  start: string;
  count: number;
}

function weekLabel(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(iso));
}

async function releaseWeeks(): Promise<ReleaseWeek[]> {
  const now = Date.now();
  const start = now - WEEKS * 7 * DAY;
  const rows = await prisma.keyItem.findMany({
    where: { releaseDate: { gte: new Date(start), lte: new Date(now) }, product: { status: "ACTIVE", quantity: { gt: 0 } } },
    select: { releaseDate: true },
  });
  const weeks = Array.from({ length: WEEKS }, (_, i) => ({ start: new Date(start + i * 7 * DAY).toISOString(), count: 0 }));
  for (const r of rows) {
    if (!r.releaseDate) continue;
    const i = Math.min(WEEKS - 1, Math.floor((r.releaseDate.getTime() - start) / (7 * DAY)));
    if (i >= 0) weeks[i].count += 1;
  }
  return weeks;
}

export async function generateMetadata({ searchParams }: ReleasesPageProps): Promise<Metadata> {
  const t = await getTranslations("catalog");
  const query = parseCatalogParams(await searchParams, "release-desc");
  const title = query.page > 1 ? t("titleWithPage", { title: "New arrivals", page: query.page }) : "New arrivals";
  const description = pagedDescription("Recently released games and DLC in stock now, newest first, with platform, region and languages on every key.", query.page, (text, page) => t("descriptionWithPage", { description: text, page }));
  const filtered = hasActiveFilters(query);
  return pageMetadata({ title, description, path: query.page > 1 ? `/new-releases?page=${query.page}` : "/new-releases", canonical: !filtered, index: !filtered });
}

export default async function NewReleasesPage({ searchParams }: ReleasesPageProps) {
  const t = await getTranslations("catalog");
  const query = parseCatalogParams(await searchParams, "release-desc");
  const [weeks, result] = await Promise.all([releaseWeeks(), queryCatalog({ kind: "released" }, { ...query, category: null }, { basePath: "/new-releases", defaultSort: "release-desc" })]);
  const recent = weeks.reduce((a, w) => a + w.count, 0);
  return (
    <div className="mx-auto max-w-container px-gutter pb-24">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: "Catalogue", href: "/catalog" }, { label: "New arrivals" }]} />
      <CategoryOpener name="New arrivals" count={recent} lead="Games and DLC released in the last eight weeks and in stock now. Titles that aren’t out yet are not listed." />
      {recent > 0 ? (
        <table className="mb-12 w-full max-w-[560px] border-collapse text-left">
          <caption className="sr-only">Releases per week, last eight weeks</caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="label-caps py-2.5 pr-4 text-ink-muted">
                Week of
              </th>
              <th scope="col" className="label-caps py-2.5 text-right text-ink-muted">
                Releases
              </th>
            </tr>
          </thead>
          <tbody>
            {[...weeks].reverse().map((w) => (
              <tr key={w.start} className="border-b border-line">
                <th scope="row" className="py-2 pr-4 text-left text-ui-md font-semibold text-ink">
                  {weekLabel(w.start)}
                </th>
                <td className="py-2 text-right font-mono text-data text-ink">{w.count.toLocaleString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <CatalogBrowser
        basePath="/new-releases"
        params={{ ...query, category: null, page: result.page }}
        products={result.products}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        facets={result.facets}
        defaultSort="release-desc"
        related={[{ name: "All keys", href: "/catalog" }]}
        headingId="releases-results"
        heading="New arrivals"
      />
    </div>
  );
}
