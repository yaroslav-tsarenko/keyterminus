import Link from "next/link";
import type { ReactNode } from "react";
import { POLICY_FACTS as F } from "@/lib/policy-facts";

export const FAQ_GROUPS: { id: string; items: string[] }[] = [
  { id: "buying", items: ["place", "account", "limits", "subscriptions", "affiliation"] },
  { id: "delivery", items: ["time", "how", "noEmail", "safety"] },
  { id: "activation", items: ["region", "redeem", "language", "giftCards"] },
  { id: "payment", items: ["safe", "methods", "currencies", F.vatRegistered ? "vatYes" : "vatNo", "when"] },
  { id: "problems", items: ["notWorking", "cancel", "unwanted"] },
  { id: "account", items: ["who", "password", "delete"] },
];

export const FAQ_VALUES = {
  brand: F.brand,
  company: F.company,
  email: F.email,
  withdrawalDays: F.withdrawalDays,
  refundDays: F.refundDays,
  refundMethod: F.refundMethod,
  maxItems: F.maxItemsPerOrder,
  maxValue: F.maxOrderValue,
  cardLimit: F.cardLimitPerItem,
  cardLimit24h: F.cardLimit24h,
  cardValue24h: F.cardValue24h,
  restricted: F.restrictedCountries,
  territories: F.restrictedTerritories,
  usual: F.deliveryUsual,
  deadlineHours: F.deliveryDeadlineHours,
  claimDays: F.guaranteeClaimDays,
  reviewDays: F.guaranteeReviewDays,
  cancelBefore: F.cancelBefore,
  cardMethods: F.cardMethods,
  currencies: F.currencies,
  minAge: F.minAge,
  replyTime: F.replyTime,
  supportHours: F.supportHours,
};

export const faqLinkTags = {
  returns: (chunks: ReactNode) => <Link href="/policies/returns">{chunks}</Link>,
  warranty: (chunks: ReactNode) => <Link href="/policies/warranty">{chunks}</Link>,
  privacy: (chunks: ReactNode) => <Link href="/policies/privacy">{chunks}</Link>,
  policies: (chunks: ReactNode) => <Link href="/policies">{chunks}</Link>,
  howto: (chunks: ReactNode) => <Link href="/how-activation-works">{chunks}</Link>,
};

export const faqPlainTags = {
  returns: (chunks: string) => chunks,
  warranty: (chunks: string) => chunks,
  privacy: (chunks: string) => chunks,
  policies: (chunks: string) => chunks,
  howto: (chunks: string) => chunks,
};
