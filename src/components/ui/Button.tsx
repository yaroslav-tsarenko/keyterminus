"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { ArrowBigRight } from "lucide-react";
import { buttonClasses, isTextVariant, type ButtonVariant } from "./button-classes";
import { FlapLoader } from "./Flap";

export { buttonClasses };

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: "primary" | "danger" | "success" | "warning" | "default";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  arrow?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  as?: React.ElementType;
  href?: string;
  target?: string;
  download?: boolean;
  onPress?: () => void;
  className?: string;
  [key: string]: unknown;
}

export function ButtonLoader({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 flex items-center justify-center", className)}>
      <FlapLoader size={16} label="Working" />
    </span>
  );
}

export function Button({
  variant = "primary",
  color,
  size = "md",
  isLoading = false,
  isDisabled = false,
  isIconOnly = false,
  fullWidth = false,
  arrow = false,
  startContent,
  endContent,
  as,
  href,
  target,
  download,
  onPress,
  children,
  className,
  onClick,
  onMouseDown,
  disabled,
  ...rest
}: ButtonProps) {
  const inert = isDisabled || Boolean(disabled);
  const blocked = inert || isLoading;
  const classes = buttonClasses({ variant, color, size, isIconOnly, fullWidth, disabled: inert, className });
  const isText = isTextVariant(variant, color as never);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (blocked) {
      e.preventDefault();
      return;
    }
    (onClick as ((event: React.MouseEvent<HTMLElement>) => void) | undefined)?.(e);
    onPress?.();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    (onMouseDown as ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined)?.(e);
    const active = document.activeElement;
    if (!e.defaultPrevented && active instanceof HTMLElement && active.matches("input, textarea, select")) e.preventDefault();
  };

  const content = isIconOnly ? (
    <>
      {startContent}
      {children}
      {endContent}
    </>
  ) : (
    <>
      <span data-label="" className={cn("inline-flex items-center gap-2 pt-[2px] [&_svg]:size-[18px] [&_svg]:-mt-[2px]", isLoading && "invisible")}>
        {startContent}
        {children}
        {endContent}
      </span>
      {arrow && !isText ? (
        <span aria-hidden="true" data-arrow-cell="" className={cn("-mr-2 ml-2 flex h-full items-center border-l border-current/25 pl-3 [&_svg]:size-[18px]", isLoading && "invisible")}>
          <ArrowBigRight />
        </span>
      ) : arrow ? (
        <ArrowBigRight aria-hidden="true" className="size-4" />
      ) : null}
      {isLoading ? <ButtonLoader /> : null}
    </>
  );

  if (as || href) {
    const Component = (as || "a") as React.ElementType;
    return (
      <Component
        href={href}
        target={target}
        download={download}
        className={classes}
        onClick={handleClick}
        aria-disabled={inert || undefined}
        aria-busy={isLoading || undefined}
        {...rest}
      >
        {content}
      </Component>
    );
  }

  return (
    <button
      type={(rest.type as "button" | "submit" | "reset" | undefined) || "button"}
      className={classes}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      disabled={inert}
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
