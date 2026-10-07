"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { ListCheck, ListPlus, TicketCheck, TicketPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { Tag } from "@/components/ui/Tag";
import { FlapLoader, FlapRow, SkeletonBar } from "@/components/ui/Flap";
import { PlatformTile } from "@/components/ui/PlatformTile";
import { itemQuantityCap } from "@/lib/pricing";
import type { KeySummary } from "@/lib/keys/taxonomy";
import { Cover, COVER_SIZES, type CoverAspect } from "./Cover";
import { productFace, type CatalogProduct, type ProductFace } from "./product-face";

export { productFace, type CatalogProduct, type ProductFace };

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function gateSentence(face: ProductFace, edition = false) {
  return [`Activates on ${face.platformShort}.`, `Region: ${face.region ?? face.regionTag}.`, face.kind === "game" ? null : `${face.typeSentence}.`, edition && face.edition ? `${face.edition}.` : null].filter(Boolean).join(" ");
}

export function GateLine({
  face,
  size = "sm",
  edition = false,
  surface = "page",
  extra,
  className,
  demoId,
}: {
  face: ProductFace;
  size?: "sm" | "md";
  edition?: boolean;
  surface?: "page" | "board";
  extra?: ReactNode;
  className?: string;
  demoId?: string;
}) {
  if (!face.platform) return null;
  const md = size === "md";
  const board = surface === "board";
  return (
    <p data-gate-line="" data-demo={demoId} className={cn("m-0 flex min-w-0 flex-wrap items-center gap-y-1.5", md ? "gap-x-2.5 text-[0.875rem]" : "gap-x-2 text-[0.75rem]", className)}>
      <span className="sr-only">{gateSentence(face, edition)}</span>
      <span aria-hidden="true" className={cn("flex min-w-0 max-w-full items-center", md ? "gap-2.5" : "gap-2")}>
        <PlatformTile number={face.platformNumber} size={md ? "sm" : "xs"} />
        <span className={cn("truncate pt-px font-display font-bold uppercase leading-none tracking-[0.1em] [font-size:inherit]", board ? "text-on-board" : "text-ink")}>{face.platformShort}</span>
        <span className={cn("font-mono leading-none", board ? "text-on-board-faint" : "text-ink-subtle")}>·</span>
        <span className={cn("min-w-0 shrink truncate font-mono font-semibold uppercase leading-none", board ? "text-on-board-muted" : "text-ink")}>{face.regionTag}</span>
      </span>
      {face.typeTag ? (
        <span aria-hidden="true" className="flex shrink-0 items-center gap-2">
          <span className={cn("font-mono leading-none", board ? "text-on-board-faint" : "text-ink-subtle")}>·</span>
          <Tag variant="type" size="sm">
            {face.typeTag}
          </Tag>
        </span>
      ) : null}
      {edition && face.edition ? (
        <span aria-hidden="true" className="shrink-0">
          <Tag variant="edition" size="sm">
            {face.edition}
          </Tag>
        </span>
      ) : null}
      {extra}
    </p>
  );
}

export const LabelRow = GateLine;

export function GateStrip({ face, size = "sm", className }: { face: ProductFace; size?: "sm" | "md"; className?: string }) {
  if (!face.platform) return null;
  const md = size === "md";
  return (
    <div data-surface="board" data-gate-strip="" aria-hidden="true" className={cn("gate-strip justify-between", md ? "h-9 px-3" : "h-[30px] px-2.5", className)}>
      <span className="flex min-w-0 items-center gap-2">
        <PlatformTile number={face.platformNumber} size={md ? "sm" : "xs"} data-gate="" className={md ? "h-[26px]" : "h-[20px]"} />
        <span className={cn("truncate pt-px font-display font-bold uppercase leading-none tracking-[0.1em] text-on-board", md ? "text-[0.8125rem]" : "text-[0.75rem]")}>{face.platformShort}</span>
      </span>
      <span className={cn("shrink-0 font-mono font-semibold uppercase leading-none text-on-board-muted", md ? "text-[0.8125rem]" : "text-[0.75rem]")}>{face.regionTag}</span>
    </div>
  );
}

