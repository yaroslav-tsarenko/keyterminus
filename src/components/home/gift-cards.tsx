"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FlipRow } from "@/components/motion/FlipRow";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { useCurrency } from "@/providers/CurrencyProvider";
import { platformInfo, regionLabel, regionTag } from "@/lib/catalog/platforms";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils/cn";
import { SectionHeading, SignLink } from "./parts";
import type { HomeGiftCard } from "./types";

export function GiftCards({ cards }: { cards: HomeGiftCard[] }) {
  const t = useTranslations("home.gift");
  const { currency, convert } = useCurrency();
  const [active, setActive] = useState(0);
  const [pick, setPick] = useState<Record<string, string>>({});
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const card = cards[active];
  if (!card) return null;
  const info = platformInfo(card.platform);
  const valued = card.values.filter((v) => v.label);
  const fallback = [...valued].sort((a, b) => Math.abs((a.value ?? 0) - 20) - Math.abs((b.value ?? 0) - 20))[0] ?? card.values[0];
  const chosen = card.values.find((v) => v.id === pick[card.key]) ?? fallback;
  const face = (chosen?.label ?? "").replace(/\s/g, "");
  const cells = Math.max(3, ...valued.map((v) => (v.label ?? "").replace(/\s/g, "").length));

  const move = (i: number) => {
    const next = (i + cards.length) % cards.length;
    setActive(next);
    refs.current[next]?.focus();
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") move(i + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(cards.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <section id="gift-cards" aria-labelledby="gift-title" data-scene="giftcard" data-home-section="gift-cards" className="home-gift bg-surface">
      <div className="mx-auto grid max-w-container gap-x-6 gap-y-8 px-gutter lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-4">
          <SectionHeading id="gift-title" title={t("title")} lead={t("lead")} />
          <div role="radiogroup" aria-label={t("platformsLabel")} className="gift-platforms no-scrollbar">
            {cards.map((c, i) => {
              const p = platformInfo(c.platform);
              const on = i === active;
              return (
                <button
                  key={c.key}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  data-selected={on || undefined}
                  className="gift-platform"
                >
                  <PlatformTile number={p.number} size="sm" />
                  <span className="min-w-0 flex-1 truncate pt-0.5 font-display text-ui-md font-bold text-ink">{p.short}</span>
                  <span className="shrink-0 font-mono text-data-sm text-ink-muted max-lg:hidden">{c.values.length === 1 ? t("value") : t("values", { count: c.values.length })}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <article key={card.key} data-giftcard="" data-surface="board" data-depth="D2" className="gift-blank board">
            <div className="flex items-start justify-between gap-3">
              <p className="m-0 flex items-center gap-2.5">
                <PlatformTile number={info.number} size="sm" />
                <span className="pt-0.5 font-display text-step-1 font-extrabold text-on-board">{info.short}</span>
              </p>
              <span className="font-display text-[0.75rem] font-bold uppercase tracking-[0.14em] text-on-board-muted">{t("card")}</span>
            </div>
            <p className="m-0 max-w-[30ch] text-ui-md leading-[1.4] text-on-board-muted">{card.title}</p>
            <div className="flex items-end justify-between gap-3">
              {face ? <FlipRow text={face} cells={cells} size="lg" label={chosen?.label ?? ""} /> : <span className="font-display text-step-2 font-bold text-on-board">{card.title}</span>}
              <span className="font-mono text-[0.8125rem] font-semibold uppercase text-on-board-muted">
                <span aria-hidden="true">{regionTag(card.region)}</span>
                <span className="sr-only">{t("region", { region: regionLabel(card.region) })}</span>
              </span>
            </div>
          </article>
        </div>

        <div className="min-w-0 lg:col-span-3">
          <ul aria-label={t("valuesLabel", { name: info.short })} className="m-0 list-none border-t border-rule p-0">
            {card.values.slice(0, 8).map((v) => {
              const on = v.id === chosen?.id;
              return (
                <li key={v.id} className="border-b border-line">
                  <Link
                    href={`/product/${v.slug}`}
                    aria-current={on ? "true" : undefined}
                    onPointerEnter={() => setPick((p) => ({ ...p, [card.key]: v.id }))}
                    onFocus={() => setPick((p) => ({ ...p, [card.key]: v.id }))}
                    className={cn("gift-value", on && "gift-value-on")}
                  >
                    <span className="pt-0.5 font-display text-ui-md font-bold text-ink">{v.label ? t("row", { value: v.label }) : card.title}</span>
                    <span className="price text-ui-md text-ink">{formatPrice(convert(v.price), currency)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-col items-start">
            {card.topUps > 0 ? <SignLink href={`/catalog/top-ups?platform=${card.platform}`}>{t("topUps", { name: info.short })}</SignLink> : null}
            <SignLink href="/catalog/gift-cards">{t("all")}</SignLink>
          </div>
        </div>
      </div>
    </section>
  );
}
