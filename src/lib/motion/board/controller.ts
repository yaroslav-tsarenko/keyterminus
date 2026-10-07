import { frozenTime, onIdle, readMotionEnv, type MotionEnv } from "../env";
import { arrivalPath, flapPath, flapStepAt, DRUM, FLAP_COLUMN_STAGGER, FLAP_ROW_STAGGER, FLAP_STEP_MS } from "../flap";
import { addTick, clamp, cubicBezier, damp } from "../ticker";
import { MOTION_DURATION, MOTION_EASE, MOTION_LIMITS } from "../tokens";
import type { BoardPalette, BoardScene, CellFrame, Rgb } from "./scene";

export interface BoardOptions {
  seed: string[];
  onReady?: () => void;
}

export interface BoardHandle {
  seed: (chars: string[]) => void;
  dispose: () => void;
}

interface Cell {
  el: HTMLElement;
  row: number;
  col: number;
  tone: number;
  rect: [number, number, number, number];
  shown: string;
  target: string;
  from: string;
  path: string[];
  start: number;
  landed: number;
  light: number;
  lift: number;
}

const MARGIN = 32;
const SLOW_FRAME = 24;
const WINDOW = 90;
const REBOUND_MS = 40;
const DEG = Math.PI / 180;
const flapEase = cubicBezier(...MOTION_EASE.flap);
const ARRIVAL_STEPS = 3;

export function boardGlAllowed(env: MotionEnv = readMotionEnv()): { ok: boolean; forced: boolean } {
  if (env.reduced) return { ok: false, forced: false };
  const forced = new URLSearchParams(window.location.search).get("board") === "gl" || frozenTime() !== null;
  if (forced) return { ok: true, forced };
  return { ok: env.desktop && env.finePointer && !env.coarsePointer && !env.saveData && !env.lowPower, forced: false };
}

