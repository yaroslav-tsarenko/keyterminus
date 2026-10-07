import { COMPANY } from "@/lib/company";

const POLICY_DATE = "2026-10-07";

export type LimitedType = "game" | "dlc" | "subscription" | "gift-card" | "top-up" | "software";

export const STORE_POLICY = {
  currency: "EUR",
  supportedCurrencies: ["EUR", "USD", "GBP"],
  vatRegistered: COMPANY.vatRegistered,
  tax: {
    vatRatePercent: 20,
    pricesIncludeVat: true,
  },
  markets: {
    countries: ["United Kingdom", "European Union member states"],
  },
  delivery: {
    method: "Activation key in your account",
    usualTime: "usually within minutes after your payment is confirmed",
    headline: "Delivered to your account, usually within minutes after payment is confirmed.",
    short: "To your account, usually within minutes after payment is confirmed",
    rail: "Delivery: usually within minutes",
    deadlineHours: 24,
    where: "in Account → Keys and on the order page, behind a Reveal key button",
    emailNote: "We email you when a key is ready. The email links to your account and never contains the key itself.",
  },
  returns: {
    withdrawalDays: 14,
    refundDays: 14,
    refundMethod: "the original payment method",
  },
  guarantee: {
    claimDays: 30,
    reviewDays: 3,
    summary: "If a key doesn’t work, report it within 30 days of delivery. We check it and send a replacement key, or refund what you paid for it if no replacement is available.",
    headline: "Replacement or refund if a key doesn't work",
    faultyKey: true,
    steps: [
      "Make sure the platform, region and account type on the product page match the account you are redeeming on.",
      "Report the key from your account, or email us, within 30 days of delivery. Include the order number and a screenshot of the error.",
      "We check the key with the issuer within 3 business days.",
      "If the key is faulty, was used before it reached you, or isn’t the product described on the page, we send a replacement key or refund what you paid for it.",
    ],
    exclusions: [
      "keys you have already redeemed successfully",
      "keys bought for the wrong platform or region when the product page named them correctly",
      "platform accounts that are banned or restricted for reasons that have nothing to do with the key",
    ],
  },
  limits: {
    maxQtyPerItem: 5,
    maxItemsPerOrder: 10,
    maxOrderValue: 600,
    byType: {
      game: { perItem: 5 },
      dlc: { perItem: 5 },
      software: { perItem: 3 },
      subscription: { perItem: 2 },
      "gift-card": { perItem: 2 },
      "top-up": { perItem: 2 },
    } as Record<LimitedType, { perItem: number }>,
    perCustomer24h: {
      "gift-card": { units: 4, value: 200 },
      "top-up": { units: 4, value: 200 },
    } as Partial<Record<LimitedType, { units: number; value: number }>>,
  },
  minAge: 18,
  policiesLastUpdated: POLICY_DATE,
  waiver: {
    version: POLICY_DATE,
    text: "I ask for my keys to be issued straight after payment, and I understand that my right to cancel ends once a key is issued to my account.",
  },
  support: {
    replyTime: "within 1 business day",
    channels: ["email", "contact form"],
  },
  payment: {
    hostedPage: true,
    threeDSecure: true,
    methods: ["Visa", "Mastercard"],
    providerName: null as string | null,
    chargeCurrencies: ["EUR", "USD", "GBP"],
  },
  orders: {
    cancelBefore: "your key is issued",
  },
  security: {
    keysEncryptedAtRest: true,
    keyInEmail: false,
  },
  invoices: {
    pdf: true,
  },
  checkout: {
    requireRegionCheck: true,
  },
  deals: {
    compareWindowDays: 30,
    minPercent: 10,
  },
  preorders: false,
  complaints: {
    acknowledgeTime: "within 1 business day",
    responseDays: 14,
  },
  processors: [
    { role: "Card payments", purpose: "Takes card payments on its own hosted page and runs the 3-D Secure check with your bank", name: null as string | null },
    { role: "Key distribution partner", purpose: "Issues the keys you buy. It receives the product and quantity only, never your name, email address or card details", name: null as string | null },
    { role: "Website hosting and database", purpose: "Runs the store and holds account and order records, including your keys in encrypted form", name: null as string | null },
    { role: "Email delivery", purpose: "Sends receipts, key notices, account and support emails", name: null as string | null },
  ],
  retention: {
    orderRecordsYears: 6,
    supportMessagesMonths: 24,
    inactiveAccountYears: 3,
  },
} as const;

export function perItemLimit(productType: string | null | undefined): number {
  const byType = STORE_POLICY.limits.byType as Record<string, { perItem: number }>;
  return productType && byType[productType] ? byType[productType].perItem : STORE_POLICY.limits.maxQtyPerItem;
}
