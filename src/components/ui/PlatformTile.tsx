import { cn } from "@/lib/utils/cn";
import { platformInfo } from "@/lib/catalog/platforms";

export type PlatformTileSize = "xs" | "sm" | "md" | "lg";

const SIZE: Record<PlatformTileSize, string> = {
  xs: "h-[22px] min-w-[18px] px-[3px] text-[0.75rem]",
  sm: "h-[30px] min-w-[24px] px-1 text-[0.9375rem]",
  md: "h-[52px] min-w-[40px] px-1.5 text-[1.625rem]",
  lg: "h-[84px] min-w-[64px] px-2 text-[2.75rem]",
};

export function PlatformTile({ platform, number, size = "xs", className, ...rest }: { platform?: string | null; number?: number | null; size?: PlatformTileSize; className?: string; "data-gate"?: string }) {
  const n = number !== undefined ? number : platformInfo(platform).number;
  return (
    <span
      aria-hidden="true"
      data-platform-tile=""
      data-hinge={size === "md" || size === "lg" ? "2" : undefined}
      className={cn("flap w-auto shrink-0 tabular", SIZE[size], className)}
      {...rest}
    >
      <span className="flap-glyph">{n ?? "–"}</span>
    </span>
  );
}

export function PlatformSign({
  platform,
  size = "xs",
  onBoard = false,
  className,
  nameClassName,
  label,
}: {
  platform: string | null | undefined;
  size?: PlatformTileSize;
  onBoard?: boolean;
  className?: string;
  nameClassName?: string;
  label?: string;
}) {
  const info = platformInfo(platform);
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <PlatformTile number={info.number} size={size} />
      <span className={cn("truncate font-display font-bold", onBoard ? "text-on-board" : "text-ink", nameClassName)}>{label ?? info.short}</span>
    </span>
  );
}
