"use client";

import { useTranslations } from "next-intl";
import { StatusTag } from "@/components/ui/Tag";
import { plateStatusFor, type CustomerOrderState } from "@/lib/orders";

export function OrderStatus({ state, className }: { state: CustomerOrderState; className?: string }) {
  const t = useTranslations("account.states");
  return <StatusTag status={plateStatusFor(state)} label={t(state)} className={className} />;
}
