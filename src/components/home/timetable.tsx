import Link from "next/link";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DepartureCard } from "@/components/product/ProductCard";
import { buttonClasses } from "@/components/ui/button-classes";
import { cn } from "@/lib/utils/cn";
import { formatCount } from "./parts";
import type { HomeLine } from "./types";

export async function Timetable({ lines }: { lines: HomeLine[] }) {
  if (lines.length === 0) return null;
  const t = await getTranslations("home.timetable");
  return (
    <section id="timetable" aria-labelledby="timetable-title" data-home-section="timetable" className="home-timetable bg-surface-1">
      <div className="mx-auto max-w-wide px-gutter">
        <h2 id="timetable-title" data-anim="sign" className="m-0 text-step-4 leading-[1.06] tracking-[-0.015em] text-ink">
          {t("title")}
        </h2>
        <div className="mt-10">
          {lines.map((line, li) => {
            const lead = li === 0;
            return (
              <div key={line.key} data-rail="" data-line={line.key} className={cn("rail grid gap-x-6 gap-y-5 lg:grid-cols-12", li > 0 && "mt-10 border-t border-line pt-10")}>
                <div className="rail-head min-w-0 lg:col-span-3">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="flap text-[1.75rem]" data-hinge="2">
                      <span className="flap-glyph">{line.letter}</span>
                    </span>
                    <h3 className="m-0 pt-1 text-step-2 font-extrabold leading-[1.1] text-ink">
                      <span className="sr-only">Line {line.letter}: </span>
                      {line.title}
                    </h3>
                  </div>
                  <p className="m-0 mt-3 max-w-[32ch] text-ui-md leading-[1.5] text-ink-muted">{line.rule}</p>
                  <Link href={line.href} className="btn-text mt-3 inline-flex min-h-11 items-center gap-2 text-ui-md font-semibold text-ink">
                    <span data-label="" className="pt-0.5">
                      {t("all", { count: formatCount(line.total) })}
                    </span>
                    <ArrowBigRight size={18} aria-hidden="true" />
                  </Link>
                  <div className="mt-4 hidden gap-2 lg:flex">
                    <button type="button" data-rail-prev="" aria-label={t("previous", { letter: line.letter })} className={buttonClasses({ variant: "outline", isIconOnly: true })}>
                      <ArrowBigLeft size={18} aria-hidden="true" />
                    </button>
                    <button type="button" data-rail-next="" aria-label={t("next", { letter: line.letter })} className={buttonClasses({ variant: "outline", isIconOnly: true })}>
                      <ArrowBigRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="min-w-0 lg:col-span-9">
                  <ul data-rail-track="" aria-label={t("railLabel", { letter: line.letter, title: line.title })} className={cn("rail-track no-scrollbar", lead ? "rail-track-lead" : "rail-track-std")}>
                    {line.products.map((p) => (
                      <li key={p.id} className="rail-item" data-depth="D2">
                        <DepartureCard product={p} headingLevel={4} sizes={lead ? "232px" : "200px"} priority={false} className="h-full" />
                      </li>
                    ))}
                  </ul>
                  <div data-rail-bar="" aria-hidden="true" className="rail-bar">
                    <span data-rail-thumb="" className="rail-thumb" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