function rgb(value: string, probe: CanvasRenderingContext2D | null): Rgb {
  if (!probe) return [0, 0, 0];
  probe.fillStyle = "#000000";
  probe.fillStyle = value.trim() || "#000000";
  probe.clearRect(0, 0, 1, 1);
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function readPalette(root: HTMLElement): BoardPalette {
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const tokens = getComputedStyle(root);
  const token = (name: string) => rgb(tokens.getPropertyValue(name), probe);
  const own = getComputedStyle(root);
  const bg = own.backgroundColor;
  const housing = Boolean(bg) && bg !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(bg);
  return {
    face: token("--color-flap"),
    faceTop: token("--color-flap-top"),
    hinge: token("--color-hinge"),
    ink: token("--color-on-board"),
    remark: token("--color-remark"),
    lift: token("--color-board-edge"),
    board: housing ? rgb(bg, probe) : token("--color-board"),
    edge: parseFloat(own.borderTopWidth) > 0 ? rgb(own.borderTopColor, probe) : housing ? rgb(bg, probe) : token("--color-board-edge"),
    housing,
  };
}

function targetChar(flap: HTMLElement): string {
  const row = flap.closest<HTMLElement>("[data-flap-row]");
  const text = row?.dataset.text;
  if (text !== undefined && row) {
    const index = Array.from(row.querySelectorAll("[data-flap]")).indexOf(flap);
    const chars = Array.from(text);
    if (index >= 0 && index < chars.length) return chars[index];
  }
  return flap.dataset.char ?? " ";
}

export function mountBoard(root: HTMLElement, canvas: HTMLCanvasElement, options: BoardOptions): BoardHandle {
  const dom = root.querySelector<HTMLElement>("[data-board-dom]");
  const section = root.closest<HTMLElement>('[data-scene="board"]') ?? root;
  const { forced } = boardGlAllowed();
  const pinned = frozenTime();
  let disposed = false;
  let scene: BoardScene | null = null;
  let cells: Cell[] = [];
  let ready = false;
  let visible = true;
  let running = false;
  let stopTick: (() => void) | null = null;
  let syncFrame = 0;
  let readyAt = 0;
  let arrivalDone = false;
  let hoverRow = -1;
  let hinge = 1;
  let glyphHeight = 31;
  let housingRadius = 10;
  let seed = new Set(options.seed.join(""));
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false, px: -9999, py: -9999 };
  const tilt = { pitch: 0, yaw: 0, rest: 0, scroll: 0 };
  const size = { width: 1, height: 1, housing: [0, 0, 1, 1] as [number, number, number, number] };
  const durations: number[] = [];

  const clock = () => (pinned !== null ? readyAt + MOTION_DURATION.boardArrival + pinned * 1000 : performance.now());

  const measure = () => {
    const box = root.getBoundingClientRect();
    size.width = Math.round(box.width + MARGIN * 2);
    size.height = Math.round(box.height + MARGIN * 2);
    size.housing = [0, 0, box.width, box.height];
    const style = getComputedStyle(root);
    housingRadius = parseFloat(style.borderTopLeftRadius) || 10;
    const originX = box.left + box.width / 2;
    const originY = box.top + box.height / 2;
    const flaps = dom ? Array.from(dom.querySelectorAll<HTMLElement>("[data-flap]")) : [];
    const rows = new Map<Element, number>();
    const cols = new Map<number, number>();
    const previous = new Map(cells.map((c) => [c.el, c]));
    const next: Cell[] = [];
    for (const el of flaps) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const rowEl = el.closest("tr") ?? el.parentElement ?? el;
      if (!rows.has(rowEl)) rows.set(rowEl, rows.size);
      const row = rows.get(rowEl)!;
      const col = cols.get(row) ?? 0;
      cols.set(row, col + 1);
      const rect: [number, number, number, number] = [r.left + r.width / 2 - originX, -(r.top + r.height / 2 - originY), r.width, r.height];
      const old = previous.get(el);
      const target = targetChar(el);
      const tone = el.dataset.tone === "remark" ? 1 : 0;
      if (old) {
        next.push({ ...old, row, col, rect, tone });
      } else {
        next.push({ el, row, col, tone, rect, shown: target, target, from: target, path: [], start: 0, landed: -1, light: 0, lift: 0 });
      }
    }
    if (next[0]) {
      hinge = next[0].el.dataset.hinge === "2" ? 2 : 1;
      glyphHeight = (parseFloat(getComputedStyle(next[0].el).fontSize) || next[0].rect[3] / 1.55) * 1.55;
    }
    cells = next;
  };

  const charsInUse = () => {
    const chars = new Set<string>();
    for (const c of cells) {
      chars.add(c.target);
      chars.add(c.shown);
    }
    for (const c of seed) chars.add(c);
    return chars;
  };

  const ensureGlyphs = () => {
    if (scene && scene.atlas.ensure(charsInUse())) scene.refreshAtlas();
  };

  const visibleChar = (c: Cell, now: number) => {
    if (c.path.length === 0) return c.shown;
    const step = flapStepAt(c.path, c.from, now - c.start);
    if (!step) return now - c.start < 0 ? c.from : c.target;
    return step.next;
  };

  const startFlip = (c: Cell, to: string, start: number, path?: string[]) => {
    const from = visibleChar(c, start);
    c.from = from;
    c.target = to;
    c.path = path ?? flapPath(from, to);
    c.start = start;
    if (c.path.length === 0) c.shown = to;
  };

  const sync = () => {
    syncFrame = 0;
    if (!scene || disposed) return;
    const before = cells.length;
    const flaps = dom ? dom.querySelectorAll("[data-flap]").length : 0;
    if (flaps !== before || cells.some((c) => !c.el.isConnected)) measure();
    const now = clock();
    const changedRows = new Map<number, number>();
    for (const c of cells) {
      const target = targetChar(c.el);
      if (target === c.target) continue;
      if (!changedRows.has(c.row)) changedRows.set(c.row, changedRows.size);
      const rank = changedRows.get(c.row)!;
      startFlip(c, target, now + c.col * FLAP_COLUMN_STAGGER + rank * FLAP_ROW_STAGGER + Math.random() * 12);
    }
    ensureGlyphs();
    wake();
  };

  const scheduleSync = () => {
    if (!syncFrame) syncFrame = window.requestAnimationFrame(sync);
  };

  const arrival = (at: number) => {
    arrivalDone = true;
    for (const c of cells) {
      if (c.target === " ") continue;
      const jitter = pinned !== null ? ((c.col * 7 + c.row * 13) % 10) : Math.random() * 10;
      c.shown = c.target;
      startFlip(c, c.target, at + c.col * FLAP_COLUMN_STAGGER + c.row * FLAP_ROW_STAGGER + jitter, arrivalPath(c.target, ARRIVAL_STEPS));
    }
  };

  const frame = (now: number): { frames: CellFrame[]; busy: boolean } => {
    let busy = false;
    const frames: CellFrame[] = [];
    for (const c of cells) {
      const glyph = scene!.atlas.index;
      let top = c.shown;
      let bottom = c.shown;
      let front = c.shown;
      let back = c.shown;
      let angle = 0;
      let leaf = false;
      let shade = 0;
      if (c.path.length > 0) {
        const local = now - c.start;
        const step = flapStepAt(c.path, c.from, local);
        if (step) {
          busy = true;
          top = step.next;
          bottom = step.current;
          front = step.current;
          back = step.next;
          angle = Math.PI * flapEase(step.progress);
          leaf = true;
          shade = 0.18 * (angle / Math.PI);
        } else if (local < 0) {
          busy = true;
          top = bottom = front = back = c.from;
        } else {
          c.shown = c.target;
          c.landed = c.start + c.path.length * FLAP_STEP_MS;
          c.path = [];
          top = bottom = front = back = c.shown;
        }
      }
      if (!leaf && c.landed >= 0) {
        const u = (now - c.landed) / REBOUND_MS;
        if (u >= 0 && u < 1) {
          busy = true;
          leaf = true;
          angle = Math.PI - MOTION_LIMITS.flapRebound * DEG * Math.sin(Math.PI * u);
        } else if (u >= 1) c.landed = -1;
      }
      if (!leaf && c.lift > 0.002) {
        leaf = true;
        angle = c.lift;
      }
      frames.push({ rect: c.rect, top: glyph(top), bottom: glyph(bottom), front: glyph(front), back: glyph(back), angle, leaf, tone: c.tone, light: c.light, shade });
    }
    return { frames, busy };
  };

  const draw = (now: number) => {
    if (!scene) return false;
    const { frames, busy } = frame(now);
    scene.render({ width: size.width, height: size.height, housing: size.housing, housingRadius, hinge, glyphHeight, pitch: (tilt.rest - tilt.scroll + tilt.pitch) * DEG, yaw: tilt.yaw * DEG }, frames);
    return busy;
  };

  const adapt = (dt: number) => {
    if (forced || !scene) return true;
    durations.push(dt);
    if (durations.length < WINDOW) return true;
    const slow = durations.filter((d) => d > SLOW_FRAME).length;
    durations.length = 0;
    if (slow * 2 < WINDOW) return true;
    if (scene.dpr() > 1) {
      scene.setDpr(Math.max(1, scene.dpr() * 0.75));
      return true;
    }
    fallback();
    return false;
  };

  const scrollTarget = () => {
    const r = section.getBoundingClientRect();
    return MOTION_LIMITS.boardPitch * clamp(-r.top / Math.max(1, r.height), 0, 1);
  };

  const tick = (dt: number) => {
    if (!scene || disposed || !visible) {
      running = false;
      return false;
    }
    if (!adapt(dt)) return false;
    const s = dt / 1000;
    const now = clock();
    if (!arrivalDone && pinned === null && now - readyAt >= MOTION_DURATION.boardArrival) arrival(now);
    const restTarget = ready ? MOTION_LIMITS.boardRest : 0;
    const scroll = scrollTarget();
    let settling = false;
    const settle = (value: number, target: number, lambda: number, eps: number) => {
      const next = damp(value, target, lambda, s);
      if (Math.abs(next - target) > eps) {
        settling = true;
        return next;
      }
      return target;
    };
    tilt.rest = settle(tilt.rest, restTarget, 2.4, 0.005);
    tilt.scroll = settle(tilt.scroll, scroll, 10, 0.01);
    tilt.pitch = settle(tilt.pitch, pointer.inside ? -pointer.ty * MOTION_LIMITS.pointerTilt : 0, 6, 0.005);
    tilt.yaw = settle(tilt.yaw, pointer.inside ? pointer.tx * MOTION_LIMITS.pointerTilt : 0, 6, 0.005);
    for (const c of cells) {
      const lightTarget = c.row === hoverRow ? 1 : 0;
      c.light = settle(c.light, lightTarget, 14, 0.004);
      let liftTarget = 0;
      if (pointer.inside) {
        const d = Math.hypot(pointer.px - c.rect[0], pointer.py - (c.rect[1] + c.rect[3] / 4));
        if (d < MOTION_LIMITS.riffleRadius) liftTarget = (MOTION_LIMITS.riffleMin + (MOTION_LIMITS.riffleAngle - MOTION_LIMITS.riffleMin) * (1 - d / MOTION_LIMITS.riffleRadius)) * DEG;
      }
      c.lift = settle(c.lift, liftTarget, 12, 0.001);
    }
    const busy = draw(now);
    const waitingArrival = !arrivalDone && pinned === null;
    if (busy || settling || waitingArrival) return true;
    running = false;
    durations.length = 0;
    return false;
  };

  const wake = () => {
    if (running || !scene || !visible || disposed || pinned !== null) return;
    running = true;
    stopTick = addTick(tick);
  };

  const markReady = () => {
    if (ready || disposed) return;
    ready = true;
    root.dataset.glReady = "";
    options.onReady?.();
  };

  const unready = () => {
    ready = false;
    delete root.dataset.glReady;
  };

  const snap = () => {
    for (const c of cells) {
      c.target = targetChar(c.el);
      c.shown = c.target;
      c.path = [];
      c.landed = -1;
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || pinned !== null) return;
    const box = root.getBoundingClientRect();
    pointer.tx = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
    pointer.ty = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
    const inside = e.clientX >= box.left - MARGIN && e.clientX <= box.right + MARGIN && e.clientY >= box.top - MARGIN && e.clientY <= box.bottom + MARGIN;
    pointer.inside = inside;
    pointer.px = e.clientX - (box.left + box.width / 2);
    pointer.py = -(e.clientY - (box.top + box.height / 2));
    wake();
  };

  const onPointerLeave = () => {
    pointer.inside = false;
    hoverRow = -1;
    wake();
  };

  const onRowOver = (e: PointerEvent) => {
    const tr = (e.target as Element | null)?.closest?.("tr");
    const cell = tr ? cells.find((c) => c.el.closest("tr") === tr) : null;
    const row = cell ? cell.row : -1;
    if (row !== hoverRow) {
      hoverRow = row;
      wake();
    }
  };

  const onScroll = () => wake();

  const onVisibility = () => {
    if (document.hidden) {
      unready();
      return;
    }
    if (!scene) return;
    snap();
    draw(clock());
    markReady();
    wake();
  };

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) {
      scheduleSync();
      wake();
    }
  });

  const resizeObserver = new ResizeObserver(() => {
    if (!scene) return;
    measure();
    draw(clock());
    wake();
  });

  const mutations = new MutationObserver(scheduleSync);

  const fallback = () => {
    if (disposed) return;
    unready();
    stopTick?.();
    running = false;
    scene?.dispose();
    scene = null;
    canvas.style.display = "none";
  };

  const boot = async () => {
    if (disposed || !dom) return;
    await document.fonts?.ready;
    if (disposed) return;
    const first = dom.querySelector<HTMLElement>("[data-flap]");
    if (!first) return;
    const fontStyle = getComputedStyle(first);
    const { createBoardScene } = await import("./scene");
    if (disposed) return;
    measure();
    const dpr = Math.min(window.devicePixelRatio || 1, MOTION_LIMITS.dprCap);
    const created = createBoardScene(canvas, {
      dpr,
      palette: readPalette(root),
      font: { family: fontStyle.fontFamily, weight: fontStyle.fontWeight },
      seed: [...charsInUse(), ...DRUM],
      forced,
      onLost: fallback,
    });
    if (!created || disposed) {
      created?.dispose();
      fallback();
      return;
    }
    scene = created;
    scene.resize(size.width, size.height);
    readyAt = performance.now();
    tilt.scroll = scrollTarget();
    if (pinned !== null) {
      tilt.rest = MOTION_LIMITS.boardRest;
      arrival(readyAt + MOTION_DURATION.boardArrival);
    }
    draw(clock());
    window.requestAnimationFrame(() => {
      if (disposed || !scene) return;
      markReady();
      if (dom) mutations.observe(dom, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-text", "data-char"] });
      io.observe(root);
      resizeObserver.observe(root);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      dom?.addEventListener("pointerover", onRowOver);
      dom?.addEventListener("pointerleave", onRowOver);
      document.addEventListener("visibilitychange", onVisibility);
      wake();
    });
  };

  let cleanupViewport = () => {};
  const cancelIdle = onIdle(() => {
    const viewport = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      viewport.disconnect();
      boot().catch(fallback);
    });
    viewport.observe(root);
    cleanupViewport = () => viewport.disconnect();
  }, 1200);

  return {
    seed: (chars: string[]) => {
      seed = new Set(chars.join(""));
      ensureGlyphs();
      scheduleSync();
    },
    dispose: () => {
      disposed = true;
      cancelIdle();
      cleanupViewport();
      stopTick?.();
      window.cancelAnimationFrame(syncFrame);
      io.disconnect();
      resizeObserver.disconnect();
      mutations.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      dom?.removeEventListener("pointerover", onRowOver);
      dom?.removeEventListener("pointerleave", onRowOver);
      document.removeEventListener("visibilitychange", onVisibility);
      scene?.dispose();
      scene = null;
      unready();
    },
  };
}
