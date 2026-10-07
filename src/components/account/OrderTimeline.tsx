import { cn } from "@/lib/utils/cn";
import { FlapLoader } from "@/components/ui/Flap";
import { RouteLine, type RouteStop, type RouteTerminus } from "@/components/ui/RouteLine";
import { TimelineAdvance } from "@/components/motion/TimelineAdvance";
import { STORE_POLICY } from "@/config/store-policy";

export const STATUS_COPY: Record<string, string> = {
  awaiting_payment: "We’re waiting for your payment to be confirmed.",
  payment_failed: "Your payment didn’t go through. You haven’t been charged.",
  paid: "Payment confirmed. We’re issuing your key.",
  submitted: "Payment confirmed. We’re issuing your key.",
  processing: "Payment confirmed. We’re issuing your key.",
  delayed: "Issuing is taking longer than usual. We’ll email you as soon as your key is ready. You can also contact us with your order number.",
  delivered: "Your key is ready in your account.",
  failed: "We’re processing your refund.",
  refund_pending: "We’re processing your refund.",
  refunded: "Refunded to your card.",
  replaced: "A replacement key is ready in your account.",
};

const BRANCH: Record<string, { label: string; tone: "danger" | "muted" }> = {
  payment_failed: { label: "Payment failed", tone: "danger" },
  failed: { label: "Refund pending", tone: "muted" },
  refund_pending: { label: "Refund pending", tone: "muted" },
  refunded: { label: "Refunded", tone: "muted" },
  delayed: { label: "Issuing delayed", tone: "danger" },
};

function stamp(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

type NodeState = "done" | "current" | "upcoming";

interface Node {
  key: string;
  label: string;
  state: NodeState;
  time: string | null;
  issuing?: boolean;
}

export interface OrderTimelineProps {
  status: string;
  createdAt?: string | null;
  paidAt?: string | null;
  finishedAt?: string | null;
  refundedAt?: string | null;
  revealedAt?: string | null;
  showRevealed?: boolean;
  size?: "large" | "compact";
  className?: string;
  demo?: boolean;
}

export function timelineNodes({ status, createdAt, paidAt, finishedAt, revealedAt, showRevealed = false }: OrderTimelineProps): { nodes: Node[]; branch: { label: string; tone: "danger" | "muted"; time: string | null } | null } {
  const placed: Node = { key: "placed", label: "Order placed", state: "done", time: stamp(createdAt) };
  if (status === "payment_failed") return { nodes: [placed], branch: { ...BRANCH.payment_failed, time: null } };
  if (status === "awaiting_payment") {
    return { nodes: [placed, { key: "paid", label: "Payment confirmed", state: "current", time: null }, { key: "issued", label: "Key issued", state: "upcoming", time: null }], branch: null };
  }
  const paid: Node = { key: "paid", label: "Payment confirmed", state: "done", time: stamp(paidAt) };
  const branch = BRANCH[status];
  if (branch) return { nodes: [placed, paid], branch: { ...branch, time: null } };
  if (status === "delivered" || status === "replaced") {
    const nodes: Node[] = [placed, paid, { key: "issued", label: status === "replaced" ? "Replacement issued" : "Key issued", state: "done", time: stamp(finishedAt) }];
    if (showRevealed) nodes.push({ key: "revealed", label: "Revealed", state: revealedAt ? "done" : "upcoming", time: stamp(revealedAt) });
    return { nodes, branch: null };
  }
  return { nodes: [placed, paid, { key: "issued", label: "Key issued", state: "current", time: null, issuing: true }], branch: null };
}

export function OrderTimeline(props: OrderTimelineProps) {
  const { status, size = "compact", className, demo = false, refundedAt } = props;
  const { nodes, branch } = timelineNodes(props);
  const large = size === "large";
  const copy = STATUS_COPY[status] ?? "";
  const issuing = nodes.some((n) => n.issuing);
  const stops: RouteStop[] = nodes.map((n) => ({
    key: n.key,
    label: n.label,
    state: n.state,
    check: n.state === "done",
    meta: n.issuing ? <FlapLoader size={16} label="Issuing your key" /> : (n.time ?? undefined),
  }));
  const terminus: RouteTerminus = branch
    ? { label: status === "refunded" && refundedAt ? `${branch.label} · ${stamp(refundedAt)}` : branch.label, tone: branch.tone }
    : { tone: nodes.every((n) => n.state === "done") ? "terminus" : "ink" };

  return (
    <div data-timeline="" data-status={status} data-demo={demo ? "timeline" : undefined} className={cn("min-w-0", className)}>
      {demo ? null : <TimelineAdvance status={status} />}
      <RouteLine stops={stops} terminus={terminus} orientation="responsive" label="Order progress" className={cn(large && "[--stop:16px]")} demo={demo} data-route-line="order" />
      <p aria-live="polite" className={cn("m-0 mt-4 text-ink-muted", large ? "text-step-0" : "text-ui-md")}>
        {copy}
        {issuing ? " Usually within minutes after payment is confirmed. We’ll email you when it’s ready." : ""}
      </p>
      {status === "refund_pending" || status === "failed" ? <p className="m-0 mt-1 text-ui-sm text-ink-muted">Refunds go back to your card within {STORE_POLICY.returns.refundDays} days.</p> : null}
    </div>
  );
}

export { OrderTimeline as PurchaseTimeline };
