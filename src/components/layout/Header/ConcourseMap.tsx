"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AppWindow, ArrowBigRight, CalendarRange, Coins, LayersPlus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { Remark } from "@/components/ui/Remark";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { remarkFor } from "@/lib/catalog/remarks";
import type { StoreIndex } from "@/lib/catalog/store-index";

export const TYPE_ICON: Record<string, typeof LayersPlus> = { dlc: LayersPlus, "gift-card": Wallet, subscription: CalendarRange, "top-up": Coins, software: AppWindow };

export function bandHref(band: { baseMin: number | null; baseMax: number | null }) {
  const qs = new URLSearchParams();
  if (band.baseMin !== null) qs.set("minPrice", String(band.baseMin));
  if (band.baseMax !== null) qs.set("maxPrice", String(band.baseMax));
  return `/catalog?${qs.toString()}`;
}

export interface ConcourseMapProps {
  id: string;
  open: boolean;
  index: StoreIndex | null;
  onClose: (restoreFocus?: boolean) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

export function ConcourseMap({ id, open, index, onClose, onPointerEnter, onPointerLeave }: ConcourseMapProps) {
  const { currency, convert } = useCurrency();
  const [pointed, setPointed] = useState<string | null>(null);
  const money = (n: number) => formatPrice(convert(n), currency);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose(true);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const target = e.target as HTMLElement;
    const column = target.closest<HTMLElement>("[data-map-col]");
    if (!column) return;
    const columns = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-map-col]"));
    const links = Array.from(column.querySelectorAll<HTMLAnchorElement>("a"));
    const i = links.indexOf(target as HTMLAnchorElement);
    e.preventDefault();
    if (e.key === "ArrowDown") links[Math.min(links.length - 1, i + 1)]?.focus();
    else if (e.key === "ArrowUp") links[Math.max(0, i - 1)]?.focus();
    else {
      const ci = columns.indexOf(column);
      const next = columns[e.key === "ArrowRight" ? Math.min(columns.length - 1, ci + 1) : Math.max(0, ci - 1)];
      next?.querySelector<HTMLAnchorElement>("a")?.focus();
    }
  };

  if (!open) return null;

  const platforms = index?.platforms ?? [];
  const focus = platforms.find((p) => p.key === pointed) ?? platforms[0] ?? null;
  const bands = index?.bands[currency] ?? [];

  return (
    <div
      id={id}
      data-concourse-map=""
      data-scene="peek"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (next && (e.currentTarget.contains(next) || (next as HTMLElement).closest?.("[data-board-trigger]"))) return;
        onClose(false);
      }}
      className="absolute inset-x-0 top-full z-50 max-h-[76vh] animate-panel-drop overflow-y-auto border-b border-line bg-raised text-ink shadow-overlay"
    >
      <div className="mx-auto grid max-w-container grid-cols-12 gap-x-6 gap-y-8 px-gutter py-8 min-[1600px]:max-w-wide">
        <section aria-label="Platforms" data-map-col="" className="col-span-5">
          <p className="eyebrow m-0 mb-3">Platforms</p>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-6 p-0">
            {platforms.map((p) => {
              const lit = focus?.key === p.key;
              return (
                <li key={p.key} className="border-b border-line">
                  <Link
                    href={`/platform/${p.slug}`}
                    data-peek-trigger={p.key}
                    onFocus={() => setPointed(p.key)}
                    onPointerEnter={() => setPointed(p.key)}
                    onClick={() => onClose(false)}
                    className={cn("flex min-h-14 items-center gap-3 rounded-sign px-2 py-2 transition-colors duration-[120ms] focus-visible:outline-offset-[-2px]", lit && "bg-brand-soft")}
                  >
                    <PlatformTile number={p.number} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate pt-0.5 font-display text-step-0 font-bold leading-tight">{p.short}</span>
                      <span className="block font-mono text-[0.75rem] text-ink-muted">
                        {p.count.toLocaleString("en-GB")}
                        {p.minPrice != null ? ` · from ${money(p.minPrice)}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-label="Types and prices" data-map-col="" className="col-span-3">
          <p className="eyebrow m-0 mb-3">Types</p>
          <ul className="m-0 list-none p-0">
            {(index?.types ?? []).map((t) => {
              const Icon = TYPE_ICON[t.key];
              return (
                <li key={t.key}>
                  <Link href={`/catalog/${t.slug}`} onClick={() => onClose(false)} className="flex min-h-10 items-center gap-2.5 rounded-sign px-1 text-ui-md font-semibold text-ink hover-device:hover:bg-surface-1">
                    {Icon ? <Icon size={18} aria-hidden="true" /> : <span aria-hidden="true" className="w-[18px]" />}
                    <span className="flex-1 pt-0.5">{t.label}</span>
                    <span className="font-mono text-[0.75rem] font-normal text-ink-muted">{t.count.toLocaleString("en-GB")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="eyebrow m-0 mb-2 mt-5 border-t border-line pt-4">Price</p>
          <ul className="m-0 list-none p-0">
            {bands.map((b) => (
              <li key={b.key}>
                <Link href={bandHref(b)} onClick={() => onClose(false)} className="flex min-h-9 items-center justify-between gap-2 rounded-sign px-1 text-ui-md text-ink hover-device:hover:bg-surface-1">
                  <span className="pt-0.5">{b.label}</span>
                  <span className="font-mono text-[0.75rem] text-ink-muted">{b.count.toLocaleString("en-GB")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label={focus ? `Next from ${focus.short}` : "Preview"} data-map-col="" className="col-span-4">
          {focus && focus.covers.length ? (
            <>
              <div data-surface="board" className="board p-3">
                <p className="m-0 mb-2.5 px-1 font-display text-[0.75rem] font-bold uppercase tracking-[0.14em] text-on-board-muted">
                  {focus.number ? `Next from platform ${focus.number} · ` : "Next from "}
                  {focus.short}
                </p>
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                  {focus.covers.map((c) => {
                    const remark = remarkFor({ price: c.price, comparePrice: c.comparePrice, isNew: c.isNew });
                    return (
                      <li key={c.slug}>
                        <Link href={`/product/${c.slug}`} onClick={() => onClose(false)} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-sign px-1 py-1 hover-device:hover:bg-flap">
                          <span className="font-mono text-[0.8125rem] font-semibold text-on-board">{money(c.price)}</span>
                          <span className="truncate font-display text-[0.875rem] font-bold uppercase text-on-board group-hover:underline group-hover:decoration-remark">{c.title}</span>
                          <Remark kind={remark.kind} percent={remark.percent} surface="board" size="xs" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <Link href={`/platform/${focus.slug}`} onClick={() => onClose(false)} className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-ui-md font-semibold text-ink underline decoration-link decoration-2 underline-offset-4 hover-device:hover:text-accent-ink">
                All {focus.short} keys · <span className="font-mono font-normal">{focus.count.toLocaleString("en-GB")}</span>
                <ArrowBigRight size={16} aria-hidden="true" />
              </Link>
            </>
          ) : null}
        </section>

        {index?.genres.length ? (
          <nav aria-label="Genres" data-map-col="" className="col-span-12 border-t border-line pt-5">
            <ul className="m-0 flex list-none flex-wrap items-baseline gap-x-5 gap-y-1 p-0">
              <li className="eyebrow mr-1">Genres</li>
              {index.genres.slice(0, 12).map((g) => (
                <li key={g.key}>
                  <Link href={`/genre/${g.key}`} onClick={() => onClose(false)} className="inline-flex min-h-9 items-baseline gap-1.5 text-ui-md text-ink underline-offset-4 hover-device:hover:underline hover-device:hover:decoration-link hover-device:hover:decoration-2">
                    {g.label}
                    <span className="font-mono text-[0.75rem] text-ink-muted">{g.count.toLocaleString("en-GB")}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/catalog" onClick={() => onClose(false)} className="inline-flex min-h-9 items-center gap-1 text-ui-md font-semibold text-ink underline decoration-link decoration-2 underline-offset-4 hover-device:hover:text-accent-ink">
                  All keys
                  <ArrowBigRight size={16} aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}

