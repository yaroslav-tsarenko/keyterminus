"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Copy, EyeOff, MessageCircleWarning, MoveUpRight, OctagonX, ScanEye } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Flap, FlapLoader } from "@/components/ui/Flap";
import { Modal } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { GateLine, productFace } from "@/components/product/ProductCard";
import { ActivationStepList } from "@/components/product/ActivationSteps";
import { activationFor } from "@/config/activation";
import { STORE_POLICY } from "@/config/store-policy";
import { useAuth } from "@/providers/AuthProvider";
import type { KeySummary } from "@/lib/keys/taxonomy";
import { flapDuration, flapFrame } from "@/lib/motion/flap";

export type KeyBoardStatus = "issuing" | "ready" | "reported" | "replaced" | "refunded";
export type KeyPlateStatus = KeyBoardStatus;

const MASKS: Record<string, number[]> = {
  xbox: [5, 5, 5, 5, 5],
  playstation: [4, 4, 4],
  nintendo: [4, 4, 4, 4],
};

const SEPARATOR = /[-–—\s]/;
const REVEAL_MS = 1100;

function maskGroups(platform: string | null | undefined): number[] {
  return MASKS[platform ?? ""] ?? [5, 5, 5];
}

function groupsOf(value: string): string[] {
  const groups: string[] = [];
  let current = "";
  for (const ch of Array.from(value)) {
    current += ch;
    if (SEPARATOR.test(ch)) {
      groups.push(current);
      current = "";
    }
  }
  if (current) groups.push(current);
  return groups;
}

export function spellOut(value: string): string {
  return Array.from(value)
    .map((ch) => {
      if (SEPARATOR.test(ch)) return ch === " " ? "(space)" : "–";
      if (ch === "0") return "zero";
      if (ch === "O") return "O(letter)";
      if (ch === "1") return "one";
      if (ch === "I") return "I(letter)";
      if (ch === "l") return "l(lower L)";
      if (/[a-z]/.test(ch)) return `${ch}(lower)`;
      return ch;
    })
    .join(" ");
}

export function KeyFlaps({ value, masked, platform, progress, className, demoId }: { value: string; masked: boolean; platform?: string | null; progress?: number; className?: string; demoId?: string }) {
  if (masked || !value) {
    return (
      <div data-key-flaps="" data-demo={demoId} aria-hidden="true" className={cn("flex flex-wrap gap-x-3 gap-y-2 text-key", className)}>
        {maskGroups(platform).map((n, gi) => (
          <span key={gi} className="flap-row">
            {Array.from({ length: n }, (_, i) => (
              <Flap key={i} char=" " size="key" />
            ))}
          </span>
        ))}
      </div>
    );
  }
  const total = flapDuration("", value, value.length);
  const t = progress === undefined ? Infinity : progress * total;
  let index = 0;
  return (
    <div data-key-flaps="" data-demo={demoId} aria-hidden="true" className={cn("flex flex-wrap gap-y-2 text-key", className)}>
      {groupsOf(value).map((group, gi) => (
        <span key={gi} className="flap-row mr-[3px]">
          {Array.from(group).map((ch) => {
            const i = index++;
            const frame = t === Infinity ? null : flapFrame(" ", ch, i, t);
            const shown = frame ? (frame.done ? ch : frame.bottom) : ch;
            return <Flap key={i} char={shown} size="key" />;
          })}
        </span>
      ))}
    </div>
  );
}

export const KeySlots = KeyFlaps;

function stamp(iso: string | null | undefined) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

const STATUS: Record<KeyBoardStatus, { label: string; tone: string } | null> = {
  issuing: null,
  ready: { label: "Ready", tone: "bg-board-success text-board-success" },
  reported: { label: "Reported", tone: "bg-board-warning text-board-warning" },
  replaced: { label: "Replaced", tone: "bg-board-info text-board-info" },
  refunded: { label: "Refunded", tone: "bg-on-board-muted text-on-board-muted" },
};

const REASONS = ["Already redeemed", "Invalid key", "Wrong region", "Wrong product", "Other"];

export interface KeyBoardProps {
  keyId: string;
  title: string;
  productSlug?: string | null;
  keyInfo?: KeySummary | null;
  index?: number;
  total?: number;
  status: KeyBoardStatus;
  keyType?: string;
  revealedBefore?: boolean;
  issuedAt?: string | null;
  revealedAt?: string | null;
  orderNumber?: string;
  activationNotes?: string[];
  refundedAt?: string | null;
  demo?: boolean;
  justIssued?: boolean;
  demoValue?: string;
  demoState?: { masked: boolean; decrypt: number; copied: boolean };
  className?: string;
  children?: ReactNode;
}

