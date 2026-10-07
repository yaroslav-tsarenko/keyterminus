"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import type { SortKey } from "@/components/catalog/catalog-url";

type LabelKey = "sortBoard" | "sortNewest" | "sortPriceAsc" | "sortPriceDesc" | "sortPopular" | "sortName" | "sortRelevance" | "sortRelease" | "sortDiscount";

const LABEL_KEY: Record<SortKey, LabelKey> = {
  board: "sortBoard",
  relevance: "sortRelevance",
  newest: "sortNewest",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
  popular: "sortPopular",
  "name-asc": "sortName",
  "release-desc": "sortRelease",
  discount: "sortDiscount",
};

export const CATALOG_SORTS: SortKey[] = ["board", "price-asc", "price-desc", "release-desc", "discount", "popular", "name-asc"];

interface ProductSortProps {
  value: string;
  onChange: (value: SortKey) => void;
  options?: SortKey[];
  className?: string;
}

export function ProductSort({ value, onChange, options = CATALOG_SORTS, className }: ProductSortProps) {
  const t = useTranslations("catalog");
  const hintId = useId();
  const [focused, setFocused] = useState(false);
  const showHint = focused && value === "board";
  return (
    <div className={cn("relative", className)}>
      <Select
        size="sm"
        inlineLabel={t("sort")}
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-describedby={value === "board" ? hintId : undefined}
        options={options.map((key) => ({ value: key, label: t(LABEL_KEY[key]) }))}
        className="min-w-[9.5rem] lg:min-w-[11.5rem]"
      />
      <span id={hintId} className={showHint ? "absolute right-0 top-full z-[5] mt-1.5 block whitespace-nowrap rounded-sign bg-raised px-2.5 py-1.5 text-ui-sm text-ink-muted shadow-overlay" : "sr-only"}>
        {t("sortBoardHint")}
      </span>
    </div>
  );
}
