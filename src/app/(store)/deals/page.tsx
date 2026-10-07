import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata, pagedDescription } from "@/lib/seo/metadata";
import { STORE_POLICY } from "@/config/store-policy";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { CategoryOpener } from "@/components/catalog/CategoryOpener";
import { queryCatalog } from "@/components/catalog/catalog-query";
import { getStoreIndex } from "@/lib/catalog/store-index";
import { hasActiveFilters, parseCatalogParams, type RawSearchParams } from "@/components/catalog/catalog-url";

interface DealsPageProps {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ searchParams }: DealsPageProps): Promise<Metadata> {
  const t = await getTranslations("catalog");
  const query = parseCatalogParams(await searchParams, "discount");
  const title = query.page > 1 ? t("titleWithPage", { title: "Price cuts", page: query.page }) : "Price cuts";
  const description = pagedDescription(`Game keys priced below their recent price. The earlier price shown is the lowest price in the ${STORE_POLICY.deals.compareWindowDays} days before the cut.`, query.page, (text, page) => t("descriptionWithPage", { description: text, page }));
  const filtered = hasActiveFilters({ ...query, onSale: false });
  const { onSale } = await getStoreIndex();
  return pageMetadata({ title, description, path: query.page > 1 ? `/deals?page=${query.page}` : "/deals", canonical: !filtered, index: !filtered && onSale > 0 });
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const t = await getTranslations("catalog");
  const query = { ...parseCatalogParams(await searchParams, "discount"), onSale: true };
  const result = await queryCatalog({ kind: "all" }, { ...query, category: null }, { basePath: "/deals", defaultSort: "discount" });
  return (
    <div className="mx-auto max-w-container px-gutter pb-24">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: "Catalogue", href: "/catalog" }, { label: "Price cuts" }]} />
      <CategoryOpener
        name="Price cuts"
        count={result.facets.onSaleCount}
        note={<p className="m-0 border-y border-line py-3 text-ui-md text-ink">The earlier price is the lowest this key cost here in the {STORE_POLICY.deals.compareWindowDays} days before the cut.</p>}
      />
      {result.facets.onSaleCount === 0 ? (
        <EmptyState
          title="No price cuts right now"
          subtitle={`A key appears here when its price drops at least ${STORE_POLICY.deals.minPercent}% below the lowest price it had here in the previous ${STORE_POLICY.deals.compareWindowDays} days.`}
          actionLabel="Browse all keys"
          actionHref="/catalog"
          actionVariant="outline"
          headingLevel={2}
        />
      ) : (
        <CatalogBrowser
          basePath="/deals"
          params={{ ...query, category: null, page: result.page }}
          products={result.products}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          facets={result.facets}
          defaultSort="discount"
          related={[{ name: "All keys", href: "/catalog" }]}
          headingId="deals-results"
          heading="Price cuts"
          lockOnSale
        />
      )}
    </div>
  );
}
