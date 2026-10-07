import { getTranslations } from "next-intl/server";
import { STORE_POLICY } from "@/config/store-policy";
import { BOARD_LEGEND } from "@/lib/catalog/remarks";
import { DeparturesBoard } from "./departures-board";
import type { HomeData } from "./types";

function syncLabel(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(d);
  if (Date.now() - d.getTime() < 48 * 3600 * 1000) return `${time} UTC`;
  return `${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(d)}, ${time} UTC`;
}

function listPlatforms(names: string[], more: string): string {
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} ${more}`;
  return `${names.join(", ")} ${more}`;
}

export async function DeparturesHero({ data }: { data: HomeData }) {
  const t = await getTranslations("home.departures");
  const live = data.live.toLocaleString("en-GB");
  const lead = [
    data.live > 0 && data.platforms.length > 0
      ? t("leadSearch", { live, platforms: listPlatforms(data.platforms.slice(0, 4).map((p) => p.name), t("andMore")) })
      : t("leadSearchEmpty"),
    STORE_POLICY.payment.hostedPage ? t("leadPayment") : null,
    t("leadDelivery"),
  ]
    .filter(Boolean)
    .join(" ");
  const synced = syncLabel(data.syncedAt);
  const facts = (
    <>
      {synced ? <span className="block">{t("updated", { time: synced })}</span> : null}
      {data.live > 0 ? <span className="block">{t("stock", { live, count: data.platformCount })}</span> : null}
    </>
  );

  return (
    <section id="departures" aria-labelledby="departures-title" data-scene="board" data-surface="board" data-home-section="departures" className="dep-hall">
      <div className="mx-auto max-w-container px-gutter">
        <div className="grid gap-x-6 gap-y-5 lg:grid-cols-12 lg:items-end">
          <div className="min-w-0 lg:col-span-9">
            <p className="eyebrow m-0 text-on-board-muted">{t("eyebrow")}</p>
            <h1 id="departures-title" className="m-0 mt-4 max-w-[13em] text-display font-black leading-[0.94] tracking-[-0.03em] text-on-board">
              {t("title")}
            </h1>
            <p className="m-0 mt-5 max-w-[56ch] text-step-1 leading-[1.5] text-on-board-muted">{lead}</p>
          </div>
          <p className="m-0 hidden font-mono text-data-sm leading-[1.6] text-on-board-muted lg:col-span-3 lg:block lg:pb-1.5 lg:text-right">{facts}</p>
        </div>
        <div className="mt-7 lg:mt-8">
          <DeparturesBoard pages={data.board} live={data.live} legend={BOARD_LEGEND} />
        </div>
        <p className="m-0 mt-6 font-mono text-data-sm leading-[1.6] text-on-board-muted lg:hidden">{facts}</p>
      </div>
    </section>
  );
}
