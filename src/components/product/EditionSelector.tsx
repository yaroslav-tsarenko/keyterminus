"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format-price";
import { useCurrency } from "@/providers/CurrencyProvider";

export interface EditionOption {
  id: string;
  slug: string;
  name: string;
  adds: string | null;
  price: number;
  current: boolean;
}

const rowCls = "grid min-h-12 grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto] items-center gap-3 px-3 py-2 transition-colors duration-[120ms]";

export function EditionSelector({ options, className, demo = false }: { options: EditionOption[]; className?: string; demo?: boolean }) {
  const { currency, convert } = useCurrency();
  if (options.length < 2) return null;
  return (
    <div className={className} data-edition-timetable="">
      <p id="edition-label" className="sr-only">
        Edition
      </p>
      <div aria-hidden="true" className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto] gap-3 border-b border-rule px-3 pb-2">
        <span className="eyebrow">Edition</span>
        <span className="eyebrow">Adds</span>
        <span className="eyebrow text-right">Price</span>
      </div>
      <ul role="radiogroup" aria-labelledby="edition-label" className="m-0 list-none p-0">
        {options.map((option) => {
          const price = formatPrice(convert(option.price), currency);
          const cells = (
            <>
              <span className="min-w-0 truncate pt-0.5 text-ui-md font-semibold text-ink">{option.name}</span>
              <span className="min-w-0 truncate text-ui-sm text-ink-muted">{option.adds ?? "—"}</span>
              <span className="price shrink-0 text-right text-ui-md text-ink">{price}</span>
            </>
          );
          const current = option.current ? "bg-brand-soft shadow-[inset_3px_0_0_var(--color-accent)]" : "";
          return (
            <li key={option.id} className="border-b border-line">
              {demo ? (
                <span role="radio" aria-checked={option.current} data-demo={`edition-${option.id}`} className={cn(rowCls, current)}>
                  {cells}
                </span>
              ) : (
                <Link
                  href={`/product/${option.slug}`}
                  role="radio"
                  aria-checked={option.current}
                  aria-current={option.current ? "page" : undefined}
                  scroll={false}
                  className={cn(rowCls, current || "hover-device:hover:bg-surface-1")}
                >
                  {cells}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
