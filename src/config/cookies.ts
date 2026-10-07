import { BRAND } from "@/lib/brand";

export type CookieCategory = "necessary" | "analytics" | "marketing";

export interface CookieRecord {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
  kind: "Cookie" | "Local storage" | "Session storage";
}

export const COOKIE_CATEGORIES: { id: CookieCategory; title: string; purpose: string }[] = [
  {
    id: "necessary",
    title: "Necessary",
    purpose: "Needed to run the store: sign-in, your cart, display currency, theme and the choices you make in this panel.",
  },
  {
    id: "analytics",
    title: "Analytics",
    purpose: "Count visits and see which pages people use, so we can find what is slow or unclear.",
  },
  {
    id: "marketing",
    title: "Marketing",
    purpose: "Check whether our adverts lead to orders, and show you relevant adverts on other websites.",
  },
];

export const COOKIE_TABLE: Record<CookieCategory, CookieRecord[]> = {
  necessary: [
    { name: "session_token", provider: BRAND.name, purpose: "Keeps you signed in to your account", expiry: "7 days", kind: "Cookie" },
    { name: "NEXT_LOCALE", provider: BRAND.name, purpose: "Remembers the site language", expiry: "1 year", kind: "Cookie" },
    { name: "keyterminus-cart", provider: BRAND.name, purpose: "Keeps the keys in your cart on this device", expiry: "Until you clear it", kind: "Local storage" },
    { name: "keyterminus-currency", provider: BRAND.name, purpose: "Keeps your display currency (EUR, USD or GBP)", expiry: "Until you clear it", kind: "Local storage" },
    { name: "keyterminus-theme", provider: BRAND.name, purpose: "Keeps the Day or Night theme you chose", expiry: "Until you clear it", kind: "Local storage" },
    { name: "keyterminus-locale", provider: BRAND.name, purpose: "Keeps the site language", expiry: "Until you clear it", kind: "Local storage" },
    { name: "keyterminus-consent", provider: BRAND.name, purpose: "Stores your cookie choices, their version and the date you made them", expiry: "12 months, then we ask again", kind: "Local storage" },
    { name: "keyterminus-viewed", provider: BRAND.name, purpose: "Lists the keys you looked at recently so they can be shown again on this device", expiry: "Until you clear it", kind: "Local storage" },
    { name: "keyterminus-recent-searches", provider: BRAND.name, purpose: "Lists your last searches on this device", expiry: "Until you clear it", kind: "Local storage" },
    { name: "keyterminus-store-index:v1, keyterminus-categories", provider: BRAND.name, purpose: "Caches platform counts, types and prices for the menus so pages load faster", expiry: "End of the browser session", kind: "Session storage" },
    { name: "keyterminus-checkout-draft", provider: BRAND.name, purpose: "Keeps the billing details you typed at checkout if you reload the page (never card details)", expiry: "End of the browser session", kind: "Session storage" },
  ],
  analytics: [],
  marketing: [],
};
