import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { buttonClasses } from "@/components/ui/button-classes";
import { FAQ_VALUES, faqLinkTags } from "@/components/faq/faq-content";
import { COMPANY } from "@/lib/company";
import { STORE_POLICY } from "@/config/store-policy";
import { SectionHeading, SignLink } from "./parts";

const ITEMS = [
  ["delivery", "time"],
  ["activation", "region"],
  ["activation", "redeem"],
  ["problems", "notWorking"],
  ["payment", "safe"],
  ["problems", "cancel"],
] as const;

export async function InformationDesk() {
  const t = await getTranslations("home.desk");
  const faq = await getTranslations("faq");
  return (
    <section id="information-desk" aria-labelledby="desk-title" data-home-section="desk" className="home-desk bg-surface">
      <div className="mx-auto grid max-w-container gap-x-6 gap-y-10 border-t border-line px-gutter lg:grid-cols-12">
        <div className="min-w-0 pt-16 lg:col-span-7 lg:pt-24">
          <SectionHeading id="desk-title" title={t("title")} />
          <Accordion className="mt-8">
            {ITEMS.map(([group, key]) => (
              <AccordionItem key={`${group}-${key}`} id={`desk-${group}-${key}`} title={faq(`groups.${group}.items.${key}.q`)} headingLevel={3}>
                <div className="measure text-step-0 leading-[1.7] text-ink-muted [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:decoration-link [&_a]:decoration-2 [&_a]:underline-offset-[3px]">
                  {faq.rich(`groups.${group}.items.${key}.a`, { ...FAQ_VALUES, ...faqLinkTags })}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <aside aria-label={t("title")} className="min-w-0 lg:col-span-4 lg:col-start-9 lg:pt-24">
          <div className="border-l-[3px] border-stop pl-6 lg:mt-[4.5rem]">
            <p className="eyebrow m-0">{t("staffed")}</p>
            <p className="m-0 mt-3 text-step-1 leading-[1.4] text-ink">{t("hours", { hours: COMPANY.supportHours, replyTime: STORE_POLICY.support.replyTime })}</p>
            <Link href="/contact" className={buttonClasses({ variant: "outline", className: "mt-6" })}>
              <span data-label="" className="pt-0.5">
                {t("contact")}
              </span>
            </Link>
            <div className="mt-4 flex flex-col items-start">
              <SignLink href="/faq">{t("all")}</SignLink>
              <SignLink href="/how-activation-works">{t("activation")}</SignLink>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
