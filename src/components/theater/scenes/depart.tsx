"use client";

import { KeyBoard } from "@/components/account/KeyBoard";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { STORE_POLICY } from "@/config/store-policy";
import { cn } from "@/lib/utils/cn";
import { defineScene } from "../define";
import type { SceneViewProps } from "../types";
import { SAMPLE_ORDER } from "./data";
import { AccountNav, DemoHeader } from "./kit";
import { sceneMeta, THEATER_COPY } from "./meta";

type S = { issue: number; status: string; masked: boolean; flip: number; copied: boolean };

const copy = THEATER_COPY.scenes.depart;
const meta = sceneMeta("depart");

function View({ s, device }: SceneViewProps<S>) {
  const phone = device === "phone";
  const issued = s.status === "issued";
  return (
    <div className="flex h-full flex-col bg-surface">
      <DemoHeader device={device} cart={0} />
      <div data-demo-scroll="page" className={cn("min-h-0 flex-1", phone ? "overflow-y-auto p-4" : "flex gap-8 overflow-hidden px-8 py-7")}>
        {phone ? null : <AccountNav />}
        <div className="min-w-0 flex-1">
          <p className="eyebrow m-0">{copy.label2}</p>
          <p className="m-0 mt-2 font-display text-step-4 font-extrabold leading-[1.04] tracking-[-0.015em] text-ink">{copy.heading}</p>
          <p className="m-0 mt-5 flex items-baseline justify-between border-b border-rule pb-2 font-mono text-data text-ink-muted">
            <span className="text-ink">{copy.order}</span>
            <span>6 Oct 2026</span>
          </p>
          <OrderTimeline status={issued ? "delivered" : "paid"} createdAt={SAMPLE_ORDER.createdAt} paidAt={SAMPLE_ORDER.paidAt} finishedAt={issued ? SAMPLE_ORDER.issuedAt : null} demo className="mt-5 max-w-[720px]" />
          <div data-demo="board" className="mt-6 max-w-[760px]">
            <KeyBoard
              keyId="sample"
              title={SAMPLE_ORDER.title}
              keyInfo={SAMPLE_ORDER.key}
              status={issued ? "ready" : "issuing"}
              issuedAt={issued ? SAMPLE_ORDER.issuedAt : null}
              demo
              demoValue={copy.key}
              demoState={{ masked: s.masked, decrypt: s.flip, copied: s.copied }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const encrypted = STORE_POLICY.security.keysEncryptedAtRest && !STORE_POLICY.security.keyInEmail;

export const depart = defineScene<S>({
  id: "depart",
  title: meta.title,
  summary: meta.summary,
  url: copy.url,
  remark: (s) => (s.status === "issued" ? copy.remark : THEATER_COPY.scenes.pay.remark),
  device: "desktop",
  initial: { issue: 0, status: "paid", masked: true, flip: 0, copied: false },
  end: { flip: 1, copied: false },
  View,
  script: ({ caption, tween, set, highlight, click, wait }) => [
    caption(meta.captions[0]!),
    tween("issue", 1, 1400),
    set({ status: "issued" }),
    caption(meta.captions[1]!),
    highlight("board", encrypted ? copy.tipBoard : copy.tipBoardPlain),
    click("reveal", { masked: false }),
    tween("flip", 1, 1100, { ease: "linear" }),
    caption(meta.captions[2]!),
    click("copy", { copied: true }),
    wait(900),
    highlight("redeem", copy.tipRedeem),
    wait(800),
  ],
});
