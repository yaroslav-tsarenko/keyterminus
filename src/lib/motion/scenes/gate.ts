import { interactiveDesktop, type MotionEnv } from "../env";
import { cssEase, MOTION_DURATION } from "../tokens";

function flipGate(tile: HTMLElement) {
  if (tile.querySelector("[data-gate-leaf]")) return;
  const glyph = tile.querySelector(".flap-glyph")?.textContent ?? "";
  const leaf = document.createElement("span");
  leaf.className = "flap-leaf";
  leaf.dataset.gateLeaf = "";
  leaf.setAttribute("aria-hidden", "true");
  const face = document.createElement("span");
  face.textContent = glyph;
  leaf.appendChild(face);
  tile.appendChild(leaf);
  const run = leaf.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], { duration: MOTION_DURATION.gateFlip, easing: cssEase("flap"), fill: "forwards" });
  const done = () => leaf.remove();
  run.finished.then(done, done);
}

export function mountGate(root: Document, env: MotionEnv): () => void {
  if (!interactiveDesktop(env)) return () => {};
  let active: Element | null = null;
  const enter = (target: EventTarget | null) => {
    const card = (target as Element | null)?.closest?.("[data-card]") ?? null;
    if (card === active) return;
    active = card;
    const tile = card?.querySelector<HTMLElement>("[data-gate]");
    if (tile) flipGate(tile);
  };
  const onOver = (e: PointerEvent) => {
    if (e.pointerType === "mouse") enter(e.target);
  };
  const onFocus = (e: FocusEvent) => enter(e.target);
  root.addEventListener("pointerover", onOver, { passive: true });
  root.addEventListener("focusin", onFocus);
  return () => {
    root.removeEventListener("pointerover", onOver);
    root.removeEventListener("focusin", onFocus);
    root.querySelectorAll("[data-gate-leaf]").forEach((leaf) => leaf.remove());
  };
}
