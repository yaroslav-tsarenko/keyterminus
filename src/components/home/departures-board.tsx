"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pause, Play, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { FlipRow } from "@/components/motion/FlipRow";
import { productFace, type CatalogProduct } from "@/components/product/product-face";
import { remarkLabel, remarkText } from "@/components/ui/Remark";
import { useCurrency } from "@/providers/CurrencyProvider";
import { boardPrice, boardTitle } from "@/lib/catalog/board-text";
import { remarkFor } from "@/lib/catalog/remarks";
import { platformInfo } from "@/lib/catalog/platforms";
import { REDUCED_MOTION_QUERY } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils/cn";
import type { BoardRowView } from "./types";

const DepartureBoardGL = dynamic(() => import("@/components/motion/departure-board-gl"), { ssr: false });

const PAGE_MS = 7000;
const MAX_CYCLES = 3;

function fromProduct(p: CatalogProduct): BoardRowView {
  const face = productFace(p.name, p.key);
  const info = platformInfo(p.key?.platform);
  const amount = Number(p.price);
  const compare = p.comparePrice == null || p.comparePrice === "" ? null : Number(p.comparePrice);
  const remark = remarkFor({ price: amount, comparePrice: compare });
  return {
    id: p.id,
    href: `/product/${p.slug}`,
    title: face.title,
    boardTitle: boardTitle(face.title, 22),
    shortTitle: boardTitle(face.title, 16),
    platformNumber: info.number ?? 0,
    platformLabel: info.boardLabel,
    platformKey: info.key,
    platformName: info.short,
    platformShort: info.shortLabel,
    price: boardPrice(amount, "EUR"),
    amount,
    remark: remarkText(remark.kind, remark.percent),
    remarkLabel: remarkLabel(remark.kind, remark.percent),
  };
}

function emptyRows(query: string, a: string, b: string): BoardRowView[] {
  const href = `/search?q=${encodeURIComponent(query)}`;
  return [a, b].map((text, i) => ({
    id: `none-${i}`,
    href,
    title: text,
    boardTitle: boardTitle(text, 22),
    shortTitle: boardTitle(text, 16),
    platformNumber: 0,
    platformLabel: "",
    platformKey: "other",
    platformName: "",
    platformShort: "",
    price: "",
    amount: Number.NaN,
    remark: null,
    remarkLabel: "",
  }));
}

function BoardRow({ row, index, priced }: { row: BoardRowView; index: number; priced: string }) {
  const empty = Number.isNaN(row.amount);
  return (
    <tr data-board-row="" role="row">
      <td data-board-cell="price" role="cell">
        <FlipRow text={priced} cells={7} align="right" size="sm" row={index} label={empty ? "" : priced} />
      </td>
      <th data-board-cell="title" role="rowheader" scope="row">
        <Link href={row.href} className="dep-link">
          <FlipRow text={row.boardTitle} cells={22} size="sm" row={index} label={row.title} className="dep-v-wide" />
          <FlipRow text={row.shortTitle} cells={16} size="sm" row={index} label={row.title} className="dep-v-narrow" />
        </Link>
      </th>
      <td data-board-cell="platform" role="cell">
        <FlipRow text={row.platformLabel} cells={11} size="sm" row={index} label={row.platformName} className="dep-v-long" />
        <FlipRow text={row.platformShort} cells={8} size="sm" row={index} label={row.platformName} className="dep-v-short" />
      </td>
      <td data-board-cell="remark" role="cell">
        <FlipRow text={row.remark ?? ""} cells={9} tone="remark" size="sm" row={index} label={row.remarkLabel} />
      </td>
    </tr>
  );
}

