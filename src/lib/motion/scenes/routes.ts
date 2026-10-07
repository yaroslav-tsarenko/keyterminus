import { interactiveDesktop, type MotionEnv } from "../env";
import { cssEase, MOTION_DURATION, MOTION_STAGGER } from "../tokens";

function center(el: Element, origin: DOMRect) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2 - origin.left, y: r.top + r.height / 2 - origin.top };
}

function travel(route: HTMLElement) {
  if (route.querySelector("[data-route-marker]")) return;
  const first = route.querySelector(".route-stop");
  const bar = route.querySelector(".route-bar");
  if (!first || !bar) return;
  const box = route.getBoundingClientRect();
  const a = center(first, box);
  const b = center(bar, box);
  if (Math.abs(b.x - a.x) < Math.abs(b.y - a.y)) return;
  const marker = document.createElement("span");
  marker.dataset.routeMarker = "";
  marker.setAttribute("aria-hidden", "true");
  marker.style.top = `${a.y - 2}px`;
  marker.style.left = `${a.x - 5}px`;
  route.appendChild(marker);
  const run = marker.animate([{ transform: "translateX(0)" }, { transform: `translateX(${(b.x - a.x).toFixed(1)}px)` }], { duration: MOTION_DURATION.routeMarker, easing: cssEase("inOut"), fill: "forwards" });
  const done = () => marker.remove();
  run.finished.then(done, done);
}

function arm(scope: HTMLElement) {
  const routes = scope.matches(".route") ? [scope] : Array.from(scope.querySelectorAll<HTMLElement>(".route"));
  routes.forEach((route, line) => {
    const items = Array.from(route.querySelectorAll<HTMLElement>(".route-item"));
    const base = line * MOTION_STAGGER.stops;
    const seg = MOTION_DURATION.routeDraw / Math.max(1, items.length);
    items.forEach((item, i) => {
      item.style.setProperty("--trace-delay", `${Math.round(base + i * seg)}ms`);
      item.style.setProperty("--trace-dur", `${Math.round(seg)}ms`);
    });
    route.querySelector<HTMLElement>(".route-terminus")?.style.setProperty("--trace-delay", `${Math.round(base + MOTION_DURATION.routeDraw)}ms`);
  });
  return routes;
}

export function mountRoutes(scope: HTMLElement, env: MotionEnv): () => void {
  if (env.reduced) return () => {};
  const cleanups: (() => void)[] = [];
  const below = scope.getBoundingClientRect().top > window.innerHeight * 0.9;
  if (below) {
    const routes = arm(scope);
    scope.dataset.trace = "armed";
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        scope.dataset.trace = "in";
        const total = MOTION_DURATION.routeDraw + MOTION_DURATION.stopIn + routes.length * MOTION_STAGGER.stops + 200;
        timer = window.setTimeout(() => delete scope.dataset.trace, total);
      },
      { threshold: 0.2 },
    );
    io.observe(scope);
    cleanups.push(() => {
      io.disconnect();
      window.clearTimeout(timer);
      delete scope.dataset.trace;
      for (const route of routes) {
        route.querySelectorAll<HTMLElement>(".route-item, .route-terminus").forEach((el) => {
          el.style.removeProperty("--trace-delay");
          el.style.removeProperty("--trace-dur");
        });
      }
    });
  }
  if (scope.dataset.scene === "routes" && interactiveDesktop(env)) {
    const onEnter = (e: Event) => {
      const route = (e.target as Element | null)?.closest?.<HTMLElement>(".route");
      if (route && scope.contains(route) && !(e instanceof PointerEvent && e.pointerType !== "mouse")) {
        const from = (e as FocusEvent).relatedTarget as Node | null;
        if (e.type === "focusin" && from && route.contains(from)) return;
        travel(route);
      }
    };
    const onOver = (e: PointerEvent) => {
      const route = (e.target as Element | null)?.closest?.<HTMLElement>(".route");
      const from = (e.relatedTarget as Element | null)?.closest?.(".route");
      if (route && route !== from) onEnter(e);
    };
    scope.addEventListener("pointerover", onOver);
    scope.addEventListener("focusin", onEnter);
    cleanups.push(() => {
      scope.removeEventListener("pointerover", onOver);
      scope.removeEventListener("focusin", onEnter);
      scope.querySelectorAll("[data-route-marker]").forEach((m) => m.remove());
    });
  }
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
