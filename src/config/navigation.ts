import { PLATFORMS, PRODUCT_TYPES } from "@/lib/keys/taxonomy";
import { PLATFORM_ORDER, TYPE_ORDER, orderIndex } from "@/config/merchandising";

export interface NavCategory {
  slug: string;
  name: string;
  short: string;
}

export const NAV_CATEGORIES: NavCategory[] = [...PRODUCT_TYPES].sort((a, b) => orderIndex(TYPE_ORDER, a.key) - orderIndex(TYPE_ORDER, b.key)).map((t) => ({ slug: t.slug, name: t.key === "dlc" ? "DLC" : t.label, short: t.key === "dlc" ? "DLC" : t.label }));

export const RIG_LINKS = ["games", "gift-cards", "subscriptions", "dlc"];

export const BOARD_COLUMNS: { title: string; slugs: string[]; wide?: boolean }[] = [
  { title: "Games", slugs: ["games"], wide: true },
  { title: "Gift cards", slugs: ["gift-cards"] },
  { title: "Subscriptions", slugs: ["subscriptions"] },
  { title: "DLC", slugs: ["dlc"] },
  { title: "Top-ups", slugs: ["top-ups"] },
  { title: "Software", slugs: ["software"] },
];

export const PLATFORM_LINKS = [...PLATFORMS].filter((p) => p.key !== "other").sort((a, b) => orderIndex(PLATFORM_ORDER, a.key) - orderIndex(PLATFORM_ORDER, b.key)).map((p) => ({ href: `/platform/${p.slug}`, label: p.label }));

export function navCategory(slug: string): NavCategory | undefined {
  return NAV_CATEGORIES.find((c) => c.slug === slug);
}

export const ORDER_LINKS: { href: string; label: string }[] = [
  { href: "/how-activation-works", label: "How activation works" },
  { href: "/account/keys", label: "My keys" },
  { href: "/cart", label: "Cart" },
];

export const HELP_LINKS: { href: string; label: string }[] = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact us" },
  { href: "/policies/shipping", label: "Delivery policy" },
  { href: "/policies/returns", label: "Refund policy" },
  { href: "/policies/warranty", label: "Key not working?" },
  { href: "/policies/payment", label: "Payment" },
  { href: "/policies/complaints", label: "Complaints" },
];

export const POLICY_LINKS = [
  { href: "/policies/terms", label: "Terms and conditions" },
  { href: "/policies/privacy", label: "Privacy policy" },
  { href: "/policies/cookies", label: "Cookie policy" },
  { href: "/policies/acceptable-use", label: "Acceptable use" },
  { href: "/policies", label: "All policies" },
];
