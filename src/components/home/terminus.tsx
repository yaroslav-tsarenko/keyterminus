import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SearchForm } from "@/components/search/SearchResults/SearchResults";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { SectionHeading } from "./parts";
import type { HomeData } from "./types";

export async function Terminus({ data }: { data: HomeData }) {
  const t = await getTranslations("home.terminus");
  const d = await getTranslations("home.departures");
  return (
    <section id="terminus" aria-labelledby="terminus-title" data-home-section="terminus" className="home-terminus bg-surface-2">
      <div className="mx-auto max-w-container px-gutter">
        <div aria-hidden="true" data-depth="D1" className="terminus-track">
          <span className="terminus-bar" />
        </div>
        <div className="grid gap-x-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <SectionHeading id="terminus-title" title={t("title")} lead={t("line")} size="large" className="[&_h2]:max-w-[16ch]" />
            <div className="mt-8 max-w-[680px] max-sm:[&_button]:px-4">
              <SearchForm query="" inputId="terminus-search" label={t("searchLabel")} placeholder={d("searchPlaceholder", { live: data.live.toLocaleString("en-GB") })} submit={d("searchSubmit")} />
            </div>
            {data.platforms.length ? (
              <nav aria-label={t("platformsLabel")} className="mt-8">
                <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-4 p-0">
                  {data.platforms.map((p) => (
                    <li key={p.key}>
                      <Link href={p.href} className="group/tile flex min-h-11 items-center gap-2.5">
                        <PlatformTile number={p.number} size="sm" />
                        <span className="pt-0.5 font-display text-ui-md font-bold text-ink decoration-link decoration-2 underline-offset-[3px] group-hover/tile:underline">{p.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
