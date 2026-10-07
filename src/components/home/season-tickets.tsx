import { getTranslations } from "next-intl/server";
import { SubscriptionTimetable } from "@/components/catalog/Prepaid";
import type { Timetable } from "@/lib/catalog/prepaid";
import { SectionHeading, SignLink } from "./parts";

export async function SeasonTickets({ timetable }: { timetable: Timetable }) {
  if (timetable.rows.length === 0 || timetable.columns.length === 0) return null;
  const t = await getTranslations("home.season");
  return (
    <section id="season-tickets" aria-labelledby="season-title" data-home-section="season-tickets" className="home-season bg-surface">
      <div className="mx-auto grid max-w-container gap-x-6 gap-y-8 border-t border-line px-gutter lg:grid-cols-12">
        <div className="min-w-0 pt-16 lg:col-span-4">
          <SectionHeading id="season-title" title={t("title")} lead={t("lead")} />
          <SignLink href="/catalog/subscriptions" className="mt-4">
            {t("all")}
          </SignLink>
        </div>
        <div className="min-w-0 lg:col-span-8 lg:pt-16">
          <SubscriptionTimetable table={timetable} caption={t("caption")} />
        </div>
      </div>
    </section>
  );
}
