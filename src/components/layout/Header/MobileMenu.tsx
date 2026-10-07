"use client";

import Link from "next/link";
import { ArrowBigRight, Search, X } from "lucide-react";
import { Sheet } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { useAuth } from "@/providers/AuthProvider";
import { STORE_POLICY } from "@/config/store-policy";
import { cn } from "@/lib/utils/cn";
import type { StoreIndex } from "@/lib/catalog/store-index";
import { CurrencySelect } from "./CurrencySelect";
import { ThemeToggle } from "./ThemeToggle";
import { TYPE_ICON } from "./ConcourseMap";

const row = "flex min-h-12 w-full items-center justify-between gap-4 border-b border-line text-left text-step-0 text-ink";
const bigRow = "flex min-h-14 w-full items-center justify-between gap-4 border-b border-line text-left";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  index: StoreIndex | null;
  pathname: string;
  onSearch?: () => void;
}

export function MobileMenu({ open, onClose, index, pathname, onSearch }: MobileMenuProps) {
  const { user, role } = useAuth();
  const platforms = index?.platforms ?? [];

  return (
    <Sheet open={open} onClose={onClose} side="bottom" label="Menu">
      <div className="flex h-full flex-col" data-mobile-menu="">
        <div className="relative shrink-0 border-b border-line px-4 pb-3 pt-2">
          <span aria-hidden="true" className="mx-auto block h-1 w-9 rounded-flap bg-line-hover" />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="m-0 flex min-w-0 items-center gap-2.5 text-ui-sm text-ink-muted">
              <span aria-hidden="true" className="h-3.5 w-1.5 shrink-0 bg-terminus" />
              <span className="pt-0.5">{STORE_POLICY.delivery.headline.replace(/\.$/, "")}</span>
            </p>
            <button type="button" onClick={onClose} aria-label="Close menu" className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-control text-ink">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10">
          {onSearch ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSearch();
              }}
              className="mt-4 flex h-12 w-full cursor-pointer items-center gap-2.5 rounded-control border border-control bg-surface px-3 text-left text-step-0 text-ink-subtle min-[340px]:hidden"
            >
              <Search size={18} aria-hidden="true" className="text-ink" />
              Search keys
            </button>
          ) : null}

          <nav aria-label="Platforms" className="pt-5">
            <p className="eyebrow m-0 mb-2">Platforms</p>
            <ul className="m-0 grid list-none grid-cols-2 gap-x-4 p-0">
              {platforms.map((p) => (
                <li key={p.key} className="border-b border-line">
                  <Link href={`/platform/${p.slug}`} onClick={onClose} aria-current={pathname === `/platform/${p.slug}` ? "page" : undefined} className="flex min-h-14 items-center gap-2.5 py-2">
                    <PlatformTile number={p.number} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate pt-0.5 font-display text-[0.9375rem] font-bold leading-tight text-ink">{p.short}</span>
                      <span className="block font-mono text-[0.75rem] text-ink-muted">{p.count.toLocaleString("en-GB")}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Types" className="mt-8">
            <p className="eyebrow m-0 mb-1">Types</p>
            {(index?.types ?? []).map((t) => {
              const Icon = TYPE_ICON[t.key];
              return (
                <Link key={t.key} href={`/catalog/${t.slug}`} onClick={onClose} className={bigRow}>
                  <span className="flex items-center gap-3">
                    {Icon ? <Icon size={20} aria-hidden="true" /> : <span aria-hidden="true" className="w-5" />}
                    <span className="pt-0.5 font-display text-step-1 font-bold">{t.label}</span>
                    <span className="font-mono text-[0.75rem] text-ink-muted">{t.count.toLocaleString("en-GB")}</span>
                  </span>
                  <ArrowBigRight size={18} aria-hidden="true" />
                </Link>
              );
            })}
            {index?.onSale !== 0 ? (
              <Link href="/deals" onClick={onClose} className={bigRow}>
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="w-5" />
                  <span className="pt-0.5 font-display text-step-1 font-bold">Price cuts</span>
                  {index?.onSale ? <span className="font-mono text-[0.75rem] text-ink-muted">{index.onSale.toLocaleString("en-GB")}</span> : null}
                </span>
                <ArrowBigRight size={18} aria-hidden="true" />
              </Link>
            ) : null}
            <Link href="/new-releases" onClick={onClose} className={bigRow}>
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="w-5" />
                <span className="pt-0.5 font-display text-step-1 font-bold">New arrivals</span>
              </span>
              <ArrowBigRight size={18} aria-hidden="true" />
            </Link>
          </nav>

          <nav aria-label="Account" className="mt-8">
            <p className="eyebrow m-0 mb-1">Account</p>
            {user ? (
              <>
                <Link href="/account/keys" onClick={onClose} className={row}>
                  Keys
                </Link>
                <Link href="/account/orders" onClick={onClose} className={row}>
                  Orders
                </Link>
                <Link href="/account/wishlist" onClick={onClose} className={row}>
                  Saved
                </Link>
                <Link href="/account/profile" onClick={onClose} className={row}>
                  Profile
                </Link>
                {role === "ADMIN" || role === "SUPER_ADMIN" ? (
                  <a href="/admin" onClick={onClose} className={row}>
                    Admin
                  </a>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-2 py-3">
                <Button as="a" href="/auth/login?next=%2Faccount" fullWidth>
                  Sign in
                </Button>
                <Button as={Link} href="/auth/register" variant="ghost" onClick={onClose}>
                  Create an account
                </Button>
              </div>
            )}
          </nav>

          <nav aria-label="Help" className="mt-8">
            <p className="eyebrow m-0 mb-1">Help</p>
            <Link href="/how-activation-works" onClick={onClose} className={row}>
              How activation works
            </Link>
            <Link href="/faq" onClick={onClose} className={row}>
              FAQ
            </Link>
            <Link href="/contact" onClick={onClose} className={cn(row)}>
              Contact us
            </Link>
          </nav>

          <div className="pt-6">
            <div className="flex min-h-14 items-center justify-between border-b border-line">
              <CurrencySelect size="md" showLabel className="w-full justify-between" />
            </div>
            <ThemeToggle variant="row" />
          </div>
        </div>
      </div>
    </Sheet>
  );
}