export type KeyPlateProps = KeyBoardProps;

type Revealed = { value: string; type: string; revealedAt: string | null };

function useReveal(active: boolean): number | undefined {
  const [progress, setProgress] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / REVEAL_MS);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setProgress(undefined);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return progress;
}

export function KeyBoard({
  keyId,
  title,
  productSlug,
  keyInfo,
  index,
  total,
  status,
  keyType = "text",
  revealedBefore = false,
  issuedAt,
  revealedAt,
  orderNumber,
  activationNotes = [],
  refundedAt,
  demo = false,
  justIssued = false,
  demoValue,
  demoState,
  className,
}: KeyBoardProps) {
  const face = productFace(title, keyInfo ?? null);
  const guide = activationFor(keyInfo?.platform);
  const { user } = useAuth();
  const baseId = useId();
  const copyRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"ok" | "failed" | null>(null);
  const [announce, setAnnounce] = useState("");
  const [open, setOpen] = useState<"steps" | "notes" | "spell" | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(status === "reported");
  const firstReveal = revealed?.revealedAt ?? revealedAt ?? null;
  const effective: KeyBoardStatus = reported && status === "ready" ? "reported" : status;
  const badge = STATUS[effective];
  const controlled = demo && demoState ? demoState : null;
  const masked = controlled ? controlled.masked : !revealed;
  const value = controlled ? (controlled.masked ? "" : (demoValue ?? "")) : (revealed?.value ?? "");
  const copyState = controlled ? (controlled.copied ? "ok" : null) : copied;
  const pin = /\bPIN[:\s]+(\S+)/i.exec(value);
  const code = pin ? value.slice(0, pin.index).replace(/[\s:,;-]+(code)?$/i, "").replace(/^code[:\s]+/i, "").trim() : value;
  const flipping = useReveal(revealCount > 0 && !controlled);
  const progress = controlled && !controlled.masked ? controlled.decrypt : flipping;

  useEffect(() => {
    if (revealCount > 0) copyRef.current?.focus();
  }, [revealCount]);

  const reveal = async () => {
    if (demo) {
      setRevealed({ value: demoValue ?? "", type: "text", revealedAt: null });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/keys/${encodeURIComponent(keyId)}`, { method: "POST", cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || typeof body.key !== "string") throw new Error(res.status === 429 ? "Too many requests. Wait a minute and try again." : "We couldn’t show this key. Contact us with your order number.");
      setRevealed({ value: body.key, type: typeof body.type === "string" ? body.type : keyType, revealedAt: typeof body.revealedAt === "string" ? body.revealedAt : null });
      setRevealCount((n) => n + 1);
      setAnnounce("Key revealed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t show this key.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("ok");
      setAnnounce("Key copied");
      window.setTimeout(() => setCopied((c) => (c === "ok" ? null : c)), 2000);
    } catch {
      setCopied("failed");
      const node = textRef.current;
      if (node) {
        node.classList.remove("sr-only");
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  const isImage = (revealed?.type ?? keyType) === "image" || /^data:image\//.test(value);
  const linkCls = "btn-text min-h-10 cursor-pointer text-ui-sm font-semibold text-on-board";

  if (effective === "replaced") {
    return (
      <article data-key-board="" data-status="replaced" className={cn("w-full max-w-[760px] border-b border-line py-3", className)}>
        <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-ui-md text-ink-muted">
          <span className="font-semibold text-ink line-through decoration-ink-subtle">{face.title}</span>
          <span>Replaced{issuedAt ? ` on ${stamp(issuedAt)}` : ""}. The replacement key is on its own board.</span>
        </p>
      </article>
    );
  }

  return (
    <article
      data-key-board=""
      data-surface="board"
      data-issued={justIssued ? "" : undefined}
      data-state={masked ? "masked" : "revealed"}
      data-status={effective}
      className={cn("board relative w-full max-w-[760px] p-4 sm:p-5", className)}
    >
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          {total && total > 1 && index ? (
            <span className="label-caps text-on-board-muted">
              Key {index} of {total}
            </span>
          ) : null}
          <GateLine face={face} surface="board" />
        </div>
        {badge ? (
          <span className={cn("inline-flex items-center gap-2 font-display text-ui-sm font-bold", badge.tone.split(" ")[1])}>
            <span aria-hidden="true" className={cn("size-1.5", badge.tone.split(" ")[0])} />
            <span className="pt-px">{badge.label}</span>
          </span>
        ) : null}
      </header>

      <h3 className="m-0 mt-3 font-display text-step-1 font-bold leading-[1.3] tracking-normal text-on-board">
        {productSlug && !demo ? (
          <Link href={`/product/${productSlug}`} className="decoration-remark decoration-2 underline-offset-[3px] hover-device:hover:underline">
            {face.title}
          </Link>
        ) : (
          face.title
        )}
      </h3>

      <div className="mt-5">
        {effective === "issuing" ? (
          <div className="flex flex-col gap-3">
            <KeyFlaps value="" masked platform={keyInfo?.platform} />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <FlapLoader label="Issuing your key" showLabel className="font-display text-ui-md font-bold [&_.meta]:text-on-board" />
              <p className="m-0 text-ui-md text-on-board-muted">Usually within minutes after payment is confirmed.</p>
            </div>
          </div>
        ) : effective === "refunded" ? (
          <p className="m-0 text-ui-md text-on-board">Refunded to your card{refundedAt ? ` on ${stamp(refundedAt)}` : ""}.</p>
        ) : isImage && revealed ? (
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[16/9] max-w-[480px] overflow-hidden rounded-board bg-flap">
              <Image src={value} alt={`Key image for ${face.title}`} fill unoptimized sizes="480px" className="object-contain" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as="a" href={value} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                Open full size
              </Button>
              <Button as="a" href={value} download={true} variant="outline" size="sm">
                Download image
              </Button>
            </div>
          </div>
        ) : pin && revealed ? (
          <dl className="m-0 flex flex-col gap-4">
            {[
              ["Code", code],
              ["PIN", pin[1]],
            ].map(([label, part]) => (
              <div key={label} className="flex flex-wrap items-center gap-4">
                <dt className="label-caps w-12 text-on-board-muted">{label}</dt>
                <dd className="m-0 flex flex-wrap items-center gap-3">
                  <KeyFlaps value={part} masked={false} progress={progress} />
                  <Button variant="outline" size="sm" onPress={() => copy(part)} startContent={<Copy size={16} aria-hidden="true" />}>
                    Copy {label === "PIN" ? "PIN" : "code"}
                  </Button>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <>
            <KeyFlaps value={value} masked={masked} platform={keyInfo?.platform} progress={progress} demoId={demo ? "key" : undefined} />
            {revealed ? (
              <span ref={textRef} className="key-code sr-only">
                {value}
              </span>
            ) : (
              <span className="sr-only">The key is hidden. Choose Reveal key to show it.</span>
            )}
          </>
        )}
      </div>

      {effective === "ready" || effective === "reported" ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {masked ? (
            <Button onPress={reveal} isLoading={busy} startContent={<ScanEye size={18} aria-hidden="true" />} data-demo={demo ? "reveal" : undefined}>
              Reveal key
            </Button>
          ) : (
            <>
              {!isImage && !pin ? (
                <Button ref={copyRef} variant="outline" onPress={() => copy(value)} startContent={copyState === "ok" ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />} data-demo={demo ? "copy" : undefined}>
                  {copyState === "ok" ? "Copied" : "Copy key"}
                </Button>
              ) : null}
              {guide?.redeemUrl ? (
                <Button as="a" href={guide.redeemUrl} target="_blank" rel="noopener noreferrer" variant="outline" endContent={<MoveUpRight size={16} aria-hidden="true" />} data-demo={demo ? "redeem" : undefined}>
                  Redeem on {guide.name}
                </Button>
              ) : null}
              <Button variant="ghost" onPress={() => setRevealed(null)} startContent={<EyeOff size={18} aria-hidden="true" />}>
                Hide
              </Button>
            </>
          )}
        </div>
      ) : null}
      {copied === "failed" ? <p className="m-0 mt-2 text-ui-sm text-on-board-muted">Press Ctrl+C / ⌘C to copy.</p> : null}
      {error ? (
        <p role="alert" className="m-0 mt-4 flex items-start gap-2 text-ui-md text-board-danger">
          <OctagonX size={16} aria-hidden="true" className="mt-0.5" />
          {error}
        </p>
      ) : null}
      {effective === "reported" ? (
        <p className="m-0 mt-4 text-ui-md text-on-board">
          We’re checking it. We reply {STORE_POLICY.support.replyTime}.
        </p>
      ) : null}

      {issuedAt || firstReveal ? (
        <p className="m-0 mt-5 font-mono text-[0.75rem] text-on-board-muted">
          {[issuedAt ? `Issued ${stamp(issuedAt)}` : null, firstReveal ? `First revealed ${stamp(firstReveal)}` : revealedBefore ? "Revealed before" : null].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      {effective !== "issuing" && effective !== "refunded" ? (
        <div className="mt-4 border-t border-board-edge pt-2">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {guide ? (
              <button type="button" aria-expanded={open === "steps"} aria-controls={`${baseId}-steps`} onClick={() => setOpen((o) => (o === "steps" ? null : "steps"))} className={linkCls}>
                <span data-label="">How to redeem on {guide.name}</span>
              </button>
            ) : null}
            {activationNotes.length ? (
              <button type="button" aria-expanded={open === "notes"} aria-controls={`${baseId}-notes`} onClick={() => setOpen((o) => (o === "notes" ? null : "notes"))} className={linkCls}>
                <span data-label="">Activation notes from the publisher</span>
              </button>
            ) : null}
            {revealed && !isImage ? (
              <button type="button" aria-expanded={open === "spell"} aria-controls={`${baseId}-spell`} onClick={() => setOpen((o) => (o === "spell" ? null : "spell"))} className={linkCls}>
                <span data-label="">Spell it out</span>
              </button>
            ) : null}
          </div>
          {open === "steps" && guide ? (
            <div id={`${baseId}-steps`} className="pb-2 pt-2 text-on-board [&_*]:text-on-board">
              <p className="m-0 mb-2 text-ui-sm">You need {guide.need}.</p>
              <ActivationStepList guide={guide} size="sm" />
            </div>
          ) : null}
          {open === "notes" ? (
            <div id={`${baseId}-notes`} className="flex flex-col gap-2 pb-2 pt-2 text-ui-sm text-on-board">
              {activationNotes.map((n, i) => (
                <p key={i} className="m-0 whitespace-pre-line">
                  {n}
                </p>
              ))}
            </div>
          ) : null}
          {open === "spell" && revealed ? (
            <p id={`${baseId}-spell`} className="m-0 pb-2 pt-2 font-mono text-data leading-[1.8] text-on-board [font-feature-settings:'calt'_0]">
              {spellOut(value)}
            </p>
          ) : null}
          {effective === "ready" ? (
            <button type="button" onClick={() => (demo ? undefined : setReportOpen(true))} data-demo={demo ? "report" : undefined} className="btn-text mt-1 inline-flex min-h-10 cursor-pointer items-center gap-2 text-ui-sm font-semibold text-on-board-muted hover-device:hover:text-on-board">
              <MessageCircleWarning size={16} aria-hidden="true" />
              <span data-label="">Key not working? Report it</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {!demo ? (
        <ReportDialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          onSent={() => {
            setReported(true);
            setReportOpen(false);
          }}
          title={face.title}
          keyId={keyId}
          orderNumber={orderNumber ?? ""}
          name={[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || ""}
          email={user?.email ?? ""}
        />
      ) : null}
    </article>
  );
}

export const KeyPlate = KeyBoard;

function ReportDialog({ open, onClose, onSent, title, keyId, orderNumber, name, email }: { open: boolean; onClose: () => void; onSent: () => void; title: string; keyId: string; orderNumber: string; name: string; email: string }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = async () => {
    if (!reason) {
      setError("Choose what happened.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || email,
          email,
          orderNumber,
          subject: "Key not working",
          message: [`Reason: ${reason}.`, `Product: ${title}.`, `Key reference: ${keyId}.`, note.trim() ? `Note: ${note.trim()}` : null].filter(Boolean).join("\n"),
        }),
      });
      if (!res.ok) throw new Error();
      onSent();
    } catch {
      setError("We couldn’t send your report. Try again, or email us with your order number.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report a key that doesn’t work"
      description={`We check it and reply ${STORE_POLICY.support.replyTime}. ${STORE_POLICY.guarantee.headline}.`}
      footer={
        <>
          <Button variant="outline" onPress={onClose}>
            Cancel
          </Button>
          <Button onPress={send} isLoading={busy}>
            Report it
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Select label="What happened?" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Choose a reason" options={REASONS.map((r) => ({ value: r, label: r }))} />
        <Textarea label="Anything else we should know?" hint="Optional. The exact message the platform showed helps us most." value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
        {error ? <Alert tone="danger">{error}</Alert> : null}
      </div>
    </Modal>
  );
}
