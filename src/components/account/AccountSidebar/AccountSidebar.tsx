"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DoorOpen } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/account", key: "overview" },
  { href: "/account/keys", key: "keys" },
  { href: "/account/orders", key: "orders" },
  { href: "/account/wishlist", key: "saved" },
  { href: "/account/profile", key: "profile" },
  { href: "/account/addresses", key: "addresses" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/account" ? pathname === "/account" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountSidebar() {
  const pathname = usePathname();
  const t = useTranslations("account.nav");
  const { signOut } = useAuth();

  return (
    <nav aria-label={t("label")} className="hidden lg:block">
      <ul className="m-0 flex list-none flex-col p-0">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center pl-4 pt-0.5 text-step-0 transition-colors duration-[120ms]",
                  "before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:bg-brand before:opacity-0",
                  active ? "font-bold text-ink before:opacity-100" : "text-ink-muted hover-device:hover:text-ink",
                )}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 border-t border-line pt-3">
        <button type="button" onClick={signOut} className="btn-text inline-flex min-h-11 cursor-pointer items-center gap-2.5 pl-4 text-ui-md text-ink-muted hover-device:hover:text-ink">
          <DoorOpen size={18} aria-hidden="true" />
          <span data-label="">{t("signOut")}</span>
        </button>
      </div>
    </nav>
  );
}

export function AccountTabs() {
  const pathname = usePathname();
  const t = useTranslations("account.nav");
  const { signOut } = useAuth();
  return (
    <nav aria-label={t("label")} className="no-scrollbar -mx-gutter overflow-x-auto border-b border-line px-gutter lg:hidden">
      <ul className="m-0 flex w-max list-none gap-6 p-0">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("active-bar flex min-h-12 items-center whitespace-nowrap pt-0.5 text-ui-md", active ? "font-bold text-ink" : "text-ink-muted")}>
                {t(item.key)}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={signOut} className="flex min-h-12 cursor-pointer items-center whitespace-nowrap text-ui-md text-ink-muted">
            {t("signOut")}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export function AccountPageHeader({ title, eyebrow, aside, children }: { title: ReactNode; eyebrow?: string; aside?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      {eyebrow ? <p className="eyebrow m-0 -mb-2">{eyebrow}</p> : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="m-0 pt-1 text-step-4 leading-[1.04] text-ink">{title}</h1>
        {aside}
      </div>
      {children}
      <AccountTabs />
    </div>
  );
}
