import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowBigLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FlapRow } from "@/components/ui/Flap";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { SearchForm } from "@/components/search/SearchResults/SearchResults";
import { platformInfo } from "@/lib/catalog/platforms";
import { PLATFORM_ORDER, orderIndex } from "@/config/merchandising";

export async function NotFoundBoard() {
  const t = await getTranslations("errors");
  const rows = await prisma.keyItem
    .groupBy({ by: ["platform"], where: { platform: { not: "other" }, product: { status: "ACTIVE", quantity: { gt: 0 } } }, _count: { _all: true } })
    .catch(() => []);
  const platforms = rows.sort((a, b) => orderIndex(PLATFORM_ORDER, a.platform) - orderIndex(PLATFORM_ORDER, b.platform)).map((r) => platformInfo(r.platform));

  return (
    <div className="mx-auto max-w-container px-gutter pb-24 pt-10 lg:pt-16">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-x-10">
        <div data-surface="board" data-scene="not-found" className="board flex flex-col gap-3 overflow-hidden p-4 sm:p-5 lg:col-span-6">
          <p className="label-caps m-0 flex justify-between text-on-board-muted">
            <span>Destination</span>
            <span>Remarks</span>
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <FlapRow text="PLATFORM 404" cells={12} size="md" label="Platform 404" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <FlapRow text="NOT ON THE BOARD" cells={16} size="sm" label="Not on the board" />
            <FlapRow text="CHECK THE BOARD" tone="remark" size="sm" label="Check the board" />
          </div>
        </div>
        <div className="lg:col-span-6">
          <h1 className="m-0 pt-1 text-step-4 leading-[1.04] text-ink">{t("notFoundTitle")}</h1>
          <p className="m-0 mt-3 max-w-[46ch] text-step-1 leading-[1.5] text-ink-muted">{t("notFoundSubtitle")}</p>
          <div className="mt-8 max-w-[34rem]">
            <SearchForm query="" label={t("searchLabel")} placeholder={t("searchPlaceholder")} submit={t("searchSubmit")} />
          </div>
          {platforms.length ? (
            <nav aria-label="Platforms" className="mt-8">
              <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-3 p-0">
                {platforms.map((p) => (
                  <li key={p.key}>
                    <Link href={`/platform/${p.slug}`} className="group/pl inline-flex min-h-11 items-center gap-2">
                      <PlatformTile number={p.number} size="sm" />
                      <span className="pt-0.5 text-ui-md font-bold text-ink decoration-link decoration-2 underline-offset-[3px] group-hover/pl:underline">{p.short}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <Link href="/" className="btn-text mt-8 inline-flex min-h-11 items-center gap-1.5 text-ui-md font-semibold text-ink">
            <ArrowBigLeft size={16} aria-hidden="true" />
            <span data-label="">{t("backHome")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
