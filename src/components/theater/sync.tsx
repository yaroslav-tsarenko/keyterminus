"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SyncValue = { chapter: number; setChapter: (i: number) => void; scene: string | null; setScene: (id: string | null) => void };

const SyncContext = createContext<SyncValue | null>(null);

export function TheaterSync({ children }: { children: ReactNode }) {
  const [chapter, setChapter] = useState(-1);
  const [scene, setScene] = useState<string | null>(null);
  const value = useMemo(() => ({ chapter, setChapter, scene, setScene }), [chapter, scene]);
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useTheaterSync() {
  return useContext(SyncContext);
}

export function TheaterSteps({ steps, className, reduced = false }: { steps: string[]; className?: string; reduced?: boolean }) {
  const sync = useTheaterSync();
  const active = reduced ? -1 : (sync?.chapter ?? -1);
  return (
    <ol data-theater-steps="" className={cn("th-steps", className)}>
      {steps.map((text, i) => {
        const state = active > i ? "done" : active === i ? "current" : active < 0 ? "station" : "upcoming";
        return (
          <li key={text} data-state={state} aria-current={state === "current" ? "step" : undefined} className="th-step">
            <span aria-hidden="true" className="th-step-stop">
              {state === "done" ? <Check size={10} strokeWidth={3.5} /> : null}
            </span>
            <span className="th-step-text">
              <span className="sr-only">Step {i + 1}: </span>
              {text}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function ActiveSceneSteps({ scenes, className }: { scenes: { id: string; captions: string[] }[]; className?: string }) {
  const sync = useTheaterSync();
  const current = scenes.find((s) => s.id === sync?.scene) ?? scenes[0];
  if (!current) return null;
  return <TheaterSteps key={current.id} steps={current.captions} className={className} />;
}
