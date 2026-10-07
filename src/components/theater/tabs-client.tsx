"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { FlapRow } from "@/components/ui/Flap";
import { FlipRow } from "@/components/motion/FlipRow";
import { cn } from "@/lib/utils/cn";
import { TheaterStage, type StageLabels } from "./stage";
import type { BoxKind } from "./still";
import { ActiveSceneSteps, useTheaterSync } from "./sync";
import type { SceneId, TheaterDevice } from "./types";

export type TabMeta = {
  scene: SceneId;
  label: string;
  title: string;
  captions: string[];
  duration: string;
  box: BoxKind;
  device: TheaterDevice;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function TheaterTabsClient({
  tabs,
  poster,
  label,
  labels,
  remarks,
  header,
  footer,
  className,
}: {
  tabs: TabMeta[];
  poster: ReactNode;
  label: string;
  labels: StageLabels;
  remarks: { playing: string; done: string };
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const sync = useTheaterSync();
  const requested = useSearchParams().get("scene");
  const [active, setActive] = useState(() => Math.max(0, tabs.findIndex((t) => t.scene === requested)));
  const [touched, setTouched] = useState(() => tabs.some((t, i) => i > 0 && t.scene === requested));
  const [done, setDone] = useState<Set<SceneId>>(() => new Set());
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const tab = tabs[active]!;
  const setScene = sync?.setScene;

  useEffect(() => {
    setScene?.(tab.scene);
  }, [tab.scene, setScene]);

  useEffect(() => {
    const el = refs.current[active];
    const list = listRef.current;
    if (!el || !list || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: el.offsetLeft - 16, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active]);

  const go = (i: number, focus = false) => {
    const next = (i + tabs.length) % tabs.length;
    setActive(next);
    setTouched(true);
    if (focus) refs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") go(active + 1, true);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(active - 1, true);
    else if (e.key === "Home") go(0, true);
    else if (e.key === "End") go(tabs.length - 1, true);
    else return;
    e.preventDefault();
  };

  const finished = tab.scene;
  const advance = useCallback(() => {
    setDone((d) => new Set(d).add(finished));
    window.setTimeout(() => setActive((a) => (a + 1) % tabs.length), 900);
  }, [tabs.length, finished]);

  const list = (
    <div ref={listRef} role="tablist" aria-label={label} aria-orientation="vertical" onKeyDown={onKey} data-surface="board" className="th-tabs no-scrollbar">
      {tabs.map((t, i) => {
        const on = i === active;
        const remark = on ? remarks.playing : done.has(t.scene) ? remarks.done : "";
        return (
          <button
            key={t.scene}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`th-tab-${t.scene}`}
            aria-selected={on}
            aria-controls={`th-panel-${t.scene}`}
            tabIndex={on ? 0 : -1}
            onClick={() => go(i)}
            data-active={on || undefined}
            className="th-tab"
          >
            <FlapRow text={pad(i + 1)} size="sm" label="" className="shrink-0" />
            <span className="th-tab-label">{t.label}</span>
            <span aria-hidden="true" className="th-tab-time">
              {t.duration}
            </span>
            <span aria-hidden="true" className="th-tab-remark" data-tone={on ? "playing" : "done"}>
              <FlipRow text={remark} cells={7} tone={on ? "remark" : "muted"} size="xs" label="" />
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={cn("th-layout", header ? "th-layout-split" : null, className)} data-theater-tabs="">
      {header ? <div className="th-layout-head">{header}</div> : null}
      <div className="th-layout-tabs">{list}</div>
      <div role="tabpanel" id={`th-panel-${tab.scene}`} aria-labelledby={`th-tab-${tab.scene}`} className="th-layout-stage">
        <TheaterStage
          key={tab.scene}
          sceneId={tab.scene}
          device={tab.device}
          box={tab.box}
          title={tab.title}
          captions={tab.captions}
          labels={labels}
          poster={active === 0 ? poster : undefined}
          eager={touched}
          loop={false}
          external
          onFinish={advance}
        />
      </div>
      {header ? (
        <div className="th-layout-steps">
          <ActiveSceneSteps scenes={tabs.map((t) => ({ id: t.scene, captions: t.captions }))} />
          {footer}
        </div>
      ) : null}
    </div>
  );
}