export function DeparturesBoard({ pages, live, legend }: { pages: BoardRowView[][]; live: number; legend: string }) {
  const t = useTranslations("home.departures");
  const router = useRouter();
  const { currency, convert } = useCurrency();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [query, setQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [results, setResults] = useState<{ q: string; rows: BoardRowView[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const trimmed = query.trim();
  const searching = trimmed.length >= 2;
  const count = pages.length;

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const onMq = () => setReduced(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const onVis = () => setHidden(document.visibilityState === "hidden");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    const requested = Number(new URLSearchParams(window.location.search).get("page"));
    const frame = Number.isFinite(requested) && requested >= 1 && requested <= count
      ? window.requestAnimationFrame(() => {
          setPage(requested - 1);
          setUserPaused(true);
        })
      : 0;
    const el = rootRef.current;
    const io = el ? new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), { threshold: 0.15 }) : null;
    if (el) io?.observe(el);
    return () => {
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [count]);

  const stopped = userPaused || cycles >= MAX_CYCLES;
  const paused = userPaused || held || searchFocus || !inView || hidden || reduced || cycles >= MAX_CYCLES || searching || count < 2;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setPage((p) => {
        const next = (p + 1) % count;
        if (next === 0) setCycles((c) => c + 1);
        return next;
      });
    }, PAGE_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  useEffect(() => {
    if (!searching) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setBusy(true);
      fetch(`/api/products?search=${encodeURIComponent(trimmed)}&pageSize=6&inStock=true`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data: { data?: CatalogProduct[] }) => setResults({ q: trimmed, rows: (data.data ?? []).slice(0, 6).map(fromProduct) }))
        .catch(() => {})
        .finally(() => setBusy(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmed, searching]);

  const price = useCallback((amount: number) => (Number.isNaN(amount) ? "" : boardPrice(convert(amount), currency)), [convert, currency]);

  const mode: "pages" | "search" = searching && results ? "search" : "pages";
  const noMatch = mode === "search" && results!.rows.length === 0;
  const noMatchA = t("noMatchA");
  const noMatchB = t("noMatchB");
  const rows = useMemo(() => (mode === "search" && results ? (results.rows.length === 0 ? emptyRows(results.q, noMatchA, noMatchB) : results.rows) : (pages[page] ?? [])), [mode, results, pages, page, noMatchA, noMatchB]);
  const glPages = useMemo(() => {
    const priced = (list: BoardRowView[]) => list.map((r) => ({ ...r, price: price(r.amount) }));
    return mode === "search" ? [priced(rows)] : pages.map(priced);
  }, [mode, rows, pages, price]);

  const readout = mode === "search" ? (noMatch ? t("noResults", { query: results!.q }) : t("results", { query: results!.q })) : count > 0 ? t("page", { page: page + 1, pages: count }) : "";

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("keyterminus:board", { detail: { page, paused, mode, query: mode === "search" ? results?.q ?? "" : "" } }));
  }, [page, paused, mode, results]);

  const next = () => {
    if (mode === "search") return;
    setPage((p) => (p + 1) % count);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="dep-grid">
      <form role="search" onSubmit={submit} className="dep-kiosk">
        <label htmlFor={inputId} className="sr-only">
          {t("searchLabel")}
        </label>
        <div className="relative min-w-0 flex-1">
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink" />
          <input
            id={inputId}
            name="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                setQuery("");
              }
            }}
            placeholder={live > 0 ? t("searchPlaceholder", { live: live.toLocaleString("en-GB") }) : t("searchPlaceholderEmpty")}
            autoComplete="off"
            enterKeyHint="search"
            aria-describedby={`${inputId}-readout`}
            className="h-14 w-full rounded-control border border-control bg-raised pl-12 pr-4 text-[1.0625rem] text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
        <Button type="submit" size="lg" className="h-14 shrink-0 max-sm:px-4" arrow>
          {t("searchSubmit")}
        </Button>
      </form>

      <div className="dep-controls" role="group" aria-label={t("controls")}>
        <Button
          variant="outline"
          size="sm"
          onPress={() => {
            if (stopped) {
              setUserPaused(false);
              setCycles(0);
            } else setUserPaused(true);
          }}
          aria-pressed={stopped}
          isDisabled={mode === "search"}
          className={cn("motion-reduce:hidden", (count < 2 || mode === "search") && "hidden")}
          startContent={stopped ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        >
          {stopped ? t("play") : t("pause")}
        </Button>
        <p id={`${inputId}-readout`} aria-live="polite" className="m-0 min-w-0 flex-1 truncate font-mono text-data text-on-board-muted">
          {readout}
        </p>
        {mode === "search" ? (
          <Link href={`/search?q=${encodeURIComponent(results!.q)}`} className="btn-text inline-flex min-h-9 shrink-0 items-center text-ui-sm font-semibold text-on-board">
            <span data-label="">{t("allResults")}</span>
          </Link>
        ) : count > 1 ? (
          <Button variant="outline" size="sm" onPress={next} className="shrink-0">
            {t("next")}
          </Button>
        ) : null}
      </div>

      <div
        ref={rootRef}
        data-board-root=""
        data-board-page={page}
        data-board-paused={paused ? "" : undefined}
        data-board-mode={mode}
        data-depth="D1"
        className="dep-board"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHeld(true);
        }}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
        }}
      >
        <table data-board-dom="" role="table" className="dep-table" aria-busy={(busy && searching) || undefined}>
          <caption className="sr-only">{t("caption")}</caption>
          <thead>
            <tr role="row">
              <th scope="col" role="columnheader" data-board-head="price">
                {t("headPrice")}
              </th>
              <th scope="col" role="columnheader" data-board-head="title">
                {t("headDestination")}
              </th>
              <th scope="col" role="columnheader" data-board-head="platform">
                {t("headPlatform")}
              </th>
              <th scope="col" role="columnheader" data-board-head="remark">
                {t("headRemarks")}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, i) => {
              const row = rows[i];
              if (!row) {
                return (
                  <tr key={`blank-${i}`} data-board-row="" data-blank="" role="row">
                    <td data-board-cell="price" role="cell">
                      <FlipRow text="" cells={7} size="sm" label="" />
                    </td>
                    <td data-board-cell="title" role="cell">
                      <FlipRow text="" cells={22} size="sm" label="" className="dep-v-wide" />
                      <FlipRow text="" cells={16} size="sm" label="" className="dep-v-narrow" />
                    </td>
                    <td data-board-cell="platform" role="cell">
                      <FlipRow text="" cells={11} size="sm" label="" className="dep-v-long" />
                      <FlipRow text="" cells={8} size="sm" label="" className="dep-v-short" />
                    </td>
                    <td data-board-cell="remark" role="cell">
                      <FlipRow text="" cells={9} tone="remark" size="sm" label="" />
                    </td>
                  </tr>
                );
              }
              return <BoardRow key={i} row={row} index={i} priced={price(row.amount)} />;
            })}
          </tbody>
        </table>
        <div data-board-gl="" aria-hidden="true" className="dep-gl">
          <DepartureBoardGL pages={glPages} activeQuery={mode === "search" ? results?.q : undefined} />
        </div>
      </div>

      <p className="dep-legend m-0">{legend}</p>
    </div>
  );
}
