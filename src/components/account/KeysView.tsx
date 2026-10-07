"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { FlapCounter } from "@/components/ui/Flap";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { KeyBoard } from "@/components/account/KeyBoard";
import type { OrderView } from "@/lib/orders";
import { AccountPageHeader } from "./AccountSidebar/AccountSidebar";
import { useAccountData } from "./useAccountData";
import { LoadError } from "./LoadError";
import { formatOrderDate } from "./format";

const POLL_MS = 15_000;
const FILTERS = [
  { id: "all", label: "All" },
  { id: "hidden", label: "Not revealed" },
  { id: "revealed", label: "Revealed" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

type Line = OrderView["lines"][number];
type DeliveredKey = NonNullable<Line["delivery"]>["keys"][number];
interface Entry {
  line: Line;
  key: DeliveredKey | null;
  index: number;
  total: number;
  issuing: boolean;
}

export function KeysView() {
  const { data, error, loading, reload, refresh } = useAccountData<{ orders: OrderView[] }>("/api/account/orders");
  const [filter, setFilter] = useState<Filter>("all");
  const orders = [...(data?.orders ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const polling = orders.some((o) => o.inFlight);

  useEffect(() => {
    if (!polling) return;
    const timer = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(timer);
  }, [polling, refresh]);

  const groups = orders
    .map((order) => ({
      order,
      entries: order.lines.flatMap((line): Entry[] => {
        const d = line.delivery;
        if (!d) return [];
        if (d.status === "delivered") return d.keys.map((k, i) => ({ line, key: k, index: i + 1, total: d.keys.length, issuing: false }));
        if (d.inFlight) return [{ line, key: null, index: 1, total: 1, issuing: true }];
        return [];
      }),
    }))
    .filter((g) => g.entries.length > 0);
  const all = groups.flatMap((g) => g.entries).filter((e) => e.key);
  const count = all.length;
  const notRevealed = all.filter((e) => !e.key?.revealed).length;
  const visible = groups
    .map((g) => ({ ...g, entries: g.entries.filter((e) => filter === "all" || e.issuing || (filter === "hidden" ? !e.key?.revealed : e.key?.revealed)) }))
    .filter((g) => g.entries.length > 0);

  return (
    <div>
      <AccountPageHeader title="Keys" eyebrow="My departures" aside={!loading && count ? <FlapCounter value={count} size="sm" label={`${count} ${count === 1 ? "key" : "keys"}`} /> : null}>
        {!loading && count ? <p className="m-0 text-ui-md text-ink-muted">{notRevealed ? `${notRevealed} not revealed yet.` : "Every key has been revealed at least once."}</p> : null}
      </AccountPageHeader>
      {loading ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="board flex max-w-[760px] flex-col gap-4 p-5">
              <span className="block h-3 w-1/3 rounded-flap bg-flap" />
              <span className="block h-5 w-2/3 rounded-flap bg-flap" />
              <span className="block h-9 w-full rounded-flap bg-flap" />
            </div>
          ))}
        </div>
      ) : error ? (
        <LoadError onRetry={reload} />
      ) : groups.length === 0 ? (
        <EmptyState title="No keys yet" subtitle="Keys you buy appear here after your payment is confirmed." actionLabel="Browse the catalogue" actionHref="/catalog" align="start" className="border-t border-line px-0 py-10" />
      ) : (
        <>
          <div role="tablist" aria-label="Filter keys" className="mb-8 flex gap-6 border-b border-line">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn("active-bar relative h-12 cursor-pointer pt-0.5 font-display text-ui-md font-bold", filter === f.id ? "text-ink" : "text-ink-muted hover-device:hover:text-ink")}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-12" role="tabpanel">
            {visible.map(({ order, entries }) => (
              <section key={order.id} aria-label={`Order ${order.number}`}>
                <p className="m-0 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-rule pb-2 font-mono text-data">
                  <span className="text-ink">{order.number}</span>
                  <span className="text-ink-muted">{formatOrderDate(order.createdAt)}</span>
                  <Link href={`/account/orders/${order.id}`} className="btn-text ml-auto font-sans text-ui-sm font-semibold text-ink">
                    <span data-label="">View order</span>
                  </Link>
                </p>
                <div className="flex flex-col gap-4">
                  {entries.map((e) =>
                    e.key ? (
                      <KeyBoard key={e.key.id} keyId={e.key.id} title={e.line.name} productSlug={e.line.slug} keyInfo={e.line.key} index={e.index} total={e.total} status="ready" keyType={e.key.type} revealedBefore={e.key.revealed} issuedAt={e.key.issuedAt} revealedAt={e.key.revealedAt} orderNumber={order.number} />
                    ) : (
                      <KeyBoard key={e.line.id} keyId={e.line.id} title={e.line.name} productSlug={e.line.slug} keyInfo={e.line.key} status="issuing" orderNumber={order.number} />
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
