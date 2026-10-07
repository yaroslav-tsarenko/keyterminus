import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { pageMetadata, pagedDescription } from "@/lib/seo/metadata";
import { platformMinPrice, platformTypeCounts, stockedPlatformCounts } from "@/lib/catalog/live-stock";
import { platformBySlug, PRODUCT_TYPES, categorySlugFor } from "@/lib/keys/taxonomy";
import { PLATFORM_BOARD, TYPE_ORDER, orderIndex } from "@/config/merchandising";
import { PlatformSign } from "@/components/ui/PlatformTile";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { PlatformOpener } from "@/components/catalog/CategoryOpener";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { platformInfo } from "@/lib/catalog/platforms";
import { activationFor } from "@/config/activation";
import { queryCatalog } from "@/components/catalog/catalog-query";
import { hasActiveFilters, parseCatalogParams, type RawSearchParams } from "@/components/catalog/catalog-url";

interface PlatformPageProps {
  params: Promise<{ platform: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ params, searchParams }: PlatformPageProps): Promise<Metadata> {
  const { platform: slug } = await params;
  const platform = platformBySlug(slug);
  if (!platform) return { title: "Platform not found", robots: { index: false, follow: true } };
  const t = await getTranslations("catalog");
  const query = parseCatalogParams(await searchParams, "board");
  const counts = await platformTypeCounts(platform.key);
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const title = query.page > 1 ? t("titleWithPage", { title: `${platform.label} keys`, page: query.page }) : `${platform.label} keys`;
  const description = pagedDescription(`Games, DLC and other products that activate on ${platform.label}: ${total} products, each with its activation region and languages listed.`, query.page, (text, page) => t("descriptionWithPage", { description: text, page }));
  const filtered = hasActiveFilters(query);
  return pageMetadata({ title, description, path: query.page > 1 ? `/platform/${platform.slug}?page=${query.page}` : `/platform/${platform.slug}`, canonical: !filtered, index: !filtered && total > 0 });
}

export default async function PlatformPage({ params, searchParams }: PlatformPageProps) {
  const { platform: slug } = await params;
  const platform = platformBySlug(slug);
  if (!platform) notFound();

  const t = await getTranslations("catalog");
  const query = parseCatalogParams(await searchParams, "board");
  const basePath = `/platform/${platform.slug}`;
  const info = platformInfo(platform.key);
  const guide = activationFor(platform.key);
  const [counts, minPrice, result] = await Promise.all([platformTypeCounts(platform.key), platformMinPrice(platform.key), queryCatalog({ kind: "platform", platform }, { ...query, category: null }, { basePath, defaultSort: "board" })]);
  const total = [...counts.values()].reduce((a, b) => a + b, 0);

  const typeIndex = [...PRODUCT_TYPES]
    .sort((a, b) => orderIndex(TYPE_ORDER, a.key) - orderIndex(TYPE_ORDER, b.key))
    .filter((type) => (counts.get(type.key) ?? 0) > 0)
    .map((type) => ({
    slug: type.slug,
    label: type.key === "dlc" ? "DLC" : type.label,
    count: counts.get(type.key) ?? 0,
    href: `/catalog/${categorySlugFor(type.key, platform.key)}`,
  }));
  const others = (await stockedPlatformCounts()).filter((o) => o.platform !== platform.key);
  const related = PLATFORM_BOARD.filter((p) => p.key !== "other" && others.some((o) => o.platform === p.key)).map((p) => ({ key: p.key, name: platformInfo(p.key).short, href: `/platform/${platformInfo(p.key).slug}` }));
  const feature = query.sort === "board" && result.page === 1 ? (result.products.slice(0, 8).find((p) => p.screenshotUrl && (p.quantity ?? 1) > 0) ?? null) : null;

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-container px-gutter">
        <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: "Catalogue", href: "/catalog" }, { label: info.short }]} />
      </div>
      {total === 0 && !hasActiveFilters(query) ? (
        <div className="mx-auto max-w-container px-gutter">
          <EmptyState title={`No ${info.short} keys in stock right now`} subtitle="These platforms have keys on the board." headingLevel={1}>
            <ul className="m-0 grid list-none gap-x-8 gap-y-1 p-0 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="flex min-h-11 items-center">
                    <PlatformSign platform={r.key} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          </EmptyState>
        </div>
      ) : (
        <>
          <PlatformOpener
            platform={platform.key}
            name={`${info.short} keys`}
            count={total}
            minPrice={minPrice}
            sentence={guide?.sentence ?? `Activates on ${platform.label}. You need ${platform.account}.`}
            guideHref={guide ? `/how-activation-works#${platform.slug}` : null}
            guideLabel={`How to redeem on ${info.short}`}
            typeIndex={typeIndex}
          />
          <div className="mx-auto max-w-container px-gutter pt-8 lg:pt-10">
          <CatalogBrowser
            basePath={basePath}
            params={{ ...query, category: null, page: result.page }}
            products={result.products}
            total={result.total}
            page={result.page}
            totalPages={result.totalPages}
            facets={result.facets}
            defaultSort="board"
            related={related.slice(0, 4).map(({ name, href }) => ({ name, href }))}
            headingId="platform-results"
            heading={t("resultsIn", { name: platform.label })}
            hide={["platforms"]}
            feature={feature}
          />
          </div>
        </>
      )}
    </div>
  );
}
