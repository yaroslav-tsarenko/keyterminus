import { cssEase, MOTION_DURATION } from "../tokens";

export function reachedStop(route: Element): number {
  let reached = -1;
  route.querySelectorAll<HTMLElement>(".route-item").forEach((item, i) => {
    const state = item.dataset.state;
    if (state === "done" || state === "current") reached = i;
  });
  return reached;
}

export function advanceRoute(route: Element, from: number, to: number): void {
  if (to <= from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const items = Array.from(route.querySelectorAll<HTMLElement>(".route-item"));
  let step = 0;
  for (let i = Math.max(1, from + 1); i <= to; i++) {
    const delay = step * MOTION_DURATION.nextStop;
    const lines = items[i - 1]?.querySelectorAll<SVGLineElement>(".route-seg:not([data-dashed]) line") ?? [];
    lines.forEach((line) => {
      line.style.strokeDasharray = "1 1";
      const run = line.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: MOTION_DURATION.nextStop, delay, easing: cssEase("sign"), fill: "backwards" });
      const clear = () => line.style.removeProperty("stroke-dasharray");
      run.finished.then(clear, clear);
    });
    items[i]?.querySelector<HTMLElement>(".route-stop")?.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], {
      duration: MOTION_DURATION.stopIn,
      delay: delay + MOTION_DURATION.nextStop * 0.8,
      easing: cssEase("sign"),
      fill: "backwards",
    });
    step += 1;
  }
}

export function mountNextStop(root: Document): () => void {
  const routes = Array.from(root.querySelectorAll<HTMLElement>("[data-stepper] .route"));
  if (routes.length === 0) return () => {};
  const reached = new Map(routes.map((r) => [r, reachedStop(r)]));
  const observer = new MutationObserver(() => {
    for (const route of routes) {
      const before = reached.get(route) ?? -1;
      const now = reachedStop(route);
      if (now === before) continue;
      reached.set(route, now);
      advanceRoute(route, before, now);
    }
  });
  for (const route of routes) observer.observe(route, { subtree: true, attributes: true, attributeFilter: ["data-state"], childList: true });
  return () => observer.disconnect();
}
