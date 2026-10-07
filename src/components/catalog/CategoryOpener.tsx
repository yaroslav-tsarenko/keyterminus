"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AppWindow, ArrowBigRight, CalendarRange, Coins, LayersPlus, Wallet } from "lucide-react";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils/cn";
import { FlapCounter } from "@/components/ui/Flap";
import { PlatformTile } from "@/components/ui/PlatformTile";

export interface IndexLink {
  slug: string;
  label: string;
  count: number;
  href: string;
  active?: boolean;
  platform?: string | null;
}

export function PriceSpan({ min, max }: { min: number; max: number }) {
  const { currency, convert } = useCurrency();
  const money = (n: number) => formatPrice(convert(n), currency);
  return (
    <>
      from <span className="font-mono text-ink">{money(min)}</span> to <span className="font-mono text-ink">{money(max)}</span>
    </>
  );
}

export function FromPrice({ min, className }: { min: number; className?: string }) {
  const { currency, convert } = useCurrency();
  return <span className={cn("font-mono text-data text-ink", className)}>from {formatPrice(convert(min), currency)}</span>;
}

export function IndexRow({ links, label, className, size = "md" }: { links: IndexLink[]; label: string; className?: string; size?: "sm" | "md" }) {
  if (!links.length) return null;
  return (
    <nav aria-label={label} className={className}>
      <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-1 p-0">
        {links.map((l) => (
          <li key={l.slug}>
            <Link
              href={l.href}
              aria-current={l.active ? "page" : undefined}
              className={cn("active-bar inline-flex items-center gap-2 py-1.5 text-ink hover-device:hover:[&::after]:scale-x-100", size === "sm" ? "min-h-10" : "min-h-11")}
            >
              {l.platform ? <PlatformTile platform={l.platform} size="xs" /> : null}
              <span className="pt-0.5 text-ui-md font-bold">{l.label}</span>
              <span className="pt-0.5 font-mono text-[0.75rem] text-ink-muted">{l.count.toLocaleString("en-GB")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CatalogBoardHeader({ eyebrow, title, count, typeIndex = [] }: { eyebrow: string; title: string; count: number; typeIndex?: IndexLink[] }) {
  return (
    <header data-surface="board" data-board-header="" className="bg-board text-on-board">
      <div className="mx-auto flex min-h-[72px] max-w-container flex-col justify-center gap-4 px-gutter py-4 lg:min-h-[104px] lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-5">
        <div className="min-w-0">
          <p className="label-caps m-0 text-on-board-muted max-lg:sr-only">{eyebrow}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="m-0 pt-1 text-step-4 leading-[1.04] text-on-board">{title}</h1>
            <FlapCounter value={count} label={`${count.toLocaleString("en-GB")} keys`} size="md" />
          </div>
        </div>
        {typeIndex.length ? (
          <nav aria-label="Keys by type" className="max-lg:hidden">
            <ul className="m-0 flex list-none flex-wrap justify-end gap-x-1 gap-y-1 p-0">
              {typeIndex.map((l, i) => (
                <li key={l.slug} className="flex items-center">
                  {i > 0 ? (
                    <span aria-hidden="true" className="px-1.5 text-on-board-faint">
                      ·
                    </span>
                  ) : null}
                  <Link href={l.href} className="inline-flex min-h-10 items-center gap-1.5 rounded-sign px-1.5 text-on-board hover-device:hover:bg-flap">
                    <span className="pt-0.5 text-ui-md font-bold">{l.label}</span>
                    <span className="pt-0.5 font-mono text-[0.8125rem] text-on-board-muted">{l.count.toLocaleString("en-GB")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

const TYPE_ICON = { dlc: LayersPlus, "gift-cards": Wallet, subscriptions: CalendarRange, "top-ups": Coins, software: AppWindow } as const;
export type TypeIconKey = keyof typeof TYPE_ICON;

export interface CategoryOpenerProps {
  name: string;
  count: number;
  lead?: ReactNode;
  note?: ReactNode;
  minPrice?: number | null;
  maxPrice?: number | null;
  index?: IndexLink[];
  indexLabel?: string;
  icon?: TypeIconKey | null;
  eyebrow?: string;
}

export function CategoryOpener({ name, count, lead, note, minPrice, maxPrice, index = [], indexLabel = "Platforms", icon = null, eyebrow }: CategoryOpenerProps) {
  const Icon = icon ? TYPE_ICON[icon] : null;
  return (
    <header data-category-opener="" className="pb-8 pt-2 lg:pb-10">
      {eyebrow ? <p className="eyebrow m-0 mb-3">{eyebrow}</p> : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {Icon ? <Icon size={24} aria-hidden="true" className="text-ink" /> : null}
        <h1 className="m-0 pt-1 text-step-4 leading-[1.04] text-ink">{name}</h1>
        <FlapCounter value={count} label={`${count.toLocaleString("en-GB")} keys in stock`} size="sm" />
      </div>
      {lead ? <p className="measure m-0 mt-3 text-step-1 leading-[1.5] text-ink-muted">{lead}</p> : null}
      {note ? <div className="measure mt-3">{note}</div> : null}
      {minPrice != null && maxPrice != null && count > 0 ? (
        <p className="m-0 mt-2 text-ui-md text-ink-muted">
          Priced <PriceSpan min={minPrice} max={maxPrice} />.
        </p>
      ) : null}
      {index.length ? <IndexRow links={index} label={indexLabel} size="sm" className="mt-6 border-t border-line pt-3" /> : null}
    </header>
  );
}

export function PlatformOpener({
  platform,
  name,
  count,
  minPrice,
  sentence,
  guideHref,
  guideLabel,
  typeIndex,
}: {
  platform: string;
  name: string;
  count: number;
  minPrice: number | null;
  sentence: string;
  guideHref: string | null;
  guideLabel: string;
  typeIndex: IndexLink[];
}) {
  return (
    <header data-platform-opener="" className="border-y border-line bg-surface-1">
      <div className="mx-auto grid max-w-container gap-x-10 gap-y-6 px-gutter py-8 lg:grid-cols-12 lg:items-end lg:py-10">
        <div className="flex min-w-0 gap-5 sm:gap-6 lg:col-span-7">
          <PlatformTile platform={platform} size="lg" className="max-sm:h-[52px] max-sm:min-w-[40px] max-sm:text-[1.625rem]" />
          <div className="min-w-0">
            <h1 className="m-0 pt-1 text-step-4 leading-[1.04] text-ink">{name}</h1>
            <p className="m-0 mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-ui-md text-ink-muted">
              <span>
                <span className="font-mono text-ink">{count.toLocaleString("en-GB")}</span> keys
              </span>
              {minPrice != null ? (
                <>
                  <span aria-hidden="true" className="text-ink-subtle">
                    ·
                  </span>
                  <FromPrice min={minPrice} className="text-ui-md" />
                </>
              ) : null}
            </p>
            <p className="measure m-0 mt-3 text-step-0 text-ink">{sentence}</p>
            {guideHref ? (
              <Link href={guideHref} className="btn-text mt-2 inline-flex min-h-10 items-center gap-1.5 text-ui-md font-semibold text-ink">
                <span data-label="">{guideLabel}</span>
                <ArrowBigRight size={16} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
        {typeIndex.length ? (
          <nav aria-label={`${name} by type`} className="min-w-0 lg:col-span-5">
            <p className="eyebrow m-0 mb-2">By type</p>
            <ul className="m-0 list-none border-t border-rule p-0">
              {typeIndex.map((l) => (
                <li key={l.slug} className="border-b border-line">
                  <Link href={l.href} className="group/type flex min-h-11 items-center justify-between gap-4 text-ink">
                    <span className="pt-0.5 text-ui-md font-bold decoration-link decoration-2 underline-offset-[3px] group-hover/type:underline">{l.label}</span>
                    <span className="font-mono text-data text-ink-muted">{l.count.toLocaleString("en-GB")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
