import { BRAND } from "@/lib/brand";
import { OG_PALETTE as P, OG_SIZE } from "@/lib/og/assets";
import { BoardPanel, SignLabel, TerminusRule, Wordmark, ogResponse } from "@/lib/og/parts";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${BRAND.name}: ${BRAND.tagline}`;

const ROWS = [
  { text: "GAME KEYS", remark: "ON TIME" },
  { text: "GIFT CARDS", remark: "ON TIME" },
  { text: "DLC", remark: "ON TIME" },
  { text: "SUBSCRIPTIONS", remark: "ON TIME" },
];

export default async function Image() {
  return ogResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: P.floor, color: P.ink, padding: "64px 56px 64px 72px", justifyContent: "space-between", alignItems: "stretch" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 470 }}>
        <Wordmark height={44} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <SignLabel>Departures · all platforms</SignLabel>
          <div style={{ display: "flex", marginTop: 18, fontFamily: "Overpass", fontWeight: 800, fontSize: 60, lineHeight: 1.0, letterSpacing: -1.5 }}>Game keys, departing for your account.</div>
          <div style={{ display: "flex", marginTop: 22, fontFamily: "Overpass", fontWeight: 400, fontSize: 24, lineHeight: 1.45, color: P.inkMuted }}>Steam, Xbox, PlayStation, Nintendo and more.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <TerminusRule width={420} />
          <div style={{ display: "flex", marginTop: 14, fontFamily: "Sometype Mono", fontWeight: 500, fontSize: 18, color: P.inkMuted }}>{BRAND.domain}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <BoardPanel rows={ROWS} cells={13} remarkCells={7} size={22} heads={["Destination", "Remarks"]} />
      </div>
    </div>,
  );
}
