import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowBigRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { CredentialsSheet } from "@/components/layout/Credentials/CredentialsSheet";
import { buttonClasses } from "@/components/ui/button-classes";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { NAV_CATEGORIES } from "@/config/navigation";
import { PLATFORM_ORDER, orderIndex } from "@/config/merchandising";
import { BRAND } from "@/lib/brand";
import { POLICY_FACTS } from "@/lib/policy-facts";
import { pageMetadata } from "@/lib/seo/metadata";
import { stockedPlatformCounts } from "@/lib/catalog/live-stock";
import { platformInfo } from "@/lib/catalog/platforms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return pageMetadata({
    title: t("metaTitle", { brand: BRAND.name }),
    description: t("metaDescription", { brand: BRAND.name }),
    path: "/about",
    absoluteTitle: true,
  });
}

const NOT_SOLD_KEYS = ["resale", "cases", "accounts", "other"] as const;
const linkCls = "font-semibold text-ink underline decoration-link decoration-2 underline-offset-[3px] hover-device:hover:text-accent-ink";

export default async function AboutPage() {
  const t = await getTranslations("about");
  const f = POLICY_FACTS;
  const platforms = (await stockedPlatformCounts())
    .filter((p) => p.platform !== "other")
    .sort((a, b) => orderIndex(PLATFORM_ORDER, a.platform) - orderIndex(PLATFORM_ORDER, b.platform))
    .map((p) => platformInfo(p.platform));

  const rows = [
    { key: "pay", text: t("ordering.pay.body", { cardMethods: f.cardMethods }), href: "/policies/payment" },
    { key: "deliver", text: t("ordering.deliver.body", { usual: f.deliveryUsual }), href: "/policies/shipping" },
    { key: "redeem", text: t("ordering.redeem.body"), href: "/how-activation-works" },
  ] as const;

  return (
    <div data-page="about" className="mx-auto max-w-container px-gutter pb-24">
      <Breadcrumbs items={[{ label: t("breadcrumbHome"), href: "/" }, { label: t("breadcrumb") }]} />

      <section aria-labelledby="about-title" className="pb-16 pt-6 lg:pb-24">
        <p className="eyebrow m-0 mb-4">Information desk</p>
        <h1 id="about-title" data-anim="sign" className="m-0 max-w-[14ch] text-step-5 leading-none tracking-[-0.02em] text-ink">
          {t("hero.title", { brand: BRAND.name })}
        </h1>
        <p className="measure m-0 mt-6 text-step-1 leading-[1.5] text-ink-muted">{t("hero.lead")}</p>
      </section>

      <section aria-labelledby="range-title" className="grid gap-x-10 gap-y-8 border-t border-rule py-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="range-title" className="m-0 text-step-3 leading-[1.1] text-ink">
            {t("range.title")}
          </h2>
          <p className="m-0 mt-3 text-ui-md text-ink-muted">{t("range.body", { brand: BRAND.name, countries: f.marketCountries, currencies: f.currencies })}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          <div>
            <p className="label-caps m-0 mb-2 text-ink-muted">{t("range.types")}</p>
            <ul className="m-0 list-none border-t border-line p-0">
              {NAV_CATEGORIES.map((c) => (
                <li key={c.slug} className="border-b border-line">
                  <Link href={`/catalog/${c.slug}`} className="group/t flex min-h-11 items-center justify-between gap-3 text-ui-md font-bold text-ink">
                    <span className="pt-0.5 decoration-link decoration-2 underline-offset-[3px] group-hover/t:underline">{c.name}</span>
                    <ArrowBigRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-caps m-0 mb-2 text-ink-muted">{t("range.platforms")}</p>
            <ul className="m-0 list-none border-t border-line p-0">
              {platforms.map((p) => (
                <li key={p.key} className="border-b border-line">
                  <Link href={`/platform/${p.slug}`} className="group/p flex min-h-11 items-center gap-2.5 text-ui-md font-bold text-ink">
                    <PlatformTile number={p.number} size="xs" />
                    <span className="pt-0.5 decoration-link decoration-2 underline-offset-[3px] group-hover/p:underline">{p.short}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="ordering-title" className="grid gap-x-10 gap-y-8 border-t border-rule py-14 lg:grid-cols-12">
        <h2 id="ordering-title" className="m-0 text-step-3 leading-[1.1] text-ink lg:col-span-4">
          {t("ordering.title")}
        </h2>
        <ol className="m-0 list-none border-t border-line p-0 lg:col-span-7 lg:col-start-6">
          {rows.map((row, i) => (
            <li key={row.key} className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-4 border-b border-line py-5">
              <span aria-hidden="true" className="pt-0.5 font-mono text-data text-ink-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="label-caps m-0 text-ink">{t(`ordering.${row.key}.label`)}</p>
                <p className="m-0 mt-1.5 text-step-0 text-ink-muted">
                  {row.text}{" "}
                  <Link href={row.href} className={linkCls}>
                    {t(`ordering.${row.key}.link`)}
                  </Link>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="keeping-title" className="grid gap-x-10 gap-y-6 border-t border-rule py-14 lg:grid-cols-12">
        <h2 id="keeping-title" className="m-0 text-step-3 leading-[1.1] text-ink lg:col-span-4">
          {t("keeping.title")}
        </h2>
        <div className="measure lg:col-span-7 lg:col-start-6">
          <p className="m-0 text-step-0 text-ink">{t("keeping.body", { claimDays: f.guaranteeClaimDays, days: f.withdrawalDays })}</p>
          <p className="m-0 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-ui-md">
            <Link href="/#through-the-gate" className={linkCls}>
              {t("keeping.gate")}
            </Link>
            <Link href="/policies/returns" className={linkCls}>
              {t("keeping.refunds")}
            </Link>
          </p>
        </div>
      </section>

      <section aria-labelledby="not-sold-title" className="grid gap-x-10 gap-y-6 border-t border-rule py-14 lg:grid-cols-12">
        <h2 id="not-sold-title" className="m-0 text-step-3 leading-[1.1] text-ink lg:col-span-4">
          {t("notSold.title")}
        </h2>
        <ul className="m-0 list-none border-t border-line p-0 text-step-0 text-ink-muted lg:col-span-7 lg:col-start-6 [&>li]:border-b [&>li]:border-line [&>li]:py-3">
          {NOT_SOLD_KEYS.map((key) => (
            <li key={key}>{t(`notSold.items.${key}`, { brand: BRAND.name })}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="company-title" className="border-t border-rule pt-14">
        <h2 id="company-title" className="m-0 mb-6 text-step-3 leading-[1.1] text-ink">
          {t("company.title")}
        </h2>
        <CredentialsSheet />
        <div className="mt-10">
          <Link href="/catalog" className={buttonClasses({ size: "lg" })}>
            <span data-label="" className="pt-0.5">
              {t("browse")}
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
