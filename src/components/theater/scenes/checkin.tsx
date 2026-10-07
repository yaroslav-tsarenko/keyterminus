"use client";

import { DepartureCard, GateLine, GateStrip, productFace } from "@/components/product/ProductCard";
import { BuyBox } from "@/components/product/BuyBox";
import { EditionSelector } from "@/components/product/EditionSelector";
import { BeforeYouBuy } from "@/components/product/BeforeYouBuy";
import { Cover } from "@/components/product/Cover";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { cn } from "@/lib/utils/cn";
import { platformInfo } from "@/lib/catalog/platforms";
import { defineScene } from "../define";
import { SampleCover } from "../sample-cover";
import type { SceneViewProps } from "../types";
import { SAMPLE_DELUXE, SAMPLE_PRODUCT, SAMPLE_REQUIREMENTS, SAMPLE_RESULTS, sampleEditions } from "./data";
import { DemoHeader, DemoPage, DemoScreen } from "./kit";
import { sceneMeta, THEATER_COPY } from "./meta";

type S = { q: string; results: boolean; open: boolean; edition: string; added: boolean; cart: number; cartFlip: number };

const copy = THEATER_COPY.scenes.checkin;
const meta = sceneMeta("checkin");

function Results({ phone }: { phone: boolean }) {
  return (
    <div className={cn(phone ? "p-4" : "px-6 py-5")}>
      <p className="m-0 mb-4 flex items-baseline gap-2 text-ui-md text-ink">
        <span className="font-bold">“{copy.query}”</span>
        <span className="font-mono text-data text-ink-muted">{copy.results}</span>
      </p>
      <div className={cn("grid", phone ? "grid-cols-2 gap-3" : "grid-cols-6 gap-4")}>
        {SAMPLE_RESULTS.slice(0, phone ? 4 : 6).map((p, i) => (
          <div key={p.id} className="th-rise relative" style={{ ["--i" as string]: i }}>
            <DepartureCard product={p} demo demoId={`card-${i + 1}`} demoCover={<SampleCover title={productFace(p.name, p.key).title} />} headingLevel={4} />
            <span aria-hidden="true" data-demo={`card-${i + 1}-gate`} className="pointer-events-none absolute inset-x-0 top-0 h-[30px] rounded-t-card" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Browse({ phone }: { phone: boolean }) {
  const platforms = (copy.browsePlatforms as readonly string[]).map((k) => platformInfo(k));
  return (
    <div className={cn(phone ? "p-4" : "px-6 py-6")}>
      <p className="eyebrow m-0 mb-3">{copy.browse}</p>
      <div className={cn("grid", phone ? "grid-cols-2 gap-2" : "grid-cols-3 gap-3")}>
        {platforms.map((p, i) => (
          <span key={p.slug} className={cn("sign-plate flex flex-col items-start justify-between gap-3 p-4", phone ? "min-h-[96px]" : i < 3 ? "min-h-[220px]" : "min-h-[150px]")}>
            <PlatformTile number={p.number} size={phone ? "sm" : i < 3 ? "lg" : "md"} />
            <span className="pt-1 font-display text-step-2 font-extrabold leading-[1.05] text-ink">{p.short}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Product({ s, phone }: { s: S; phone: boolean }) {
  const current = s.edition === "deluxe" ? SAMPLE_DELUXE : SAMPLE_PRODUCT;
  const face = productFace(current.name, current.key);
  return (
    <div className={cn("th-slide", phone ? "flex flex-col gap-5 p-4" : "grid grid-cols-[230px_minmax(0,1fr)_340px] gap-7 px-6 py-6")}>
      <div className={cn("overflow-hidden rounded-card border border-line", phone && "w-[44%]")}>
        <GateStrip face={face} size="md" />
        <Cover alt="" art={<SampleCover title={face.title} />} />
      </div>
      <div className="min-w-0">
        <GateLine face={face} size="md" edition />
        <p className="m-0 mt-3 font-display text-step-4 font-extrabold leading-[1.04] tracking-[-0.015em] text-ink">{face.title}</p>
        <p className="m-0 mt-2 text-ui-sm text-ink-muted">Fen Road Studio · Copperline Publishing · 2025</p>
        <EditionSelector options={sampleEditions(s.edition === "deluxe" ? "deluxe" : "standard")} demo className="mt-5" />
        <div data-demo="requirements" className="mt-5">
          <BeforeYouBuy rows={SAMPLE_REQUIREMENTS} headingId="demo-before-you-buy" />
        </div>
      </div>
      <BuyBox product={current} demo demoInCart={s.added} className="self-start" />
    </div>
  );
}

function View({ s, device, focus }: SceneViewProps<S>) {
  const phone = device === "phone";
  return (
    <DemoScreen>
      <DemoHeader device={device} query={s.q} placeholder={copy.searchPlaceholder} focused={focus === "search"} cart={s.cartFlip >= 0.5 ? s.cart : 0} />
      <DemoPage scroll="page" className={phone ? "overflow-y-auto" : ""}>
        {s.open ? <Product s={s} phone={phone} /> : s.results ? <Results phone={phone} /> : <Browse phone={phone} />}
      </DemoPage>
    </DemoScreen>
  );
}

export const checkin = defineScene<S>({
  id: "checkin",
  title: meta.title,
  summary: meta.summary,
  url: (s) => (s.open ? copy.pdpUrl : copy.url),
  remark: copy.remark,
  device: "desktop",
  initial: { q: "", results: false, open: false, edition: "standard", added: false, cart: 0, cartFlip: 0 },
  View,
  script: ({ caption, wait, type, set, highlight, click, tween }) => [
    caption(meta.captions[0]!),
    wait(400),
    type("search", copy.query, { key: "q" }),
    set({ results: true }),
    wait(500),
    caption(meta.captions[1]!),
    highlight("card-1-gate", copy.tipGate),
    click("card-1", { open: true }),
    caption(meta.captions[2]!),
    click("edition-deluxe", { edition: "deluxe" }),
    wait(400),
    highlight("requirements", copy.tipRequirements),
    caption(meta.captions[3]!),
    click("add", { added: true, cart: 1 }),
    tween("cartFlip", 1, 280),
    wait(1200),
  ],
});
