import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageLoader } from "@/components/ui/Flap";
import { ConfirmedView } from "./ConfirmedView";
import { noindexMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout.confirmed.meta");
  return noindexMetadata(t("title"), t("description"), "/order/confirmed", false);
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<PageLoader block />}>
      <ConfirmedView />
    </Suspense>
  );
}
