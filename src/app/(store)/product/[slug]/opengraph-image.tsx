import { cache } from "react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import { STORE_POLICY } from "@/config/store-policy";
import { defaultLocale } from "@/i18n/config";
import { formatPrice } from "@/lib/utils/format-price";
import { OG_PALETTE as P, OG_SIZE } from "@/lib/og/assets";
import { BoardPanel, Flap, SignLabel, TerminusRule, Wordmark, ogResponse, titleSize } from "@/lib/og/parts";
import { platformInfo, regionTag, typeTag } from "@/lib/catalog/platforms";
import { stripSupplierMentions } from "@/lib/utils/supplier";

export const revalidate = 3600;

type SlugParams = { slug: string } | Promise<{ slug: string }>;

const loadProduct = cache(async (slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      status: true,
      price: true,
      quantity: true,
      comparePrice: true,
      item: { select: { title: true, platform: true, region: true, productType: true } },
    },
  }),
);

export async function generateImageMetadata({ params }: { params: SlugParams }) {
  const { slug } = await params;
  const product = slug ? await loadProduct(slug) : null;
  const t = await getTranslations({ locale: defaultLocale, namespace: "seo" });
  const name = product?.status === "ACTIVE" ? stripSupplierMentions(product.name) : BRAND.tagline;
  return [{ id: "card", size: OG_SIZE, contentType: "image/png", alt: t("ogProductAlt", { name, brand: BRAND.name }) }];
}

export default async function Image({ params }: { params: SlugParams }) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  const active = product?.status === "ACTIVE";
  const name = active ? stripSupplierMentions(product.item?.title ?? product.name) : BRAND.tagline;
  const price = active ? Number(product.price) : null;
  const platform = active && product.item ? platformInfo(product.item.platform) : null;
  const region = active && product.item ? regionTag(product.item.region) : null;
  const type = active && product.item ? typeTag(product.item.productType) : null;
  const nameSize = titleSize(name, [[24, 58], [44, 48], [72, 40], [110, 34]]);

  const rows = platform
    ? [
        { text: platform.boardLabel, remark: product && product.quantity > 0 && !product.comparePrice ? "ON TIME" : "" },
        ...(region ? [{ text: region.toUpperCase(), remark: "" }] : []),
        ...(type ? [{ text: type.toUpperCase(), remark: "" }] : []),
      ]
    : [{ text: "GAME KEYS", remark: "ON TIME" }];

  return ogResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: P.floor, color: P.ink, padding: "64px 56px 64px 72px", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
        <Wordmark height={40} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {platform ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Flap char={platform.number ? String(platform.number) : "–"} size={18} />
              <SignLabel color={P.ink}>{platform.short}</SignLabel>
              {region ? <div style={{ display: "flex", fontFamily: "Sometype Mono", fontWeight: 600, fontSize: 18, color: P.ink }}>{`·  ${region.toUpperCase()}`}</div> : null}
            </div>
          ) : null}
          <div style={{ display: "block", marginTop: 20, fontFamily: "Overpass", fontWeight: 800, fontSize: nameSize, lineHeight: 1.02, letterSpacing: -1, color: P.ink, lineClamp: 4, overflow: "hidden", maxHeight: nameSize * 1.02 * 4 + 4 }}>{name}</div>
          {price != null && price > 0 ? <div style={{ display: "flex", marginTop: 28, fontFamily: "Sometype Mono", fontWeight: 600, fontSize: 40, color: P.ink }}>{formatPrice(price, STORE_POLICY.currency)}</div> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <TerminusRule width={540} />
          <div style={{ display: "flex", marginTop: 14, fontFamily: "Sometype Mono", fontWeight: 500, fontSize: 18, color: P.inkMuted }}>{BRAND.domain}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <BoardPanel rows={rows} cells={11} remarkCells={7} size={18} heads={["Platform", "Remarks"]} />
      </div>
    </div>,
    3600,
  );
}
