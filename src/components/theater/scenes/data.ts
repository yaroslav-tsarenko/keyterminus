import type { CatalogProduct } from "@/components/product/product-face";
import type { EditionOption } from "@/components/product/EditionSelector";
import type { RequirementRow } from "@/components/product/BeforeYouBuy";
import type { KeySummary } from "@/lib/keys/taxonomy";

function key(title: string, platform: string, region: string, productType = "game", extra: Partial<KeySummary> = {}): KeySummary {
  return { title, productType, platform, region, edition: null, languages: ["English", "German", "French", "Spanish", "Polish"], genres: [], releaseYear: 2025, validity: null, ...extra };
}

function product(id: string, title: string, price: number, k: KeySummary, comparePrice: number | null = null): CatalogProduct {
  return { id: `sample-${id}`, name: title, slug: `sample-${id}`, price, comparePrice, quantity: 9, images: [], key: k };
}

export const SAMPLE_RESULTS: CatalogProduct[] = [
  product("copperline-express", "Copperline Express", 22.49, key("Copperline Express", "steam", "global")),
  product("copperline-express-deluxe", "Copperline Express", 31.99, key("Copperline Express", "steam", "global", "game", { edition: "Deluxe Edition" })),
  product("copperline-express-xbox", "Copperline Express", 26.49, key("Copperline Express", "xbox", "europe", "game", { languages: ["English", "German", "French"] })),
  product("copperline-express-tides", "Copperline Express: Night Mail", 9.99, key("Copperline Express: Night Mail", "steam", "global", "dlc")),
  product("copperline-express-ps", "Copperline Express", 27.99, key("Copperline Express", "playstation", "europe", "game", { languages: ["English", "French", "Spanish", "Italian"] })),
  product("copperline-express-switch", "Copperline Express", 29.99, key("Copperline Express", "nintendo", "europe", "game", { languages: ["English", "German"] })),
];

export const SAMPLE_PRODUCT: CatalogProduct = product("copperline-express-standard", "Copperline Express", 22.49, key("Copperline Express", "steam", "global"));
export const SAMPLE_DELUXE: CatalogProduct = product("copperline-express-deluxe-pdp", "Copperline Express", 31.99, key("Copperline Express", "steam", "global", "game", { edition: "Deluxe Edition" }));

export function sampleEditions(current: "standard" | "deluxe"): EditionOption[] {
  return [
    { id: "standard", slug: "sample-standard", name: "Standard Edition", adds: null, price: 22.49, current: current === "standard" },
    { id: "deluxe", slug: "sample-deluxe", name: "Deluxe Edition", adds: "+ Season Pass", price: 31.99, current: current === "deluxe" },
  ];
}

export const SAMPLE_REQUIREMENTS: RequirementRow[] = [
  { key: "platform", label: "Platform", icon: "platform", value: "Activates on Steam. You need a Steam account and the Steam app." },
  { key: "region", label: "Region", icon: "region", value: "Global: no regional lock" },
  { key: "languages", label: "Languages", icon: "languages", value: "English, German, French, Spanish, Polish" },
  { key: "delivery", label: "Delivery", icon: "delivery", value: "To your account, usually within minutes after payment is confirmed" },
];

export const SAMPLE_ORDER = {
  number: "KT-30517",
  total: 31.99,
  title: "Copperline Express",
  key: key("Copperline Express", "steam", "global", "game", { edition: "Deluxe Edition" }),
  createdAt: "2026-10-06T14:18:00Z",
  paidAt: "2026-10-06T14:19:00Z",
  issuedAt: "2026-10-06T14:20:00Z",
};

export const SAMPLE_LIBRARY = ["Signal Hill", "Northbound", "Salt Flats GP", "Midnight Shuttle"];