export function useAddToCart(product: CatalogProduct) {
  const { addItem, cart, openSheet } = useCart();
  const price = toNumber(product.price) ?? 0;
  const imageUrl = product.imageUrl ?? product.images?.[0]?.url ?? null;
  const inCart = cart.items.some((item) => item.productId === product.id);
  const add = (source?: Element | null, quantity = 1) => {
    window.dispatchEvent(new CustomEvent("keyterminus:cart-add", { detail: { productId: product.id, source: source ?? null } }));
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku ?? product.id,
      price,
      quantity,
      imageUrl,
      maxQuantity: itemQuantityCap(product.quantity, product.key?.productType),
      key: product.key ?? undefined,
    });
  };
  return { add, inCart, openSheet, price, imageUrl };
}

export function SaveButton({ productId, title, className }: { productId: string; title: string; className?: string }) {
  const { isSaved, toggle, pending } = useWishlist();
  const saved = isSaved(productId);
  const Icon = saved ? ListCheck : ListPlus;
  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={saved}
      aria-label={saved ? `Saved: ${title}` : `Save ${title}`}
      disabled={pending(productId)}
      className={cn(
        "relative z-[3] flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-control transition-colors duration-[120ms] touch-device:size-11 hover-device:hover:bg-surface-1 disabled:cursor-wait",
        saved ? "text-ink" : "text-ink-muted hover-device:hover:text-ink",
        className,
      )}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}

export interface ProductCardProps {
  product: CatalogProduct;
  variant?: "standard" | "feature";
  priority?: boolean;
  sizes?: string;
  headingLevel?: 2 | 3 | 4;
  showCompare?: boolean;
  className?: string;
  aspect?: CoverAspect;
  readout?: ReactNode;
  fill?: boolean;
  demo?: boolean;
  demoId?: string;
  demoCover?: ReactNode;
}

export function ProductCard({ product, variant = "standard", priority, sizes, headingLevel = 3, showCompare = true, className, aspect, readout, demo = false, demoId, demoCover }: ProductCardProps) {
  if (variant === "feature") return <FeatureCard product={product} priority={priority} headingLevel={headingLevel} className={className} />;
  return <DepartureCard product={product} priority={priority} sizes={sizes} headingLevel={headingLevel} showCompare={showCompare} className={className} aspect={aspect} readout={readout} demo={demo} demoId={demoId} demoCover={demoCover} />;
}

