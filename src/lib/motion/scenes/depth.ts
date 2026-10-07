import { interactiveDesktop, type MotionEnv } from "../env";
import { addTick, clamp, lerpPerFrame } from "../ticker";
import { MOTION_DEPTH, MOTION_LIMITS } from "../tokens";

type Layer = keyof typeof MOTION_DEPTH;

interface Item {
  el: HTMLElement;
  target: HTMLElement;
  amp: number;
  speed: number;
  scale: number;
  x: number;
  y: number;
  visible: boolean;
}

const COVER = "[data-cover] img";
const COVER_SCALE = 1.04;

function itemFor(el: HTMLElement): Item | null {
  const layer = el.dataset.depth as Layer;
  const depth = MOTION_DEPTH[layer];
  if (!depth || depth.pointer === 0) return null;
  const cover = layer === "D3" ? el.querySelector<HTMLElement>(COVER) : null;
  if (cover) return { el, target: cover, amp: -3, speed: 0, scale: COVER_SCALE, x: 0, y: 0, visible: false };
  return { el, target: el, amp: depth.pointer, speed: depth.scroll, scale: 1, x: 0, y: 0, visible: false };
}

export function mountDepth(root: Document, env: MotionEnv): () => void {
  if (!interactiveDesktop(env)) return () => {};
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"))
    .map(itemFor)
    .filter((i): i is Item => Boolean(i));
  if (items.length === 0) return () => {};

  const pointer = { x: 0, y: 0 };
  let running = false;
  let stop: (() => void) | null = null;

  const scrollOffset = (item: Item) => {
    if (item.speed === 0) return 0;
    const r = item.el.getBoundingClientRect();
    const fromCenter = r.top - item.y + r.height / 2 - window.innerHeight / 2;
    return clamp(-fromCenter * item.speed, -MOTION_LIMITS.depthMax, MOTION_LIMITS.depthMax);
  };

  const tick = (dt: number) => {
    let moving = false;
    for (const item of items) {
      if (!item.visible) continue;
      const tx = pointer.x * item.amp;
      const ty = pointer.y * item.amp + scrollOffset(item);
      item.x = lerpPerFrame(item.x, tx, 0.1, dt);
      item.y = lerpPerFrame(item.y, ty, 0.1, dt);
      if (Math.abs(item.x - tx) > 0.02 || Math.abs(item.y - ty) > 0.02) moving = true;
      else {
        item.x = tx;
        item.y = ty;
      }
      item.target.style.translate = `${item.x.toFixed(2)}px ${item.y.toFixed(2)}px`;
      if (item.scale !== 1) item.target.style.scale = String(item.scale);
    }
    if (!moving) running = false;
    return moving;
  };

  const wake = () => {
    if (running) return;
    running = true;
    stop = addTick(tick);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    pointer.x = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
    pointer.y = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
    wake();
  };

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const item = items.find((i) => i.el === entry.target);
      if (item) item.visible = entry.isIntersecting;
    }
    wake();
  });
  for (const item of items) io.observe(item.el);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", wake, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("scroll", wake);
    io.disconnect();
    stop?.();
    for (const item of items) {
      item.target.style.translate = "";
      item.target.style.scale = "";
    }
  };
}
