import { STORE_POLICY } from "@/config/store-policy";
import type { RemarkKind } from "@/components/ui/Remark";

export function dealPercent(price: number, comparePrice: number | null | undefined): number | null {
  if (comparePrice == null || !(comparePrice > price) || comparePrice <= 0) return null;
  const percent = Math.round(((comparePrice - price) / comparePrice) * 100);
  return percent >= STORE_POLICY.deals.minPercent ? percent : null;
}

export function remarkFor(input: { price: number; comparePrice?: number | null; isNew?: boolean; inStock?: boolean }): { kind: RemarkKind; percent: number | null } {
  if (input.inStock === false) return { kind: "not-in-stock", percent: null };
  const percent = dealPercent(input.price, input.comparePrice);
  if (percent) return { kind: "deal", percent };
  if (input.isNew) return { kind: "new", percent: null };
  return { kind: "on-time", percent: null };
}

export const BOARD_LEGEND = "ON TIME: in stock at its regular price · NEW: released in the last 8 weeks · NOW −%: price cut against our lowest price of the previous 30 days.";