function AddControl({ product, title, onAdd, adding }: { product: CatalogProduct; title: string; onAdd: (e: MouseEvent<HTMLElement>) => void; adding: boolean }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Add ${title} to cart`}
      aria-busy={adding || undefined}
      data-add=""
      data-product-id={product.id}
      className={cn(
        "relative z-[3] flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-control border-[1.5px] border-ink bg-transparent text-ink transition-[background-color,border-color,color,transform] duration-[180ms] ease-[var(--ease-sign)] touch-device:size-11",
        "active:translate-y-px",
        "hover-device:group-hover/card:border-accent-edge hover-device:group-hover/card:bg-brand hover-device:group-hover/card:text-on-brand",
        "group-focus-within/card:border-accent-edge group-focus-within/card:bg-brand group-focus-within/card:text-on-brand",
      )}
    >
      {adding ? <FlapLoader size={16} label="Adding" /> : <TicketPlus size={18} aria-hidden="true" />}
    </button>
  );
}

function InCartControl({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="relative z-[3] inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-control border-[1.5px] border-ink px-2.5 font-display text-ui-sm font-bold text-ink hover-device:hover:bg-surface-1 touch-device:h-11"
    >
      <TicketCheck size={18} aria-hidden="true" />
      <span className="pt-0.5">In cart</span>
    </button>
  );
}

export function DepartureCard({
  product,
  priority,
  sizes,
  headingLevel = 3,
  showCompare = true,
  className,
  aspect,
  readout,
  demo = false,
  demoId,
  demoCover,
}: Omit<ProductCardProps, "variant" | "fill">) {
  const { add, inCart, openSheet, price, imageUrl } = useAddToCart(product);
  const [adding, setAdding] = useState(false);
  const face = productFace(product.name, product.key);
  const compare = showCompare ? toNumber(product.comparePrice) : null;
  const outOfStock = product.quantity !== undefined && product.quantity <= 0;
  const href = `/product/${product.slug}`;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  const onAdd = (event: MouseEvent<HTMLElement>) => {
    if (demo) return;
    setAdding(true);
    add(event.currentTarget.closest("[data-card]"));
    window.setTimeout(() => setAdding(false), 160);
  };

  const title = demo ? (
    <span data-card-link="" className="line-clamp-2 min-h-[2.5em] [overflow-wrap:anywhere]">
      {face.title}
    </span>
  ) : (
    <Link href={href} data-card-link="" className="line-clamp-2 min-h-[2.5em] outline-none [overflow-wrap:anywhere] after:absolute after:inset-0 after:z-[2]">
      {face.title}
    </Link>
  );

  return (
    <article data-card="" data-departure="" data-product="" data-demo={demoId} data-stock={outOfStock ? "out" : "in"} className={cn("departure group/card", className)}>
      <p className="sr-only">{gateSentence(face)}</p>
      <GateStrip face={face} />
      <Cover
        src={imageUrl}
        alt={`${face.title} cover art`}
        aspect={aspect ?? "3/4"}
        priority={priority}
        sizes={sizes ?? COVER_SIZES.card}
        platformLabel={face.platformShort}
        platformNumber={face.platformNumber}
        className={cn(outOfStock && "opacity-55")}
        art={demoCover}
      />
      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <Heading className="m-0 font-display text-step-0 font-bold leading-[1.25] tracking-[-0.005em] text-ink xl:text-[1.0625rem]">{title}</Heading>
        <p className="m-0 mt-1 flex min-h-[1.45em] min-w-0 items-center gap-2 text-ui-sm leading-[1.45] text-ink-muted">
          {outOfStock ? (
            <Tag variant="neutral" size="sm">
              Not in stock
            </Tag>
          ) : null}
          <span className="min-w-0 truncate">{face.facts ?? ""}</span>
          {face.typeTag && !outOfStock ? (
            <Tag variant="type" size="sm" className="ml-auto">
              {face.typeTag}
            </Tag>
          ) : null}
        </p>
        {readout}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {outOfStock ? (
              <span className="flex flex-col gap-0.5 text-ui-sm text-ink-muted">
                <span>Last price</span>
                <PriceDisplay price={price} size="sm" className="[&_[data-price]]:text-ink-muted" />
              </span>
            ) : (
              <PriceDisplay price={price} comparePrice={compare} size="sm" />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {demo ? null : <SaveButton productId={product.id} title={face.title} className="max-sm:hidden" />}
            {outOfStock ? null : inCart && !demo ? <InCartControl onPress={openSheet} /> : <AddControl product={product} title={face.title} onAdd={onAdd} adding={adding} />}
          </div>
        </div>
      </div>
    </article>
  );
}

export const DepositBox = DepartureCard;

export function FeatureCard({ product, priority, headingLevel = 3, className }: { product: CatalogProduct; priority?: boolean; headingLevel?: 2 | 3 | 4; className?: string }) {
  const { add, inCart, openSheet, price, imageUrl } = useAddToCart(product);
  const [adding, setAdding] = useState(false);
  const face = productFace(product.name, product.key);
  const compare = toNumber(product.comparePrice);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const shot = product.screenshotUrl ?? null;
  return (
    <article data-card="" data-departure="" data-feature="" data-product="" className={cn("departure group/card", className)}>
      <p className="sr-only">{gateSentence(face, true)}</p>
      <GateStrip face={face} size="md" />
      <div className="relative">
        {shot ? (
          <Cover src={shot} alt={`${face.title} screenshot 1`} aspect="16/9" fit="cover" priority={priority} sizes="(min-width: 1024px) 640px, 100vw" />
        ) : (
          <Cover src={imageUrl} alt={`${face.title} cover art`} aspect="16/9" fit="contain" priority={priority} sizes="(min-width: 1024px) 640px, 100vw" platformLabel={face.platformShort} platformNumber={face.platformNumber} />
        )}
        {shot ? (
          <div className="absolute bottom-3 left-3 z-[2] w-[32%] rounded-sign bg-raised p-px">
            <Cover src={imageUrl} alt="" aspect="3/4" sizes="220px" className="rounded-[3px]" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-4 sm:px-5">
        <GateLine face={face} size="md" edition />
        <Heading className="m-0 text-step-3 font-extrabold leading-[1.06] text-ink">
          <Link href={`/product/${product.slug}`} data-card-link="" className="outline-none after:absolute after:inset-0 after:z-[2]">
            {face.title}
          </Link>
        </Heading>
        {face.facts ? <p className="m-0 text-ui-md text-ink-muted">{face.facts}</p> : null}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <PriceDisplay price={price} comparePrice={compare} size="lg" layout="inline" />
          <div className="flex items-center gap-1">
            <SaveButton productId={product.id} title={face.title} />
            {inCart ? (
              <InCartControl onPress={openSheet} />
            ) : (
              <AddControl
                product={product}
                title={face.title}
                adding={adding}
                onAdd={(e) => {
                  setAdding(true);
                  add(e.currentTarget.closest("[data-card]"));
                  window.setTimeout(() => setAdding(false), 160);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export const FeatureBox = FeatureCard;

export function GiftCardBlank({ product, denominations, className }: { product: CatalogProduct; denominations?: { label: string; href: string }[]; className?: string }) {
  const face = productFace(product.name, product.key);
  const value = (face.value ?? "").replace(/\s/g, "");
  return (
    <article data-giftcard="" data-surface="board" className={cn("board relative flex aspect-[1.586/1] flex-col justify-between p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 flex items-center gap-2">
          <PlatformTile number={face.platformNumber} size="sm" />
          <span className="pt-0.5 font-display text-[0.9375rem] font-bold text-on-board">{face.platformShort}</span>
        </p>
        <span className="font-display text-[0.75rem] font-bold uppercase tracking-[0.14em] text-on-board-muted">{face.typeTag ?? "Gift card"}</span>
      </div>
      {denominations?.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {denominations.map((d) => (
            <li key={d.href}>
              <Link href={d.href} className="inline-flex h-9 items-center rounded-sign border-[1.5px] border-on-board px-3 font-mono text-[0.8125rem] font-semibold text-on-board hover-device:hover:bg-flap">
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex items-end justify-between gap-3">
        <Link href={`/product/${product.slug}`} className="rounded-flap">
          {value ? <FlapRow text={value} size="lg" label={`${face.title}, value ${face.value}`} /> : <span className="font-display text-step-2 font-bold text-on-board">{face.title}</span>}
        </Link>
        <span className="font-mono text-[0.75rem] font-semibold uppercase text-on-board-muted">{face.regionTag}</span>
      </div>
    </article>
  );
}

export interface ProductRowProps {
  name: string;
  href?: string | null;
  imageUrl?: string | null;
  keyInfo?: KeySummary | null;
  meta?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  size?: "sm" | "md";
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function ProductRow({ name, href, imageUrl, keyInfo, meta, aside, children, size = "sm", headingLevel = 3, className }: ProductRowProps) {
  const face = productFace(name, keyInfo);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const coverWidth = size === "md" ? "w-[90px]" : "w-[54px]";
  return (
    <div data-product-row="" className={cn("relative flex min-w-0 gap-4", className)}>
      <div className={cn("relative shrink-0 overflow-hidden rounded-sign", coverWidth)}>
        <Cover src={imageUrl} alt="" compact sizes={size === "md" ? "90px" : COVER_SIZES.row} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <Heading className={cn("m-0 min-w-0 font-display font-bold leading-[1.25] tracking-[-0.005em] text-ink", size === "md" ? "text-step-1" : "text-step-0")}>
            {href ? (
              <Link href={href} className={cn("decoration-link decoration-2 underline-offset-[3px] hover-device:hover:underline", size === "md" ? "line-clamp-2" : "line-clamp-1")}>
                {face.title}
              </Link>
            ) : (
              <span className={size === "md" ? "line-clamp-2" : "line-clamp-1"}>{face.title}</span>
            )}
          </Heading>
          {aside ? <div className="shrink-0 text-right">{aside}</div> : null}
        </div>
        {keyInfo ? <GateLine face={face} edition={size === "md"} /> : null}
        {size === "md" && face.facts ? <p className="m-0 text-ui-sm text-ink-muted">{face.facts}</p> : null}
        {meta}
        {children}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="departure">
      <div className="h-[30px] bg-board" />
      <div className="aspect-[3/4] bg-surface-2" />
      <div className="flex flex-col gap-3 px-3.5 pb-3.5 pt-3">
        <SkeletonBar className="h-4 w-[80%]" />
        <SkeletonBar className="w-[50%]" />
        <SkeletonBar className="mt-3 h-5 w-16" />
      </div>
    </div>
  );
}

export function CardGrid({ children, className, columns = 4 }: { children: ReactNode; className?: string; columns?: 3 | 4 | 5 }) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-2 gap-3 lg:gap-4",
        columns === 5 ? "min-[840px]:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : columns === 4 ? "min-[840px]:grid-cols-3 xl:grid-cols-4" : "min-[840px]:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: 3 | 4 | 5 }) {
  return (
    <CardGrid columns={columns}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </CardGrid>
  );
}
