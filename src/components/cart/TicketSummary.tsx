import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { FlapCounter } from "@/components/ui/Flap";

export function TicketSummary({ count, children, label = "Your ticket", className, cut = "var(--color-bg)" }: { count: number; children: ReactNode; label?: string; className?: string; cut?: string }) {
  return (
    <section aria-label={label} data-ticket="" className={cn("ticket", className)} style={{ ["--ticket-cut" as string]: cut }}>
      <div data-ticket-stub="" data-surface="board" className="flex flex-col items-center justify-start gap-2 px-2 py-5">
        <span className="label-caps text-on-board-muted">Keys</span>
        <FlapCounter value={count} size="md" label={`${count} ${count === 1 ? "key" : "keys"}`} />
      </div>
      <div data-ticket-body="" className="min-w-0 p-5">
        {children}
      </div>
    </section>
  );
}
