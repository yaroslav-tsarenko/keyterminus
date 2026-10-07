"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IdCard, Rows3, Search, SquareChevronDown, Ticket } from "lucide-react";
import { Mark, Wordmark } from "@/components/layout/BrandMark";
import { FlapCounter } from "@/components/ui/Flap";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { searchCountLabel, useStoreIndex } from "@/lib/hooks/useStoreIndex";
import { STORE_POLICY } from "@/config/store-policy";
import { cn } from "@/lib/utils/cn";
import { BRAND } from "@/lib/brand";
import { ThemeToggle } from "./ThemeToggle";
import { CurrencySelect } from "./CurrencySelect";
import { ConcourseMap } from "./ConcourseMap";
import { MobileMenu } from "./MobileMenu";
import { SearchDialog } from "@/components/search/SearchDialog/SearchDialog";
import { CartSheet } from "@/components/cart/CartSheet/CartSheet";
import { CheckoutHeader } from "@/components/checkout/CheckoutFrame";

const NAV: { href: string; label: string; from: string }[] = [
  { href: "/catalog/games", label: "Games", from: "" },
  { href: "/catalog/gift-cards", label: "Gift cards", from: "" },
  { href: "/deals", label: "Price cuts", from: "" },
  { href: "/catalog/dlc", label: "DLC", from: "max-xl:hidden" },
  { href: "/catalog/subscriptions", label: "Subscriptions", from: "max-[1440px]:hidden" },
  { href: "/new-releases", label: "New arrivals", from: "max-[1600px]:hidden" },
];

const navLink = cn(
  "relative inline-flex h-full shrink-0 items-center whitespace-nowrap pt-0.5 font-display text-ui-md font-bold text-ink-muted transition-colors duration-[120ms]",
  "after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[3px] after:bg-brand after:opacity-0",
  "hover-device:hover:text-ink aria-[current]:text-ink aria-[current]:after:opacity-100 data-[active=true]:text-ink data-[active=true]:after:opacity-100",
);

const action = "relative inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control px-2.5 font-display text-ui-md font-bold text-ink transition-colors duration-[120ms] hover-device:hover:bg-surface-1";

