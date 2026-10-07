"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { ACTIVATION } from "@/config/activation";
import { platformInfo } from "@/lib/catalog/platforms";
import { RedeemLink, RichStep } from "@/components/product/ActivationSteps";
import { MiniStill } from "@/components/theater/mini-still";
import { FlipRow } from "@/components/motion/FlipRow";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { SectionHeading, SignLink } from "./parts";

type Key = keyof typeof ACTIVATION;

export function Arrivals({ platforms }: { platforms: string[] }) {
  const t = useTranslations("home.arrivals");
  const keys = platforms.filter((p): p is Key => p in ACTIVATION);
  const [active, setActive] = useState<Key>(keys[0] ?? "steam");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (keys.length === 0) return null;
  const guide = ACTIVATION[active];
  const info = platformInfo(active);

  const move = (index: number) => {
    const next = (index + keys.length) % keys.length;
    setActive(keys[next]!);
    refs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") move(i + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(keys.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <section id="arrivals" aria-labelledby="arrivals-title" data-home-section="arrivals" className="home-arrivals bg-surface-1">
      <div className="mx-auto max-w-container px-gutter">
        <SectionHeading id="arrivals-title" title={t("title")} lead={t("lead")} className="lg:max-w-[50%]" />

        <div role="radiogroup" aria-label={t("choose")} className="arrival-tiles no-scrollbar">
          {keys.map((k, i) => {
            const p = platformInfo(k);
            const on = k === active;
            return (
              <button
                key={k}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(k)}
                onKeyDown={(e) => onKey(e, i)}
                data-selected={on || undefined}
                className="arrival-tile"
              >
                <PlatformTile number={p.number} size="md" />
                <span className="arrival-tile-name">{p.short}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8" aria-live="polite">
            <p key={`need-${active}`} className="arrival-fade m-0 text-step-1 leading-[1.4] text-ink">
              {t("need", { need: guide.need })}
            </p>
            <ol className="m-0 mt-6 grid list-none gap-6 p-0 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
              {guide.steps.map((step, i) => (
                <li key={`${active}-${i}`} className="border-t-[3px] border-stop pt-4">
                  <FlipRow text={String(i + 1)} size="md" label={t("step", { n: i + 1 })} />
                  <p className="arrival-fade m-0 mt-3 text-ui-md leading-[1.5] text-ink">
                    <RichStep text={step} />
                  </p>
                </li>
              ))}
            </ol>
            {guide.codeFormat ? <p className="m-0 mt-6 font-mono text-data text-ink-muted">{guide.codeFormat}</p> : null}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <RedeemLink guide={guide} />
              <SignLink href={`/how-activation-works#${info.slug}`}>{t("guide", { name: guide.name })}</SignLink>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-4">
            <MiniStill scene="arrive" state={{ platform: active }} device="phone" className="arrival-still" address={`${guide.name} app`} label={t("stillLabel", { name: guide.name })} />
          </div>
        </div>
      </div>
    </section>
  );
}
