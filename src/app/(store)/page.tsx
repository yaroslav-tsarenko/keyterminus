import "@/styles/home.css";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/shared/SEO/JsonLd";
import { getHomeData } from "@/components/home/data";
import { DeparturesHero } from "@/components/home/departures-hero";
import { PlatformSigns } from "@/components/home/platforms";
import { Timetable } from "@/components/home/timetable";
import { TheaterSection } from "@/components/home/theater-section";
import { Routes } from "@/components/home/routes";
import { Fares } from "@/components/home/fares";
import { GiftCards } from "@/components/home/gift-cards";
import { SeasonTickets } from "@/components/home/season-tickets";
import { Arrivals } from "@/components/home/arrivals";
import { Gate } from "@/components/home/gate";
import { InformationDesk } from "@/components/home/information-desk";
import { Terminus } from "@/components/home/terminus";
import { BRAND } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return pageMetadata({ title: t("metaTitle", { brand: BRAND.name }), description: t("metaDescription", { brand: BRAND.name }), path: "/", absoluteTitle: true });
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div data-landing="home">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <DeparturesHero data={data} />
      <PlatformSigns platforms={data.platforms} />
      <Timetable lines={data.lines} />
      <TheaterSection />
      <Routes routes={data.routes} />
      <Fares fares={data.fares} />
      <GiftCards cards={data.giftCards} />
      <SeasonTickets timetable={data.timetable} />
      <Arrivals platforms={data.activationPlatforms} />
      <Gate />
      <InformationDesk />
      <Terminus data={data} />
    </div>
  );
}