export function CartCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return <FlapCounter value={count > 99 ? "99" : count} size="xs" label={`${count} in cart`} />;
}

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}-`);
}

function InformationStrip() {
  return (
    <div data-surface="board" data-info-strip="" className="h-[var(--strip-height)] bg-board text-on-board">
      <div className="mx-auto grid h-full max-w-container grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-gutter min-[1600px]:max-w-wide">
        <Link href="/policies/shipping" data-strip-cell="delivery" className="flex min-w-0 items-center gap-2.5 overflow-hidden text-on-board hover-device:hover:underline hover-device:hover:decoration-remark hover-device:hover:underline-offset-4">
          <span aria-hidden="true" className="h-3.5 w-1.5 shrink-0 bg-terminus" />
          <span className="min-w-0 truncate font-mono text-[0.75rem] leading-none">{STORE_POLICY.delivery.rail}</span>
        </Link>
        <div data-strip-cell="controls" className="flex shrink-0 items-center gap-1">
          <Link href="/faq" className="flex h-8 items-center rounded-sign px-2 pt-px text-[0.8125rem] font-semibold text-on-board hover-device:hover:bg-flap">
            Help
          </Link>
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-board-edge" />
          <CurrencySelect />
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-board-edge" />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

function StoreHeader() {
  const pathname = usePathname();
  const { itemCount, openSheet, isSheetOpen } = useCart();
  const { user } = useAuth();
  const index = useStoreIndex();
  const mapId = useId();
  const [mapOpen, setMapOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [stripHidden, setStripHidden] = useState(false);
  const mapTimer = useRef<number | undefined>(undefined);
  const mapTrigger = useRef<HTMLButtonElement>(null);
  const anyOpen = mapOpen || mobileOpen || searchOpen || isSheetOpen;

  useEffect(() => {
    let lastY = window.scrollY;
    let upTravel = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (y <= 120) {
        upTravel = 0;
        setStripHidden(false);
        return;
      }
      if (dy > 0) {
        upTravel = 0;
        setStripHidden(true);
      } else if (dy < 0) {
        upTravel -= dy;
        if (upTravel >= 32) setStripHidden(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMapOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || anyOpen) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [anyOpen]);

  const openMap = useCallback((delay: number) => {
    window.clearTimeout(mapTimer.current);
    mapTimer.current = window.setTimeout(() => setMapOpen(true), delay);
  }, []);

  const closeMap = useCallback((delay: number, restoreFocus = false) => {
    window.clearTimeout(mapTimer.current);
    mapTimer.current = window.setTimeout(() => {
      setMapOpen(false);
      if (restoreFocus) mapTrigger.current?.focus();
    }, delay);
  }, []);

  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMap(0, true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mapOpen, closeMap]);

  const platformsActive = pathname.startsWith("/platform/");
  const persona = user?.firstName ?? user?.name ?? null;
  const placeholder = searchCountLabel(index?.total);
  const hideStrip = stripHidden && !mapOpen;

  return (
    <>
      <div aria-hidden="true" className="h-[var(--header-height-mobile)] shrink-0 lg:h-[var(--header-height)]" />
      <header
        data-header=""
        data-header-state={hideStrip ? "compact" : "top"}
        data-print-hide=""
        onPointerLeave={() => {
          if (mapOpen) closeMap(250);
        }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-transform duration-[180ms] ease-[var(--ease-sign)]",
          hideStrip && "lg:-translate-y-[var(--strip-height)]",
        )}
      >
        <div className="hidden lg:block" inert={hideStrip}>
          <InformationStrip />
        </div>
        <div data-concourse-bar="" className="relative border-b border-line bg-rig text-ink">
          <div
            className={cn(
              "mx-auto flex h-[var(--header-height-mobile)] max-w-container items-center justify-between gap-3 px-gutter min-[1600px]:max-w-wide",
              "lg:grid lg:h-[var(--bar-height)] lg:grid-cols-[auto_minmax(0,auto)_minmax(180px,1fr)_auto] lg:gap-6 xl:gap-7",
            )}
          >
            <Link href="/" aria-label={`${BRAND.name}, home`} data-header-cell="logo" className="flex shrink-0 items-center text-ink">
              <Wordmark className="h-[26px] w-auto max-[399px]:hidden lg:h-[28px] xl:h-[32px]" />
              <Mark size="small" className="h-[26px] w-auto min-[400px]:hidden" />
            </Link>

            <nav aria-label="Main" data-header-cell="nav" className="hidden h-full min-w-0 items-stretch gap-5 overflow-hidden lg:flex">
              <button
                ref={mapTrigger}
                type="button"
                data-board-trigger=""
                data-active={platformsActive || undefined}
                aria-expanded={mapOpen}
                aria-controls={mapId}
                onClick={() => {
                  window.clearTimeout(mapTimer.current);
                  setMapOpen((v) => !v);
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") openMap(150);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse" && !mapOpen) window.clearTimeout(mapTimer.current);
                }}
                className={cn(navLink, "cursor-pointer gap-1.5", mapOpen && "text-ink")}
              >
                Platforms
                <SquareChevronDown size={14} aria-hidden="true" className={cn("transition-transform duration-[180ms]", mapOpen && "rotate-180")} />
              </button>
              {NAV.map((link) => (
                <Link key={link.href} href={link.href} aria-current={active(pathname, link.href) ? "page" : undefined} className={cn(navLink, link.from)}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-haspopup="dialog"
              data-search-trigger=""
              data-header-cell="search"
              className="group hidden h-10 w-full max-w-[440px] cursor-pointer items-center gap-2.5 justify-self-end rounded-control border border-control bg-raised pl-3 pr-1.5 text-left text-ui-md text-ink-subtle transition-colors duration-[120ms] hover-device:hover:border-ink-muted lg:flex"
            >
              <Search size={18} aria-hidden="true" className="text-ink" />
              <span className="min-w-0 flex-1 truncate pt-0.5">{placeholder}</span>
              <kbd aria-hidden="true" className="flap text-[0.75rem]">
                <span className="flap-glyph">/</span>
              </kbd>
            </button>

            <div data-header-cell="actions" className="flex shrink-0 items-center gap-0.5 lg:gap-1">
              <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className={cn(action, "w-11 px-0 max-[339px]:hidden lg:hidden")}>
                <Search size={20} aria-hidden="true" />
              </button>
              <Link href={user ? "/account" : "/auth/login"} className={cn(action, "hidden lg:inline-flex max-xl:w-11 max-xl:px-0")} aria-label={user ? `Account${persona ? `, ${persona}` : ""}` : "Sign in"}>
                <IdCard size={20} aria-hidden="true" />
                <span className="hidden pt-0.5 xl:inline">{user ? "Account" : "Sign in"}</span>
              </Link>
              <button type="button" onClick={openSheet} data-cart-target="" aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "key" : "keys"}`} className={cn(action, "max-xl:px-1.5")}>
                <Ticket size={20} aria-hidden="true" data-cart-glyph="" />
                <span aria-hidden="true" className="hidden pt-0.5 xl:inline">
                  Cart
                </span>
                <CartCount count={itemCount} />
              </button>
              <button type="button" onClick={() => setMobileOpen(true)} aria-label="Menu" className={cn(action, "-mr-2 w-11 px-0 lg:hidden")}>
                <Rows3 size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <ConcourseMap id={mapId} open={mapOpen} index={index} onClose={(restore) => closeMap(0, restore)} onPointerEnter={() => window.clearTimeout(mapTimer.current)} onPointerLeave={() => closeMap(250)} />
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} index={index} pathname={pathname} onSearch={() => setSearchOpen(true)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} index={index} />
      <CartSheet />
    </>
  );
}

export function Header() {
  const pathname = usePathname();
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) return <CheckoutHeader />;
  return <StoreHeader />;
}
