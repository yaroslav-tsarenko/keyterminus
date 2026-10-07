"use client";

import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Check, SquareChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Checkbox, Switch } from "@/components/ui/Choice";
import { Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Dialog";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { FilterChip, FilterChipRow } from "@/components/ui/Chip";
import { FARE_ZONES } from "@/config/merchandising";
import { toggleValue, type CatalogFacets, type FacetOption, type ListFilter } from "@/components/catalog/catalog-url";

export interface FilterSelection {
  brand: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  onSale: boolean;
  types: string[];
  platforms: string[];
  regions: string[];
  genres: string[];
  languages: string[];
  years: string[];
}

export function FilterGroup({ title, selectedCount = 0, defaultOpen = false, children }: { title: string; selectedCount?: number; defaultOpen?: boolean; children: ReactNode }) {
  const t = useTranslations("catalog");
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div data-open={open || undefined} data-filter-group="" className="border-b border-line">
      <h3 className="m-0 font-sans font-normal tracking-normal">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-trigger`}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "relative flex h-12 w-full cursor-pointer items-center gap-3 text-left text-ink",
            "after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:bg-brand after:transition-opacity after:duration-[120ms]",
            selectedCount > 0 ? "after:opacity-100" : "after:opacity-0",
          )}
        >
          <span className="label-caps flex-1 pt-0.5 text-ink">{title}</span>
          {selectedCount > 0 ? (
            <span className="font-mono text-data-sm text-ink" aria-label={t("selectedCount", { count: selectedCount })}>
              {selectedCount}
            </span>
          ) : null}
          <SquareChevronDown size={18} aria-hidden="true" className={cn("text-ink-muted transition-transform duration-[180ms] ease-[var(--ease-sign)]", open && "rotate-180")} />
        </button>
      </h3>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} inert={!open} className={cn("grid transition-[grid-template-rows] duration-[180ms] ease-[var(--ease-sign)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="relative min-h-0 overflow-hidden">
          <div className="pb-5 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function useDisplayPrice() {
  const { currency, rates } = useCurrency();
  const rate = rates[currency] || 1;
  const symbol = new Intl.NumberFormat("en-GB", { style: "currency", currency }).formatToParts(0).find((p) => p.type === "currency")?.value ?? "";
  const format = (n: number, digits = 0) => new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  return {
    currency,
    rate,
    symbol,
    format,
    toDisplay: (base: number) => round2(base * rate),
    toBase: (display: number) => round2(display / rate),
  };
}

export function fareZoneLabel(zone: { min: number | null; max: number | null }, format: (n: number) => string) {
  if (zone.min === null && zone.max !== null) return `Under ${format(zone.max)}`;
  if (zone.max === null && zone.min !== null) return `${format(zone.min)} and up`;
  return `${format(zone.min ?? 0)}–${format(zone.max ?? 0)}`;
}

function PriceGroup({
  bounds,
  minPrice,
  maxPrice,
  onChange,
}: {
  bounds: { min: number; max: number } | null;
  minPrice: number | null;
  maxPrice: number | null;
  onChange: (next: { minPrice: number | null; maxPrice: number | null }) => void;
}) {
  const t = useTranslations("catalog");
  const { rate, symbol, format, toDisplay, toBase } = useDisplayPrice();
  const signature = `${minPrice}|${maxPrice}|${rate}`;
  const fromBase = (v: number | null) => (v === null ? "" : String(toDisplay(v)));
  const [draft, setDraft] = useState({ signature, min: fromBase(minPrice), max: fromBase(maxPrice) });
  if (draft.signature !== signature) setDraft({ signature, min: fromBase(minPrice), max: fromBase(maxPrice) });

  const parse = (s: string) => (s.trim() === "" || !Number.isFinite(Number(s)) ? null : toBase(Number(s)));
  const commit = (min: string, max: string) => {
    const nextMin = parse(min);
    const nextMax = parse(max);
    if (nextMin === minPrice && nextMax === maxPrice) return;
    onChange({ minPrice: nextMin, maxPrice: nextMax });
  };

  const lo = bounds ? Math.floor(bounds.min * rate) : 0;
  const hi = bounds ? Math.ceil(bounds.max * rate) : 0;
  const zones = FARE_ZONES.filter((z) => !bounds || ((z.max === null || z.max > lo) && (z.min === null || z.min < hi)));
  const zoneBase = (z: { min: number | null; max: number | null }) => ({ minPrice: z.min === null ? null : toBase(z.min), maxPrice: z.max === null ? null : toBase(z.max) });

  return (
    <>
      {zones.length > 1 ? (
        <ul className="m-0 mb-4 flex list-none flex-wrap gap-1.5 p-0" aria-label="Price ranges">
          {zones.map((z) => {
            const target = zoneBase(z);
            const on = target.minPrice === minPrice && target.maxPrice === maxPrice;
            return (
              <li key={z.key}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(on ? { minPrice: null, maxPrice: null } : target)}
                  className={cn(
                    "inline-flex h-8 cursor-pointer items-center rounded-sign border px-2.5 font-mono text-[0.8125rem] transition-colors duration-[120ms]",
                    on ? "border-ink bg-ink text-surface" : "border-control bg-raised text-ink hover-device:hover:border-ink",
                  )}
                >
                  {fareZoneLabel(z, (n) => format(n))}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          commit(draft.min, draft.max);
        }}
      >
        <Input label={t("min")} size="sm" mono inputMode="decimal" prefix={symbol} placeholder={bounds ? String(lo) : undefined} value={draft.min} onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value.replace(/[^0-9.]/g, "") }))} onBlur={() => commit(draft.min, draft.max)} />
        <Input label={t("max")} size="sm" mono inputMode="decimal" prefix={symbol} placeholder={bounds ? String(hi) : undefined} value={draft.max} onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value.replace(/[^0-9.]/g, "") }))} onBlur={() => commit(draft.min, draft.max)} />
        <button type="submit" className="sr-only">
          {t("applyPrice")}
        </button>
      </form>
    </>
  );
}

function YearRange({ options, selected, onChange }: { options: FacetOption[]; selected: string[]; onChange: (years: string[]) => void }) {
  const years = options
    .map((o) => Number(o.key))
    .filter(Number.isFinite)
    .sort((a, b) => b - a);
  if (years.length < 2) return null;
  const newest = years[0];
  const oldest = years[years.length - 1];
  const chosen = selected.map(Number).filter(Number.isFinite);
  const from = chosen.length ? Math.min(...chosen) : oldest;
  const to = chosen.length ? Math.max(...chosen) : newest;
  const apply = (a: number, b: number) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (lo === oldest && hi === newest) onChange([]);
    else onChange(years.filter((y) => y >= lo && y <= hi).map(String));
  };
  const opts = years.map((y) => ({ value: String(y), label: String(y) }));
  return (
    <div className="grid grid-cols-2 gap-3">
      <Select label="From" size="sm" value={String(from)} options={opts} onChange={(e) => apply(Number(e.target.value), to)} className="font-mono" />
      <Select label="To" size="sm" value={String(to)} options={opts} onChange={(e) => apply(from, Number(e.target.value))} className="font-mono" />
    </div>
  );
}

function OptionRows({ filter, options, selected, onToggle }: { filter: ListFilter; options: FacetOption[]; selected: string[]; onToggle: (key: string) => void }) {
  return (
    <div>
      {options.map((option) => (
        <Checkbox
          key={option.key}
          dense
          label={
            filter === "platforms" ? (
              <span className="inline-flex items-center gap-2.5">
                <PlatformTile platform={option.key} size="xs" className="h-[22px]" />
                <span className="pt-px">{option.label}</span>
              </span>
            ) : (
              option.label
            )
          }
          count={option.count}
          checked={selected.includes(option.key)}
          disabled={option.count === 0 && !selected.includes(option.key)}
          onChange={() => onToggle(option.key)}
        />
      ))}
    </div>
  );
}

function SearchableRows({ filter, options, selected, onToggle, placeholder }: { filter: ListFilter; options: FacetOption[]; selected: string[]; onToggle: (key: string) => void; placeholder: string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  return (
    <div>
      {options.length > 10 ? <Input label={placeholder} labelHidden size="sm" placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} wrapperClassName="mb-2" /> : null}
      <div className="max-h-[320px] overflow-y-auto pr-1">
        <OptionRows filter={filter} options={visible} selected={selected} onToggle={onToggle} />
        {visible.length === 0 ? <p className="m-0 py-2 text-ui-sm text-ink-muted">Nothing matches “{query}”.</p> : null}
      </div>
    </div>
  );
}

function LanguageCombobox({ options, selected, onToggle }: { options: FacetOption[]; selected: string[]; onToggle: (key: string) => void }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const q = query.trim().toLowerCase();
  const visible = useMemo(() => (q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options), [options, q]);
  const listId = `${id}-list`;
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(visible.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && open && visible[active]) {
      e.preventDefault();
      onToggle(visible[active].key);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };
  return (
    <div className="relative">
      <label htmlFor={`${id}-input`} className="mb-1.5 block text-ui-sm text-ink-muted">
        Interface or audio language
      </label>
      <input
        id={`${id}-input`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && visible[active] ? `${id}-opt-${visible[active].key}` : undefined}
        value={query}
        placeholder="Find a language"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKey}
        className="block h-9 w-full rounded-control border border-control bg-raised px-3 text-ui-sm text-ink placeholder:text-ink-subtle hover-device:hover:border-ink-muted"
      />
      {open ? (
        <ul id={listId} role="listbox" aria-multiselectable="true" aria-label="Languages" className="absolute inset-x-0 top-full z-10 m-0 mt-1 max-h-[260px] list-none overflow-y-auto rounded-card bg-raised p-1 shadow-overlay">
          {visible.length === 0 ? <li className="px-3 py-2 text-ui-sm text-ink-muted">Nothing matches “{query}”.</li> : null}
          {visible.map((o, i) => {
            const isSelected = selected.includes(o.key);
            return (
              <li
                key={o.key}
                id={`${id}-opt-${o.key}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onToggle(o.key)}
                onPointerEnter={() => setActive(i)}
                className={cn("flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sign px-2.5 text-ui-sm text-ink", i === active && "bg-brand-soft")}
              >
                <span className={cn("grid size-[18px] shrink-0 place-items-center rounded-sign border-[1.5px]", isSelected ? "border-accent-edge bg-brand text-on-brand" : "border-control")}>{isSelected ? <Check size={12} aria-hidden="true" /> : null}</span>
                <span className="flex-1 pt-px">{o.label}</span>
                <span className="font-mono text-data-sm text-ink-muted">{o.count.toLocaleString("en-GB")}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
      {selected.length ? (
        <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
          {selected.map((key) => (
            <li key={key}>
              <FilterChip label={options.find((o) => o.key === key)?.label ?? key} onRemove={() => onToggle(key)} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export interface ProductFiltersProps {
  facets: CatalogFacets;
  selection: FilterSelection;
  onChange: (next: Partial<FilterSelection>) => void;
  hide?: ListFilter[];
  lockOnSale?: boolean;
  className?: string;
}

export function ProductFilters({ facets, selection, onChange, hide = [], lockOnSale = false, className }: ProductFiltersProps) {
  const t = useTranslations("catalog");
  const priceCount = selection.minPrice !== null || selection.maxPrice !== null ? 1 : 0;
  const list = (filter: ListFilter) => facets[filter].filter((o) => o.count > 0 || o.selected);
  const toggle = (filter: ListFilter) => (key: string) => onChange({ [filter]: toggleValue(selection[filter], key) } as Partial<FilterSelection>);
  const show = (filter: ListFilter) => !hide.includes(filter) && (list(filter).length > 1 || selection[filter].length > 0);

  return (
    <div className={cn("border-t border-rule", className)} data-information-panel="">
      {show("platforms") ? (
        <FilterGroup title="Platform" selectedCount={selection.platforms.length} defaultOpen>
          <OptionRows filter="platforms" options={list("platforms")} selected={selection.platforms} onToggle={toggle("platforms")} />
        </FilterGroup>
      ) : null}
      {show("types") ? (
        <FilterGroup title="Type" selectedCount={selection.types.length} defaultOpen>
          <OptionRows filter="types" options={list("types")} selected={selection.types} onToggle={toggle("types")} />
        </FilterGroup>
      ) : null}
      {facets.price ? (
        <FilterGroup title={t("groupPrice")} selectedCount={priceCount} defaultOpen>
          <PriceGroup bounds={facets.price} minPrice={selection.minPrice} maxPrice={selection.maxPrice} onChange={onChange} />
        </FilterGroup>
      ) : null}
      {show("regions") ? (
        <FilterGroup title="Region" selectedCount={selection.regions.length} defaultOpen={selection.regions.length > 0}>
          <OptionRows filter="regions" options={list("regions")} selected={selection.regions} onToggle={toggle("regions")} />
          <p className="m-0 mt-2 text-ui-sm text-ink-muted">A region-locked key activates only on accounts set to that region.</p>
        </FilterGroup>
      ) : null}
      {show("genres") ? (
        <FilterGroup title="Genre" selectedCount={selection.genres.length} defaultOpen={selection.genres.length > 0}>
          <SearchableRows filter="genres" options={list("genres")} selected={selection.genres} onToggle={toggle("genres")} placeholder="Find a genre" />
        </FilterGroup>
      ) : null}
      {show("languages") ? (
        <FilterGroup title="Language" selectedCount={selection.languages.length} defaultOpen={selection.languages.length > 0}>
          <LanguageCombobox options={list("languages")} selected={selection.languages} onToggle={toggle("languages")} />
        </FilterGroup>
      ) : null}
      {show("years") ? (
        <FilterGroup title="Release year" selectedCount={selection.years.length ? 1 : 0} defaultOpen={selection.years.length > 0}>
          <YearRange options={list("years")} selected={selection.years} onChange={(years) => onChange({ years })} />
        </FilterGroup>
      ) : null}
      {!lockOnSale && (facets.onSaleCount > 0 || selection.onSale) ? (
        <FilterGroup title="On sale" selectedCount={selection.onSale ? 1 : 0} defaultOpen>
          <Switch checked={selection.onSale} onChange={(v) => onChange({ onSale: v })} label={t("reduced")} description={`${facets.onSaleCount.toLocaleString("en-GB")} ${facets.onSaleCount === 1 ? "key" : "keys"}`} className="py-1" />
        </FilterGroup>
      ) : null}
    </div>
  );
}

export interface SummaryChip {
  key: string;
  label: string;
  platform?: string | null;
  onRemove: () => void;
}

export function FilterSummary({ total, parts = [], chips = [], onClearAll, className }: { total: number; parts?: string[]; chips?: SummaryChip[]; onClearAll?: () => void; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <p className="m-0 text-ui-md text-ink" aria-live="polite">
        <span className="font-mono">{total.toLocaleString("en-GB")}</span> {total === 1 ? "key" : "keys"}
        {parts.map((part) => (
          <span key={part}>
            <span aria-hidden="true" className="px-1.5 text-ink-subtle">
              ·
            </span>
            {part}
          </span>
        ))}
      </p>
      {chips.length > 0 ? (
        <FilterChipRow onClearAll={onClearAll}>
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} platform={chip.platform} onRemove={chip.onRemove} />
          ))}
        </FilterChipRow>
      ) : null}
    </div>
  );
}

export function ProductFiltersSheet({ open, onClose, total, onClearAll, children }: { open: boolean; onClose: () => void; total: number; onClearAll: () => void; children: ReactNode }) {
  const t = useTranslations("catalog");
  const titleId = useId();
  return (
    <Sheet open={open} onClose={onClose} side="bottom" labelledBy={titleId}>
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pl-4 pr-2">
          <h2 id={titleId} className="m-0 text-step-2 font-bold leading-none">
            {t("filtersTitle")}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("closeFilters")} className="flex size-11 cursor-pointer items-center justify-center rounded-control text-ink hover-device:hover:bg-surface-1">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">{children}</div>
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line bg-raised px-4 py-3">
          <Button variant="ghost" onPress={onClearAll}>
            {t("clearAll")}
          </Button>
          <Button onPress={onClose} className="flex-1">
            {t("showProducts", { count: total })}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
