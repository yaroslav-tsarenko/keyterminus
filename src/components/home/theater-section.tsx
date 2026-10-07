import { getTranslations } from "next-intl/server";
import { TheaterTabs } from "@/components/theater/tabs";
import { TheaterSync } from "@/components/theater/sync";
import { SectionHeading, SignLink } from "./parts";

export async function TheaterSection() {
  const t = await getTranslations("home.theater");
  return (
    <section id="how-it-works" aria-labelledby="theater-title" data-home-section="theater" className="home-theater bg-surface">
      <div className="mx-auto max-w-wide px-gutter">
        <TheaterSync>
          <TheaterTabs
            header={<SectionHeading id="theater-title" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />}
            footer={
              <SignLink href="/how-activation-works" className="mt-4">
                {t("link")}
              </SignLink>
            }
          />
        </TheaterSync>
      </div>
    </section>
  );
}
