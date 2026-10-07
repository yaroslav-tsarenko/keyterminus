import type { ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/company";
import { cn } from "@/lib/utils/cn";

export function CredentialsSheet({ stacked = false, className }: { stacked?: boolean; className?: string }) {
  const rows: { label: string; value: ReactNode; mono?: boolean }[] = [
    { label: "Company number", value: COMPANY.companyNumber, mono: true },
    ...(COMPANY.vatRegistered ? [{ label: "VAT number", value: COMPANY.vatNumber, mono: true }] : []),
    { label: "Registered office", value: `${COMPANY.registeredOffice}, ${COMPANY.country}` },
    {
      label: "Email",
      value: (
        <a href={`mailto:${COMPANY.email}`} className="break-all underline decoration-link decoration-2 underline-offset-[3px] hover-device:hover:text-accent-ink">
          {COMPANY.email}
        </a>
      ),
    },
    ...(COMPANY.phone
      ? [
          {
            label: "Phone",
            mono: true,
            value: (
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="underline decoration-link decoration-2 underline-offset-[3px]">
                {COMPANY.phone}
              </a>
            ),
          },
        ]
      : []),
    { label: "Support hours", value: COMPANY.supportHours },
  ];

  return (
    <section aria-label="Company notice" data-credentials="" className={cn("sign-plate p-5 sm:p-6", className)}>
      <p className="eyebrow m-0 text-ink">Company notice</p>
      <p className="m-0 mt-2 font-display text-step-1 font-bold leading-snug text-ink">
        {BRAND.name} is a trading name of {COMPANY.name}.
      </p>
      <dl className={cn("m-0 mt-4 grid grid-cols-1 border-t border-rule", !stacked && "md:grid-cols-2")}>
        {rows.map((row) => (
          <div key={row.label} className={cn("grid min-w-0 grid-cols-[minmax(0,10rem)_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-2.5", !stacked && "md:odd:pr-6 md:even:pl-6")}>
            <dt className="eyebrow">{row.label}</dt>
            <dd className={cn("m-0 min-w-0 text-ink", row.mono ? "font-mono text-data" : "text-ui-md")}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
