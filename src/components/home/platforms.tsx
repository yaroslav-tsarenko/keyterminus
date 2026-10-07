"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowBigRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FlipRow } from "@/components/motion/FlipRow";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { remarkLabel, remarkText } from "@/components/ui/Remark";
import { Cover } from "@/components/product/Cover";
import { useCurrency } from "@/providers/CurrencyProvider";
import { boardPrice } from "@/lib/catalog/board-text";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils/cn";
import { SectionHeading, SignLink, formatCount } from "./parts";
import type { HomePlatform } from "./types";

export function PlatformSigns({ platforms }: { platforms: HomePlatform[] }) {
  const t = useTranslations("home.platforms");
  const { currency, convert } = useCurrency();
  const [active, setActive] = useState(platforms[0]?.key ?? "");
  const pointer = useRef<string>("mouse");
  const current = platforms.find((p) => p.key === active) ?? platforms[0];
  if (!current) return null;
  const large = platforms.slice(0, 4);
  const rest = platforms.slice(4);
  const from = (p: HomePlatform) => (p.minPrice != null ? t("from", { price: formatPrice(convert(p.minPrice), currency) }) : null);

  const handlers = (p: HomePlatform) => ({
    onPointerDown: (e: PointerEvent) => {
      pointer.current = e.pointerType;
    },
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === "mouse") setActive(p.key);
    },
    onFocus: () => setActive(p.key),
    onClick: (e: MouseEvent) => {
      if (pointer.current !== "mouse" && active !== p.key) {
        e.preventDefault();
        setActive(p.key);
      }
    },
  });

  return (
    <section id="platforms" aria-labelledby="platforms-title" data-home-section="platforms" className="home-platforms bg-surface">
      <div className="mx-auto max-w-container px-gutter">
        <div className="grid gap-x-6 gap-y-6 lg:grid-cols-12 lg:items-end">
          <SectionHeading id="platforms-title" title={t("title")} lead={t("lead")} className="lg:col-span-7" />
          <div className="lg:col-span-5 lg:text-right">
            <SignLink href="/catalog">{t("all")}</SignLink>
          </div>
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-10 lg:mt-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4">
              {large.map((p) => (
                <li key={p.key} className="min-w-0">
                  <Link href={p.href} {...handlers(p)} data-anim="sign" data-active={p.key === current.key || undefined} className="platform-sign group/sign">
                    <PlatformTile number={p.number} size="lg" className="max-sm:h-[52px] max-sm:min-w-[40px] max-sm:text-[1.625rem]" />
                    <span className="mt-auto block min-w-0">
                      <span className="block truncate pt-1 font-display text-step-3 font-extrabold leading-[1.05] tracking-[-0.01em] text-ink">{p.name}</span>
                      <span className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-mono text-data text-ink-muted">
                        <span className="text-ink">{t("keys", { count: formatCount(p.count) })}</span>
                        {from(p) ? <span>{from(p)}</span> : null}
                      </span>
                    </span>
                    <ArrowBigRight size={24} aria-hidden="true" className="platform-sign-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
            {rest.length ? (
              <ul aria-label={t("otherLabel")} className="m-0 mt-6 grid list-none border-t border-line p-0 sm:grid-cols-2 sm:gap-x-6">
                {rest.map((p) => (
                  <li key={p.key} className="border-b border-line">
                    <Link href={p.href} {...handlers(p)} data-active={p.key === current.key || undefined} className="platform-row group/row">
                      <PlatformTile number={p.number} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate pt-1 font-display text-step-1 font-extrabold leading-[1.1] text-ink decoration-link decoration-2 underline-offset-[3px] group-hover/row:underline">{p.name}</span>
                        <span className="mt-1 flex gap-3 font-mono text-data-sm text-ink-muted">
                          <span>{t("keys", { count: formatCount(p.count) })}</span>
                          {from(p) ? <span>{from(p)}</span> : null}
                        </span>
                      </span>
                      <ArrowBigRight size={18} aria-hidden="true" className="shrink-0 text-ink-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="min-w-0 lg:col-span-4 lg:col-start-9">
            <Peek platform={current} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Peek({ platform }: { platform: HomePlatform }) {
  const t = useTranslations("home.platforms");
  const { currency, convert } = useCurrency();
  const rows = Array.from({ length: 3 }, (_, i) => platform.peek[i] ?? null);
  return (
    <div data-scene="peek" className="lg:sticky lg:top-[calc(var(--header-height)+24px)]">
      <div data-surface="board" data-depth="D1" className="board p-4">
        <p className="m-0 flex items-center gap-2 font-display text-[0.75rem] font-bold uppercase tracking-[0.14em] text-on-board-muted" aria-live="polite">
          <PlatformTile number={platform.number} size="xs" />
          <span className="truncate pt-0.5">{t("peekLabel", { number: platform.number ?? "–", name: platform.name })}</span>
        </p>
        <ol aria-label={t("peekCaption", { name: platform.name })} className="m-0 mt-3 list-none p-0">
          {rows.map((r, i) => (
            <li key={i} className={cn("peek-row", r && "relative")}>
              {r ? (
                <Link href={r.href} className="peek-link block" data-depth="D2">
                  <FlipRow text={r.boardTitle} cells={18} size="md" row={i} label={r.title} />
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <FlipRow text={boardPrice(convert(r.amount), currency)} cells={7} align="right" size="sm" row={i} label={formatPrice(convert(r.amount), currency)} />
                    <FlipRow text={remarkText(r.remark.kind, r.remark.percent)} cells={9} align="right" tone="remark" size="sm" row={i} label={remarkLabel(r.remark.kind, r.remark.percent)} />
                  </span>
                </Link>
              ) : (
                <FlipRow text="" cells={18} size="md" label="" />
              )}
            </li>
          ))}
        </ol>
      </div>
      {platform.peek.length ? (
        <ul className="m-0 mt-4 grid list-none grid-cols-3 gap-3 p-0">
          {platform.peek.map((r) => (
            <li key={r.id} className="peek-cover overflow-hidden rounded-card border border-line" data-depth="D3">
              <Link href={r.href} tabIndex={-1} aria-hidden="true" className="block">
                <Cover src={r.cover} alt="" sizes="(min-width: 1024px) 120px, 30vw" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <SignLink href={`/platform/${platform.slug}`} className="mt-3">
        {t("peekAll", { name: platform.name, count: formatCount(platform.count) })}
      </SignLink>
    </div>
  );
}
