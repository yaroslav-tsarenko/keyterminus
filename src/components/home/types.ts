import type { CatalogProduct } from "@/components/product/product-face";
import type { Timetable } from "@/lib/catalog/prepaid";
import type { RemarkKind } from "@/components/ui/Remark";
import type { BoardRowLite } from "./board-types";

export interface BoardRowView extends BoardRowLite {
  amount: number;
  shortTitle: string;
  platformKey: string;
  platformName: string;
  platformShort: string;
  remarkLabel: string;
}

export interface PeekRow {
  id: string;
  href: string;
  title: string;
  boardTitle: string;
  amount: number;
  remark: { kind: RemarkKind; percent: number | null };
  cover: string;
}

export interface HomePlatform {
  key: string;
  slug: string;
  name: string;
  number: number | null;
  href: string;
  count: number;
  minPrice: number | null;
  peek: PeekRow[];
}

export interface HomeLine {
  key: "new" | "coop" | "console";
  letter: string;
  title: string;
  rule: string;
  href: string;
  total: number;
  products: CatalogProduct[];
}

export interface RouteStopData {
  platform: string;
  count: number;
  href: string;
}

export interface HomeRoute {
  key: string;
  label: string;
  href: string;
  count: number;
  stops: RouteStopData[];
}

export interface FareRow {
  id: string;
  href: string;
  title: string;
  boardTitle: string;
  platform: string;
  amount: number;
  was: number;
  percent: number;
  cover: string | null;
}

export interface HomeFares {
  total: number;
  feature: FareRow | null;
  rows: FareRow[];
}

export interface GiftCardValue {
  id: string;
  slug: string;
  value: number | null;
  currency: string | null;
  label: string | null;
  price: number;
}

export interface HomeGiftCard {
  key: string;
  platform: string;
  region: string;
  title: string;
  values: GiftCardValue[];
  topUps: number;
}

export interface HomeData {
  live: number;
  platformCount: number;
  syncedAt: string | null;
  board: BoardRowView[][];
  platforms: HomePlatform[];
  lines: HomeLine[];
  routes: HomeRoute[];
  fares: HomeFares;
  giftCards: HomeGiftCard[];
  timetable: Timetable;
  activationPlatforms: string[];
}
