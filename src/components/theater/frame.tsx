import type { CSSProperties, ReactNode, Ref } from "react";
import { FlipRow } from "@/components/motion/FlipRow";
import { cn } from "@/lib/utils/cn";
import { frameStyle, presetFor, type FrameVars } from "./engine/geometry";
import type { DeviceKind, SceneAddress } from "./types";

export type FrameProps = {
  device: DeviceKind | "auto";
  address: SceneAddress;
  remark?: string;
  sampleLabel?: string;
  vars?: FrameVars;
  frameRef?: Ref<HTMLDivElement>;
  contentRef?: Ref<HTMLDivElement>;
  overlay?: ReactNode;
  children: ReactNode;
};

export function Frame({ device, address, remark, sampleLabel = "Sample data", vars, frameRef, contentRef, overlay, children }: FrameProps) {
  const auto = device === "auto" && !vars;
  const style = auto ? undefined : (frameStyle(vars ?? presetFor(device === "auto" ? "desktop" : device)) as CSSProperties);
  return (
    <div ref={frameRef} className="th-frame" data-surface="board" data-auto={auto ? "" : undefined} style={style}>
      <div className="th-strip">
        <span className={cn("th-address", address.external && "th-address-external")} data-external={address.external || undefined}>
          <span className="truncate">{address.label}</span>
        </span>
        <span className="th-strip-end">
          {remark ? <FlipRow text={remark} cells={9} align="right" tone="remark" size="xs" label={remark} className="th-remark" /> : null}
          <span className="th-sample">{sampleLabel}</span>
        </span>
      </div>
      <div className="th-screen">
        <div ref={contentRef} className="th-content">
          {children}
          {overlay}
        </div>
      </div>
    </div>
  );
}
