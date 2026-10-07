"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckoutFooter } from "@/components/checkout/CheckoutFrame";
import { BRAND } from "@/lib/brand";
import { openCookieSettings } from "@/lib/consent";
import { useStoreIndex } from "@/lib/hooks/useStoreIndex";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { RouteLine } from "@/components/ui/RouteLine";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { PaymentLogos } from "@/components/shared/PaymentLogos/PaymentLogos";
import { CredentialsSheet } from "@/components/layout/Credentials/CredentialsSheet";

const linkCls = "text-ui-md text-ink decoration-link decoration-2 underline-offset-[3px] hover-device:hover:underline hover-device:hover:text-accent-ink";

const SOCIAL = [
  { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
  { label: "LinkedIn", href: process.env.NEXT_PUBLIC_LINKEDIN_URL },
  { label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
].filter((s): s is { label: string; href: string } => Boolean(s.href));

const COLUMNS: { title: string; links: { href: string; label: string }[]; cookie?: boolean }[] = [
  {
    title: "Shop",
    links: [
      { href: "/catalog/games", label: "Games" },
      { href: "/catalog/gift-cards", label: "Gift cards" },
      { href: "/catalog/subscriptions", label: "Subscriptions" },
      { href: "/catalog/dlc", label: "DLC" },
      { href: "/catalog/top-ups", label: "Top-ups" },
      { href: "/catalog/software", label: "Software" },
      { href: "/deals", label: "Price cuts" },
      { href: "/new-releases", label: "New arrivals" },
      { href: "/catalog", label: "All keys" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/account/keys", label: "Keys" },
      { href: "/account/orders", label: "Orders" },
      { href: "/account/wishlist", label: "Saved" },
      { href: "/account/profile", label: "Profile" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/how-activation-works", label: "How activation works" },
      { href: "/policies/shipping", label: "Delivery" },
      { href: "/policies/warranty", label: "Key not working?" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/policies/terms", label: "Terms and conditions" },
      { href: "/policies/privacy", label: "Privacy policy" },
      { href: "/policies/returns", label: "Refund policy" },
      { href: "/policies/cookies", label: "Cookie policy" },
      { href: "/policies", label: "All policies" },
    ],
    cookie: true,
  },
];

const DISCLAIMER = `${BRAND.name} is an independent store and is not affiliated with or endorsed by Valve, Microsoft, Sony Interactive Entertainment, Nintendo, Epic Games, CD PROJEKT, Electronic Arts, Ubisoft, Blizzard Entertainment or Rockstar Games. Game titles, platform names and cover art belong to their owners.`;

function LinkList({ links, cookie }: { links: { href: string; label: string }[]; cookie?: boolean }) {
  const index = useStoreIndex();
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {links.filter((link) => link.href !== "/deals" || index?.onSale !== 0).map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={linkCls}>
            {link.label}
          </Link>
        </li>
      ))}
      {cookie ? (
        <li>
          <button type="button" onClick={openCookieSettings} className={`${linkCls} cursor-pointer text-left`}>
            Cookie settings
          </button>
        </li>
      ) : null}
    </ul>
  );
}

function PlatformLine() {
  const index = useStoreIndex();
  const platforms = index?.platforms ?? [];
  if (!platforms.length) return <div className="h-24" aria-hidden="true" />;
  return (
    <nav aria-label="Platforms" data-platform-line="" className="pt-10">
      <RouteLine
        data-route-line="footer"
        orientation="responsive"
        className="footer-line"
        stops={platforms.map((p) => ({ key: p.key, href: `/platform/${p.slug}`, label: p.short, leading: <PlatformTile number={p.number} size="sm" /> }))}
        terminus={{ label: "All keys", href: "/catalog" }}
      />
    </nav>
  );
}

function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer data-print-hide="" data-floor="" className="mt-auto bg-floor text-ink">
      <div className="mx-auto max-w-wide px-gutter">
        <PlatformLine />

        <nav aria-label="Footer" className="mt-16 hidden grid-cols-4 gap-8 lg:grid">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="eyebrow m-0 mb-4">{col.title}</h2>
              <LinkList links={col.links} cookie={col.cookie} />
            </div>
          ))}
        </nav>

        <nav aria-label="Footer" className="mt-8 lg:hidden">
          <Accordion>
            {COLUMNS.map((col) => (
              <AccordionItem key={col.title} title={col.title} headingLevel={2} flush titleClassName="text-step-0">
                <LinkList links={col.links} cookie={col.cookie} />
              </AccordionItem>
            ))}
          </Accordion>
        </nav>

        <CredentialsSheet className="mt-12 lg:mt-14" />

        <p className="measure m-0 mt-6 text-ui-sm text-ink-muted">{DISCLAIMER}</p>

        <div className="mt-8 flex flex-col items-center gap-5 border-t border-line py-6 lg:flex-row lg:justify-between">
          <p className="order-last m-0 text-ui-sm text-ink-muted lg:order-first">
            © {year} {BRAND.name}
          </p>
          {SOCIAL.length > 0 ? (
            <ul className="m-0 flex list-none gap-6 p-0">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <PaymentLogos height={28} strip className="max-lg:hidden" />
          <PaymentLogos height={24} strip className="justify-center lg:hidden" />
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) return <CheckoutFooter />;
  return <StoreFooter />;
}
