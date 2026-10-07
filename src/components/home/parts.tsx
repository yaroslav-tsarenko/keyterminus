import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowBigRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SectionHeading({ id, eyebrow, title, lead, className, size = "h2" }: { id: string; eyebrow?: string; title: ReactNode; lead?: ReactNode; className?: string; size?: "h2" | "large" }) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="eyebrow m-0 mb-4" data-anim="sign">
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} data-anim="sign" className={cn("m-0 text-ink", size === "large" ? "text-step-5 leading-none tracking-[-0.02em]" : "text-step-4 leading-[1.06] tracking-[-0.015em]")}>
        {title}
      </h2>
      {lead ? (
        <p className="m-0 mt-4 max-w-[52ch] text-step-0 leading-[1.6] text-ink-muted" data-anim="sign">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export function SignLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("btn-text inline-flex min-h-11 items-center gap-2 text-ui-md font-semibold text-ink", className)}>
      <span data-label="" className="pt-0.5">
        {children}
      </span>
      <ArrowBigRight size={18} aria-hidden="true" />
    </Link>
  );
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-GB");
}
