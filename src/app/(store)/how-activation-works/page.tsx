import type { Metadata } from "next";
import Link from "next/link";
import { ArrowBigRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { buttonClasses } from "@/components/ui/button-classes";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { FeatureSpotlight } from "@/components/theater/spotlight";
import { ActivationStepList, RedeemLink } from "@/components/product/ActivationSteps";
import { ACTIVATION, ACTIVATION_ORDER, COMMON_PROBLEMS } from "@/config/activation";
import { PLATFORM_ORDER, orderIndex } from "@/config/merchandising";
import { STORE_POLICY } from "@/config/store-policy";
import { platformInfo } from "@/lib/catalog/platforms";
import { prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "How activation works",
    description: "Your key is delivered to your account after payment is confirmed. Redeem it on the platform named on the product page: steps for Steam, Xbox, PlayStation, Nintendo, Epic Games, GOG, EA app, Ubisoft Connect and Battle.net.",
    path: "/how-activation-works",
  });
}

const g = STORE_POLICY.guarantee;

export default async function HowActivationWorksPage() {
  const stocked = await prisma.keyItem
    .groupBy({ by: ["platform"], where: { product: { status: "ACTIVE", quantity: { gt: 0 } } }, _count: { _all: true } })
    .then((rows) => new Set(rows.map((r) => r.platform)))
    .catch(() => new Set<string>());
  const platforms = [...ACTIVATION_ORDER]
    .filter((key) => !["gog", "battle-net", "rockstar"].includes(key) || stocked.has(key))
    .sort((a, b) => orderIndex(PLATFORM_ORDER, a) - orderIndex(PLATFORM_ORDER, b))
    .map((key) => ({ guide: ACTIVATION[key], info: platformInfo(key) }));

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-container px-gutter">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How activation works" }]} />

        <section aria-labelledby="haw-title" data-anim="sign" className="pb-14 pt-6 lg:pb-20">
          <p className="eyebrow m-0 mb-4">Arrivals</p>
          <h1 id="haw-title" className="m-0 max-w-[16ch] text-step-5 leading-none tracking-[-0.02em] text-ink">
            How activation works
          </h1>
          <p className="measure m-0 mt-5 text-step-1 leading-[1.5] text-ink-muted">Your key is delivered to your account after payment is confirmed. You redeem it on the platform named on the product page.</p>
          <nav aria-label="Jump to a platform" className="mt-10">
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
              {platforms.map(({ guide, info }) => (
                <li key={guide.platform}>
                  <a href={`#${info.slug}`} className="group/pl flex flex-col items-start gap-2">
                    <PlatformTile number={info.number} size="md" />
                    <span className="text-ui-md font-bold text-ink decoration-link decoration-2 underline-offset-[3px] group-hover/pl:underline">{info.short}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </div>

      <section aria-labelledby="payment-to-key" className="border-y border-line bg-surface-1">
        <div className="mx-auto max-w-container px-gutter py-16 lg:py-24">
          <FeatureSpotlight scene="decrypt" headingId="payment-to-key" title="From payment to your board" description={<p className="m-0">{STORE_POLICY.delivery.emailNote}</p>} />
        </div>
      </section>

      <div className="mx-auto max-w-container px-gutter">
        {platforms.map(({ guide, info }) => (
          <section key={guide.platform} id={info.slug} aria-labelledby={`${info.slug}-title`} className="grid scroll-mt-28 gap-x-10 gap-y-6 border-b border-line py-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id={`${info.slug}-title`} className="m-0 flex items-center gap-4 text-step-3 leading-[1.06] text-ink">
                <PlatformTile number={info.number} size="md" />
                <span className="pt-1">{guide.name}</span>
              </h2>
              <p className="m-0 mt-5 text-ui-md text-ink">
                <span className="label-caps mr-2 text-ink-muted">You need</span>
                {guide.need}
              </p>
              {guide.codeFormat ? <p className="m-0 mt-2 text-ui-md text-ink-muted">{guide.codeFormat}</p> : null}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <RedeemLink guide={guide} />
                <Link href={`/platform/${info.slug}`} className="btn-text inline-flex min-h-10 items-center gap-1.5 text-ui-sm font-semibold text-ink">
                  <span data-label="">{info.short} keys</span>
                  <ArrowBigRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="measure lg:col-span-7 lg:col-start-6">
              <ActivationStepList guide={guide} />
            </div>
          </section>
        ))}

        <section aria-labelledby="not-working" className="grid gap-x-10 gap-y-6 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            <h2 id="not-working" data-anim="sign" className="m-0 text-step-3 leading-[1.06] text-ink">
              If a key doesn’t work
            </h2>
            <p className="m-0 mt-3 text-ui-md text-ink-muted">
              {g.headline}. We reply {STORE_POLICY.support.replyTime}.
            </p>
          </div>
          <div className="measure lg:col-span-7 lg:col-start-6">
            <p className="label-caps m-0 mb-2 text-ink-muted">Common problems</p>
            <dl className="m-0 border-t border-rule">
              {COMMON_PROBLEMS.map((p) => (
                <div key={p.title} className="border-b border-line py-4">
                  <dt className="text-ui-md font-bold text-ink">{p.title}</dt>
                  <dd className="m-0 mt-1 text-ui-md text-ink-muted">{p.body}</dd>
                </div>
              ))}
              <div className="border-b border-line py-4">
                <dt className="text-ui-md font-bold text-ink">How to report it</dt>
                <dd className="m-0 mt-1 text-ui-md text-ink-muted">
                  Open the key in Account → Keys and choose “Key not working? Report it” within {g.claimDays} days of delivery. We check it within {g.reviewDays} business days and send a replacement key, or refund it if no replacement is available.
                </dd>
              </div>
            </dl>
            <Link href="/catalog" className={buttonClasses({ size: "lg", className: "mt-10" })}>
              <span data-label="" className="pt-0.5">
                Browse the catalogue
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
