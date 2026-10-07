"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils/cn";
import { platformInfo, regionTag } from "@/lib/catalog/platforms";
import { FlapRow } from "@/components/ui/Flap";
import { PlatformTile } from "@/components/ui/PlatformTile";
import type { GiftCardGroup, Timetable } from "@/lib/catalog/prepaid";

export function faceLabel(value: number | null, currency: string | null): string | null {
  if (value == null || !currency) return null;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 }).format(value);
}

export function SubscriptionTimetable({ table, caption }: { table: Timetable; caption: string }) {
  const { currency, convert } = useCurrency();
  const [hover, setHover] = useState<{ row: string; col: string } | null>(null);
  if (!table.rows.length) return null;
  const headHi = (on: boolean) => (on ? "bg-brand-soft" : "");
  return (
    <div data-timetable="">
      <div className="hidden overflow-x-auto rounded-control border border-rule bg-raised md:block" onPointerLeave={() => setHover(null)}>
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="label-caps px-4 py-3 text-ink-muted">
                Service
              </th>
              {table.columns.map((c) => (
                <th key={c.key} scope="col" className={cn("label-caps px-3 py-3 text-right text-ink-muted transition-colors duration-[120ms]", headHi(hover?.col === c.key))}>
                  {c.label}
                </th>
              ))}
              <th scope="col" className="label-caps px-4 py-3 text-right text-ink-muted">
                Region
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => {
              const p = platformInfo(row.platform);
              return (
                <tr key={row.key} className="border-b border-line last:border-b-0">
                  <th scope="row" className={cn("px-4 py-2.5 text-left font-normal transition-colors duration-[120ms]", headHi(hover?.row === row.key))}>
                    <span className="flex items-center gap-2.5">
                      <PlatformTile number={p.number} size="xs" />
                      <span className="pt-px text-ui-md font-semibold text-ink">{row.service}</span>
                    </span>
                  </th>
                  {table.columns.map((c) => {
                    const cell = row.cells[c.key];
                    return (
                      <td key={c.key} className="px-3 py-2.5 text-right" onPointerEnter={() => setHover({ row: row.key, col: c.key })}>
                        {cell ? (
                          <Link
                            href={`/product/${cell.slug}`}
                            onFocus={() => setHover({ row: row.key, col: c.key })}
                            onBlur={() => setHover(null)}
                            aria-label={`${row.service}, ${c.label}, ${formatPrice(convert(cell.price), currency)}`}
                            className="price inline-flex min-h-9 items-center text-ui-md text-ink underline decoration-line-hover decoration-2 underline-offset-[3px] hover-device:hover:decoration-link"
                          >
                            {formatPrice(convert(cell.price), currency)}
                          </Link>
                        ) : (
                          <span aria-label="Not in stock" className="font-mono text-ui-md text-ink-subtle">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-right font-mono text-[0.75rem] font-semibold uppercase text-ink">{regionTag(row.region)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ul className="m-0 flex list-none flex-col border-t border-rule p-0 md:hidden">
        {table.rows.map((row) => {
          const p = platformInfo(row.platform);
          return (
            <li key={row.key} className="border-b border-line py-3.5">
              <p className="m-0 flex items-center gap-2.5">
                <PlatformTile number={p.number} size="xs" />
                <span className="pt-px text-ui-md font-semibold text-ink">{row.service}</span>
                <span className="ml-auto font-mono text-[0.75rem] font-semibold uppercase text-ink">{regionTag(row.region)}</span>
              </p>
              <ul className="m-0 mt-2.5 flex list-none flex-col p-0">
                {table.columns
                  .filter((c) => row.cells[c.key])
                  .map((c) => (
                    <li key={c.key}>
                      <Link href={`/product/${row.cells[c.key].slug}`} className="flex min-h-11 items-center justify-between gap-3 text-ui-md text-ink">
                        <span className="underline decoration-link decoration-2 underline-offset-[3px]">{c.label}</span>
                        <span className="price">{formatPrice(convert(row.cells[c.key].price), currency)}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GiftCardFace({ group, className }: { group: GiftCardGroup; className?: string }) {
  const p = platformInfo(group.platform);
  const values = group.products.filter((x) => x.value != null);
  const top = values[values.length - 1] ?? null;
  const value = top ? (faceLabel(top.value, top.currency) ?? "").replace(/\s/g, "") : "";
  return (
    <div data-surface="board" data-giftcard="" className={cn("board flex aspect-[1.586/1] flex-col justify-between p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 flex items-center gap-2">
          <PlatformTile number={p.number} size="sm" />
          <span className="pt-0.5 font-display text-[0.9375rem] font-bold text-on-board">{p.short}</span>
        </p>
        <span className="label-caps text-on-board-muted">Gift card</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        {value ? <FlapRow text={value} size="lg" label={`Up to ${value}`} /> : <span />}
        <span className="font-mono text-[0.75rem] font-semibold uppercase text-on-board-muted">{regionTag(group.region)}</span>
      </div>
    </div>
  );
}

export function GiftCardShelf({ groups }: { groups: GiftCardGroup[] }) {
  const { currency, convert } = useCurrency();
  if (!groups.length) return null;
  const byPlatform = new Map<string, GiftCardGroup[]>();
  for (const g of groups) byPlatform.set(g.platform, [...(byPlatform.get(g.platform) ?? []), g]);
  return (
    <div data-giftcard-shelf="" className="flex flex-col">
      {[...byPlatform.entries()].map(([platform, list]) => {
        const p = platformInfo(platform);
        return (
          <section key={platform} aria-label={`${p.short} gift cards`} className="grid gap-x-8 gap-y-4 border-t border-line py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <h3 className="m-0 flex items-center gap-3 self-start">
              <PlatformTile number={p.number} size="sm" />
              <span className="pt-0.5 text-step-1 font-extrabold text-ink">{p.short}</span>
            </h3>
            <div className="no-scrollbar -mx-gutter flex snap-x scroll-px-gutter gap-4 overflow-x-auto px-gutter sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3">
              {list.map((g) => (
                <div key={g.key} className="flex w-[78vw] max-w-[340px] shrink-0 snap-start flex-col gap-3 sm:w-auto sm:max-w-none">
                  <GiftCardFace group={g} />
                  <ul className="m-0 flex list-none flex-col border-t border-rule p-0" aria-label={`${p.short} ${regionTag(g.region)} values`}>
                    {g.products.slice(0, 5).map((x) => (
                      <li key={x.id} className="border-b border-line">
                        <Link href={`/product/${x.slug}`} className="group/value flex min-h-10 items-center justify-between gap-3 text-ui-md text-ink">
                          <span className="font-semibold underline decoration-line-hover decoration-2 underline-offset-[3px] group-hover/value:decoration-link">{faceLabel(x.value, x.currency) ?? "Card"} card</span>
                          <span className="price">{formatPrice(convert(x.price), currency)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {g.products.length > 5 ? (
                    <Link href={`/catalog/gift-cards?platform=${encodeURIComponent(g.platform)}&region=${encodeURIComponent(g.region)}`} className="self-start text-ui-sm font-semibold text-ink underline decoration-link decoration-2 underline-offset-[3px]">
                      All {g.products.length} {regionTag(g.region)} values
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
