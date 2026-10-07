"use client";

import { useId } from "react";
import Link from "next/link";
import { Ticket, X } from "lucide-react";
import { Sheet } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { FlapCounter } from "@/components/ui/Flap";
import { CartItem } from "@/components/cart/CartItem/CartItem";
import { EmptyBox } from "@/components/shared/EmptyState/EmptyState";
import { PaymentLogos } from "@/components/shared/PaymentLogos/PaymentLogos";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { COMPANY } from "@/lib/company";
import { TicketSummary } from "@/components/cart/TicketSummary";

export const EMPTY_LINKS = [
  { href: "/catalog/games", label: "Games" },
  { href: "/catalog/gift-cards", label: "Gift cards" },
  { href: "/deals", label: "Price cuts" },
];

export function CartSheet() {
  const { cart, displayTotals, isSheetOpen, closeSheet } = useCart();
  const { currency } = useCurrency();
  const titleId = useId();
  const count = cart.itemCount;

  return (
    <Sheet open={isSheetOpen} onClose={closeSheet} side="right" labelledBy={titleId}>
      <div data-cart-panel="" className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line pl-5 pr-2">
          <div className="flex items-center gap-3">
            <Ticket size={20} aria-hidden="true" className="text-ink" />
            <h2 id={titleId} className="m-0 pt-1 text-step-2 font-bold leading-none text-ink">
              Cart
            </h2>
            {count > 0 ? <FlapCounter value={count} size="sm" label={`${count} ${count === 1 ? "key" : "keys"}`} /> : null}
          </div>
          <button type="button" onClick={closeSheet} aria-label="Close cart" className="flex size-11 cursor-pointer items-center justify-center rounded-control text-ink hover-device:hover:bg-surface-1">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start gap-3 px-6 py-12">
            <EmptyBox />
            <p className="m-0 mt-4 font-display text-step-2 font-bold leading-[1.15] text-ink">Your cart is empty</p>
            <ul className="m-0 flex list-none gap-5 p-0">
              {EMPTY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={closeSheet} className="text-ui-md font-semibold text-ink underline decoration-link decoration-2 underline-offset-[3px] hover-device:hover:text-accent-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button as={Link} href="/catalog" variant="outline" onClick={closeSheet} className="mt-4">
              Browse the catalogue
            </Button>
          </div>
        ) : (
          <>
            <ul aria-label="Keys in your cart" className="m-0 min-h-0 flex-1 list-none divide-y divide-line overflow-y-auto px-5 py-1">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} onNavigate={closeSheet} />
              ))}
            </ul>
            <div className="shrink-0 border-t border-line p-4">
              <TicketSummary count={count} cut="var(--color-raised)">
              <dl className="m-0 flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ui-md text-ink-muted">Subtotal</dt>
                  <dd className="m-0 font-mono text-data text-ink">{formatPrice(displayTotals.subtotal, currency)}</dd>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-3">
                  <dt className="text-step-0 font-semibold text-ink">{COMPANY.vatRegistered ? "Total incl. VAT" : "Total"}</dt>
                  <dd className="price m-0 text-step-2 leading-none text-ink">{formatPrice(displayTotals.total, currency)}</dd>
                </div>
              </dl>
              <p className="m-0 mt-3 text-ui-sm text-ink-muted">Keys are delivered to your account after your payment is confirmed.</p>
              <Button as={Link} href="/checkout" size="lg" fullWidth onClick={closeSheet} className="mt-4" arrow>
                Checkout
              </Button>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <Button as={Link} href="/cart" variant="ghost" onClick={closeSheet}>
                  View cart
                </Button>
                <PaymentLogos height={24} />
              </div>
              </TicketSummary>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
