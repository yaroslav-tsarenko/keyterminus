import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { EmptyBox } from "@/components/shared/EmptyState/EmptyState";
import { Button } from "@/components/ui/Button";
import { PlatformTile } from "@/components/ui/PlatformTile";

export function SearchForm({ query, label, placeholder, submit, inputId = "search-page-input" }: { query: string; label: string; placeholder: string; submit: string; inputId?: string }) {
  return (
    <form role="search" action="/search" method="get" className="flex items-stretch gap-2">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative min-w-0 flex-1">
        <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          id={inputId}
          name="q"
          type="search"
          defaultValue={query}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className="h-14 w-full rounded-control border border-control bg-raised pl-12 pr-4 text-[1.0625rem] text-ink placeholder:text-ink-subtle hover-device:hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
      <Button type="submit" size="lg" className="h-14" arrow>
        {submit}
      </Button>
    </form>
  );
}

export interface PlatformSignLink {
  key: string;
  name: string;
  href: string;
  count: number;
}

export async function SearchNoResults({ query, platforms }: { query: string; platforms: PlatformSignLink[] }) {
  const t = await getTranslations("catalog");
  return (
    <section aria-labelledby="no-results-title" className="grid gap-x-16 gap-y-10 py-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <EmptyBox />
        <h2 id="no-results-title" className="m-0 mt-5 text-step-2 font-bold leading-[1.15] text-ink">
          {query ? t("noResultsTitle", { query }) : t("emptyQueryTitle")}
        </h2>
        {query ? (
          <ul className="m-0 mt-5 flex list-none flex-col border-t border-line p-0 text-step-0 text-ink-muted">
            <li className="border-b border-line py-2.5">{t("tipSpelling")}</li>
            <li className="border-b border-line py-2.5">{t("tipBroader")}</li>
            <li className="border-b border-line py-2.5">Or start from a platform.</li>
          </ul>
        ) : (
          <p className="m-0 mt-4 text-step-0 text-ink-muted">{t("emptyQueryBody")}</p>
        )}
      </div>
      {platforms.length > 0 ? (
        <nav aria-labelledby="browse-title" className="lg:col-span-6 lg:col-start-7">
          <h2 id="browse-title" className="eyebrow m-0">
            {t("browseTitle")}
          </h2>
          <ul className="m-0 mt-4 grid list-none grid-cols-1 gap-x-8 border-t border-line p-0 sm:grid-cols-2">
            {platforms.map((p) => (
              <li key={p.href} className="border-b border-line">
                <Link href={p.href} className="group/pl flex min-h-14 items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <PlatformTile platform={p.key} size="sm" />
                    <span className="pt-0.5 text-step-0 font-bold text-ink decoration-link decoration-2 underline-offset-[3px] group-hover/pl:underline">{p.name}</span>
                  </span>
                  <span className="font-mono text-[0.8125rem] text-ink-muted">{p.count.toLocaleString("en-GB")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}
