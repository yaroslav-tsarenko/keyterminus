import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RouteLine } from "@/components/ui/RouteLine";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { platformInfo } from "@/lib/catalog/platforms";
import { SectionHeading, SignLink, formatCount } from "./parts";
import type { HomeRoute } from "./types";

export async function Routes({ routes }: { routes: HomeRoute[] }) {
  if (routes.length === 0) return null;
  const t = await getTranslations("home.routes");
  return (
    <section id="routes" aria-labelledby="routes-title" data-scene="routes" data-home-section="routes" className="home-routes bg-surface">
      <div className="mx-auto grid max-w-container gap-x-6 gap-y-10 px-gutter lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+32px)]">
            <SectionHeading id="routes-title" title={t("title")} lead={t("lead")} />
            <SignLink href="/catalog/games" className="mt-4">
              {t("all")}
            </SignLink>
          </div>
        </div>
        <ul className="routes-list m-0 min-w-0 list-none p-0 lg:col-span-9">
          {routes.map((r) => (
            <li key={r.key} className="route-row">
              <div className="route-row-name">
                <h3 className="m-0 text-step-2 font-extrabold leading-[1.1] text-ink">
                  <Link href={r.href} className="decoration-link decoration-2 underline-offset-[4px] hover-device:hover:underline">
                    {r.label}
                  </Link>
                </h3>
                <p className="m-0 mt-1 font-mono text-data-sm text-ink-muted">{t("count", { count: formatCount(r.count) })}</p>
              </div>
              <RouteLine
                data-route-line=""
                data-depth="D1"
                orientation="responsive"
                label={t("lineLabel", { genre: r.label, count: formatCount(r.count) })}
                className="route-row-line"
                stops={r.stops.map((s) => {
                  const info = platformInfo(s.platform);
                  return {
                    key: s.platform,
                    href: s.href,
                    leading: <PlatformTile number={info.number} size="sm" className="route-stop-tile" />,
                    label: info.short,
                    meta: formatCount(s.count),
                    srLabel: `, ${formatCount(s.count)} ${r.label} keys`,
                  };
                })}
                terminus={{ href: r.href, tone: "ink", label: t("terminus", { count: formatCount(r.count) }), srLabel: ` ${r.label} keys` }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
