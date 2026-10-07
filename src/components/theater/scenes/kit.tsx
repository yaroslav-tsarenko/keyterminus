import type { ReactNode } from "react";
import { IdCard, Search, Ticket } from "lucide-react";
import { Mark, Wordmark } from "@/components/layout/BrandMark";
import { FlapCounter } from "@/components/ui/Flap";
import { cn } from "@/lib/utils/cn";
import type { DeviceKind } from "../types";

function SearchField({ query, placeholder, focused, phone }: { query: string; placeholder: string; focused: boolean; phone: boolean }) {
  return (
    <div
      data-demo="search"
      className={cn(
        "flex h-10 min-w-0 items-center gap-2.5 rounded-control border bg-raised px-3",
        phone ? "w-full" : "max-w-[460px] flex-1",
        focused ? "border-ink outline-2 outline-offset-2 outline-focus" : "border-control",
      )}
    >
      <Search size={18} aria-hidden="true" className="shrink-0 text-ink" />
      <span className={cn("min-w-0 flex-1 truncate pt-0.5 text-ui-md", query ? "text-ink" : "text-ink-subtle")}>
        {query || placeholder}
        {focused ? <span className="th-caret" /> : null}
      </span>
      {phone ? null : (
        <span aria-hidden="true" className="flap text-[0.75rem]">
          <span className="flap-glyph">/</span>
        </span>
      )}
    </div>
  );
}

export function DemoHeader({ device, query = "", placeholder = "Search keys", focused = false, cart = 0, children }: { device: DeviceKind; query?: string; placeholder?: string; focused?: boolean; cart?: number; children?: ReactNode }) {
  const phone = device === "phone";
  return (
    <div className="shrink-0 border-b border-line bg-rig">
      <div className={cn("flex items-center gap-6", phone ? "h-14 px-4" : "h-16 px-6")}>
        {phone ? <Mark size="small" className="h-[26px] w-auto shrink-0 text-ink" /> : <Wordmark className="h-[28px] w-auto shrink-0 text-ink" />}
        {phone ? <span className="flex-1" /> : <SearchField query={query} placeholder={placeholder} focused={focused} phone={false} />}
        {phone ? null : <span className="flex-1" />}
        {phone ? null : (
          <span className="inline-flex items-center gap-2 font-display text-ui-md font-bold text-ink">
            <IdCard size={20} aria-hidden="true" />
            <span className="pt-0.5">Account</span>
          </span>
        )}
        <span data-demo="cart" className="inline-flex items-center gap-2 font-display text-ui-md font-bold text-ink">
          <Ticket size={20} aria-hidden="true" />
          {phone ? null : <span className="pt-0.5">Cart</span>}
          <FlapCounter value={cart} size="xs" />
        </span>
      </div>
      {phone ? (
        <div className="px-4 pb-3">
          <SearchField query={query} placeholder={placeholder} focused={focused} phone />
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function DemoPage({ children, className, scroll }: { children: ReactNode; className?: string; scroll?: string }) {
  return (
    <div data-demo-scroll={scroll} className={cn("min-h-0 flex-1 overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function DemoScreen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex h-full flex-col bg-surface", className)}>{children}</div>;
}

const NAV = ["Overview", "Keys", "Orders", "Saved", "Profile"];

export function AccountNav({ active = "Keys" }: { active?: string }) {
  return (
    <nav className="w-[188px] shrink-0">
      <ul className="m-0 list-none p-0">
        {NAV.map((item) => (
          <li key={item} className={cn("relative flex min-h-11 items-center pl-4 font-display text-ui-md", item === active ? "font-bold text-ink" : "text-ink-muted")}>
            {item === active ? <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] bg-brand" /> : null}
            <span className="pt-0.5">{item}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
