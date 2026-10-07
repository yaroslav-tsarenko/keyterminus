import { interactiveDesktop, type MotionEnv } from "../env";
import { addTick } from "../ticker";
import { cssEase, MOTION_DURATION, MOTION_LIMITS, MOTION_STAGGER } from "../tokens";

const DRAG_THRESHOLD = 5;
const FRICTION = 4.5;

function mountRail(rail: HTMLElement, env: MotionEnv): () => void {
  const track = rail.querySelector<HTMLElement>("[data-rail-track]");
  if (!track) return () => {};
  const bar = rail.querySelector<HTMLElement>("[data-rail-bar]");
  const thumb = rail.querySelector<HTMLElement>("[data-rail-thumb]");
  const prev = rail.querySelector<HTMLButtonElement>("[data-rail-prev]");
  const next = rail.querySelector<HTMLButtonElement>("[data-rail-next]");
  const cleanups: (() => void)[] = [];
  let frame = 0;

  const update = () => {
    frame = 0;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const fraction = track.scrollWidth > 0 ? Math.min(1, track.clientWidth / track.scrollWidth) : 1;
    const position = max > 0 ? track.scrollLeft / max : 0;
    if (thumb && bar) {
      thumb.style.transformOrigin = "0 50%";
      thumb.style.transform = `translateX(${(bar.clientWidth * (1 - fraction) * position).toFixed(1)}px) scaleX(${fraction.toFixed(4)})`;
    }
    if (prev) prev.disabled = track.scrollLeft <= 1;
    if (next) next.disabled = track.scrollLeft >= max - 1;
    rail.toggleAttribute("data-rail-static", max <= 1);
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  update();
  track.addEventListener("scroll", schedule, { passive: true });
  const resize = new ResizeObserver(schedule);
  resize.observe(track);
  cleanups.push(() => {
    track.removeEventListener("scroll", schedule);
    resize.disconnect();
    window.cancelAnimationFrame(frame);
  });

  const page = (dir: number) => () => {
    track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: env.reduced ? "auto" : "smooth" });
  };
  const onPrev = page(-1);
  const onNext = page(1);
  prev?.addEventListener("click", onPrev);
  next?.addEventListener("click", onNext);
  cleanups.push(() => {
    prev?.removeEventListener("click", onPrev);
    next?.removeEventListener("click", onNext);
  });

  if (interactiveDesktop(env)) {
    let pointerId = -1;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let dragged = false;
    let stopGlide: (() => void) | null = null;

    const release = () => {
      delete track.dataset.dragging;
    };
    const glide = () => {
      stopGlide?.();
      stopGlide = addTick((dt) => {
        const before = track.scrollLeft;
        track.scrollLeft -= velocity * dt;
        velocity *= Math.exp((-FRICTION * dt) / 1000);
        if (Math.abs(velocity) < 0.02 || track.scrollLeft === before) {
          release();
          stopGlide = null;
          return false;
        }
        return true;
      });
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stopGlide?.();
      stopGlide = null;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      lastT = e.timeStamp;
      startScroll = track.scrollLeft;
      velocity = 0;
      dragged = false;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      if (!dragged && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!dragged) {
        dragged = true;
        track.dataset.dragging = "";
        track.setPointerCapture(e.pointerId);
      }
      const dt = Math.max(1, e.timeStamp - lastT);
      velocity = Math.max(-3, Math.min(3, velocity * 0.6 + ((e.clientX - lastX) / dt) * 0.4));
      lastX = e.clientX;
      lastT = e.timeStamp;
      track.scrollLeft = startScroll - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = -1;
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
      if (dragged && Math.abs(velocity) > 0.05) glide();
      else release();
    };
    const onClick = (e: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();
    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    track.addEventListener("click", onClick, true);
    track.addEventListener("dragstart", onDragStart);
    cleanups.push(() => {
      stopGlide?.();
      release();
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      track.removeEventListener("click", onClick, true);
      track.removeEventListener("dragstart", onDragStart);
    });
  }

  if (!env.reduced) {
    const fold = window.innerHeight;
    const box = track.getBoundingClientRect();
    const cards = Array.from(track.children).filter((el): el is HTMLElement => {
      const r = el.getBoundingClientRect();
      return r.top > fold || r.left > box.right;
    });
    if (cards.length > 0) {
      for (const card of cards) card.dataset.rise = "armed";
      let batch = 0;
      let batchAt = 0;
      const io = new IntersectionObserver(
        (entries) => {
          const now = performance.now();
          if (now - batchAt > MOTION_DURATION.reveal) batch = 0;
          batchAt = now;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const card = entry.target as HTMLElement;
            io.unobserve(card);
            delete card.dataset.rise;
            card.animate([{ opacity: 0, transform: `translateY(${MOTION_LIMITS.railRise}px)` }, { opacity: 1, transform: "none" }], {
              duration: MOTION_DURATION.reveal,
              delay: Math.min(batch++, 6) * MOTION_STAGGER.cards,
              easing: cssEase("outExpo"),
              fill: "backwards",
            });
          }
        },
        { threshold: 0.15 },
      );
      for (const card of cards) io.observe(card);
      cleanups.push(() => {
        io.disconnect();
        for (const card of cards) delete card.dataset.rise;
      });
    }
  }

  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
  };
}

export function mountRails(root: Document, env: MotionEnv): () => void {
  const cleanups = Array.from(root.querySelectorAll<HTMLElement>("[data-rail]")).map((rail) => mountRail(rail, env));
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
