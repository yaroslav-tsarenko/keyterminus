import { remarkOf, urlFor } from "./define";
import { Frame } from "./frame";
import type { AnyScene, DeviceKind, SceneAddress } from "./types";

export type BoxKind = "desktop" | "phone" | "auto";

export function Still({ scene, device, state }: { scene: AnyScene; device: DeviceKind | "auto"; state: Record<string, unknown> }) {
  const View = scene.View;
  return (
    <Frame device={device} address={urlFor(scene, state)} remark={remarkOf(scene, state)}>
      <View s={state} device={device === "auto" ? scene.device : device} focus={null} />
    </Frame>
  );
}

function Bar({ className }: { className: string }) {
  return <span className={`block rounded-control bg-surface-1 ${className}`} />;
}

export function Poster({ address, device, remark }: { address: SceneAddress; device: DeviceKind | "auto"; remark?: string }) {
  return (
    <Frame device={device} address={address} remark={remark}>
      <div className="flex h-full flex-col bg-surface">
        <div className="flex h-16 shrink-0 items-center gap-6 border-b border-line px-6">
          <Bar className="h-7 w-[180px]" />
          <Bar className="h-10 max-w-[520px] flex-1" />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-4 p-6 @3xl:grid-cols-4">
          <span className="block rounded-card border border-line bg-raised" />
          <span className="block rounded-card border border-line bg-raised" />
          <span className="hidden rounded-card border border-line bg-raised @3xl:block" />
          <span className="hidden rounded-card border border-line bg-raised @3xl:block" />
        </div>
      </div>
    </Frame>
  );
}
