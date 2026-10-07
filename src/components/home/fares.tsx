"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FlipRow } from "@/components/motion/FlipRow";
import { Cover } from "@/components/product/Cover";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { useCurrency } from "@/providers/CurrencyProvider";
import { boardPrice } from "@/lib/catalog/board-text";
import { platformInfo } from "@/lib/catalog/platforms";
import { BOARD_LEGEND } from "@/lib/catalog/remarks";
import { STORE_POLICY } from "@/config/store-policy";
import { cn } from "@/lib/utils/cn";
import { SectionHeading, SignLink, formatCount } from "./parts";
import type { FareRow, HomeFares } from "./types";

function Row({ row, index, feature = false }: { row: FareRow; index: number; feature?: boolean }) {
  const t = useTranslations("home.fares");
  const { currency, convert } = useCurrency();
  const info = platformInfo(row.platform);
  const now = boardPrice(convert(row.amount), currency);
  const was = boardPrice(convert(row.was), currency);
  return (
    <tr data-fare-row="" data-feature={feature || undefined} className={cn("fare-row", feature && "fare-feature")}>
      <th scope="row" className="fare-title">
        <span className="flex items-center gap-3">
          {feature && row.cover ? (
            <span className="fare-cover block shrink-0 overflow-hidden rounded-sign">
              <Cover src={row.cover} alt="" sizes="72px" />
            </span>
          ) : null}
          <Link href={row.href} className="fare-link min-w-0 font-display font-bold leading-[1.2] text-on-board">
            {row.title}
          </Link>
        </span>
      </th>
      <td className="fare-platform">
        <span className="inline-flex items-center gap-2">
          <PlatformTile number={info.number} size="xs" />
          <span className="pt-0.5 font-display text-[0.75rem] font-bold uppercase tracking-[0.1em] text-on-board">{info.short}</span>
        </span>
      </td>
      <td className="fare-was">
        <s className="font-mono text-data text-on-board-faint">
          <span className="sr-only">{t("was", { price: was })}</span>
          <span aria-hidden="true">{was}</span>
        </s>
      </td>
      <td className="fare-now">
        <FlipRow text={now} cells={7} align="right" size="sm" row={index} data-was={was} label={now} />
      </td>
      <td className="fare-remark">
        <FlipRow text={`NOW −${row.percent}%`} cells={8} align="right" tone="remark" size="sm" row={index} label={`Price cut ${row.percent}%`} />
      </td>
    </tr>
  );
}

export function Fares({ fares }: { fares: HomeFares }) {
  const t = useTranslations("home.fares");
  if (!fares.feature && fares.rows.length === 0) return null;
  const rows = fares.feature ? [fares.feature, ...fares.rows] : fares.rows;
  return (
    <section id="revised-fares" aria-labelledby="fares-title" data-scene="fares" data-home-section="fares" className="home-fares bg-surface-1">
      <div className="mx-auto grid max-w-wide gap-x-6 gap-y-8 px-gutter lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-4">
          <SectionHeading id="fares-title" title={t("title")} lead={t("lead", { days: STORE_POLICY.deals.compareWindowDays })} />
          <SignLink href="/deals" className="mt-4">
            {t("all", { count: formatCount(fares.total) })}
          </SignLink>
        </div>
        <div className="min-w-0 lg:col-span-8">
          <div data-surface="board" data-depth="D1" className="board overflow-x-auto p-3 sm:p-4">
            <table className="fares-table">
              <caption className="sr-only">{t("caption")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("headDestination")}</th>
                  <th scope="col">{t("headPlatform")}</th>
                  <th scope="col" className="text-right">
                    {t("headWas")}
                  </th>
                  <th scope="col" className="text-right">
                    {t("headNow")}
                  </th>
                  <th scope="col" className="text-right">
                    {t("headRemarks")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <Row key={r.id} row={r} index={i} feature={i === 0 && Boolean(fares.feature)} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="m-0 mt-3 text-ui-sm text-ink-muted">{BOARD_LEGEND}</p>
        </div>
      </div>
    </section>
  );
}
