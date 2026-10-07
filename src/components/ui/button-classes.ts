import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "danger" | "danger-soft" | "light" | "flat" | "bordered" | "account";
export type ButtonColor = "primary" | "danger" | "success" | "warning" | "default";
type Kind = "go" | "sign" | "link" | "danger" | "danger-link";

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "h-9 px-3.5 text-[0.875rem]",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-[52px] px-6 text-[1rem]",
};

const TEXT_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "min-h-9 text-ui-sm",
  md: "min-h-11 text-ui-md",
  lg: "min-h-[52px] text-step-0",
};

function resolveKind(variant: ButtonVariant, color?: ButtonColor): Kind {
  if (color === "danger") {
    return variant === "flat" || variant === "light" || variant === "ghost" || variant === "tertiary" || variant === "danger-soft" ? "danger-link" : "danger";
  }
  switch (variant) {
    case "secondary":
    case "outline":
    case "bordered":
    case "account":
      return "sign";
    case "tertiary":
    case "ghost":
    case "light":
    case "flat":
      return "link";
    case "danger":
      return "danger";
    case "danger-soft":
      return "danger-link";
    default:
      return "go";
  }
}

const PRESS = "active:translate-y-px";

function kindClasses(kind: Kind, disabled: boolean) {
  if (kind === "go") {
    if (disabled) return "rounded-control border border-line bg-surface-1 text-ink-subtle";
    return cn("rounded-control border border-accent-edge bg-brand text-on-brand hover-device:hover:bg-brand-hover active:bg-brand-hover", PRESS);
  }
  if (kind === "danger") {
    if (disabled) return "rounded-control border border-line bg-surface-1 text-ink-subtle";
    return cn("rounded-control bg-danger text-on-danger hover-device:hover:bg-[color-mix(in_srgb,var(--color-danger)_94%,black)]", PRESS);
  }
  if (kind === "sign") {
    if (disabled) return "rounded-control border-[1.5px] border-line text-ink-subtle";
    return cn(
      "rounded-control border-[1.5px] border-ink bg-transparent text-ink hover-device:hover:bg-surface-1",
      "in-data-[surface=board]:border-on-board in-data-[surface=board]:text-on-board in-data-[surface=board]:hover-device:hover:bg-flap",
      PRESS,
    );
  }
  const base = "btn-text font-sans font-semibold";
  if (kind === "danger-link") {
    if (disabled) return cn(base, "text-ink-subtle");
    return cn(base, "text-danger");
  }
  if (disabled) return cn(base, "text-ink-subtle");
  return cn(base, "text-ink in-data-[surface=board]:text-on-board");
}

export function buttonClasses({
  variant = "primary",
  color,
  size = "md",
  isIconOnly = false,
  fullWidth = false,
  disabled = false,
  className,
}: {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: "sm" | "md" | "lg";
  isIconOnly?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const kind = resolveKind(variant, color);
  if (isIconOnly) {
    if (kind === "sign" || kind === "go") {
      return cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center touch-device:size-11 transition-[color,background-color,border-color,transform] duration-[120ms]",
        kindClasses(kind, disabled),
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      );
    }
    return cn(
      "relative inline-flex size-10 shrink-0 items-center justify-center rounded-control touch-device:size-11 transition-colors duration-[120ms]",
      disabled
        ? "cursor-not-allowed text-ink-subtle"
        : cn(kind === "danger" || kind === "danger-link" ? "text-danger" : "text-ink in-data-[surface=board]:text-on-board", "cursor-pointer hover-device:hover:bg-surface-1 in-data-[surface=board]:hover-device:hover:bg-flap active:translate-y-px"),
      className,
    );
  }
  const isText = kind === "link" || kind === "danger-link";
  return cn(
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none leading-none",
    !isText && "font-display font-bold tracking-[0.005em]",
    "transition-[transform,color,background-color,border-color] duration-[120ms] ease-[var(--ease-sign)]",
    "focus-visible:outline-offset-2",
    isText ? TEXT_SIZE[size] : SIZE[size],
    kindClasses(kind, disabled),
    disabled ? "cursor-not-allowed" : "cursor-pointer",
    fullWidth && "w-full",
    className,
  );
}

export function isTextVariant(variant: ButtonVariant = "primary", color?: ButtonColor) {
  const kind = resolveKind(variant, color);
  return kind === "link" || kind === "danger-link";
}
