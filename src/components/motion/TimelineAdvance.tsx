"use client";

import { useLayoutEffect, useRef } from "react";
import { advanceRoute, reachedStop } from "@/lib/motion/scenes/next-stop";

export function TimelineAdvance({ status }: { status: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef<{ status: string; reached: number } | null>(null);

  useLayoutEffect(() => {
    const route = ref.current?.closest<HTMLElement>("[data-timeline]")?.querySelector<HTMLElement>(".route");
    if (!route) return;
    const reached = reachedStop(route);
    const before = previous.current;
    previous.current = { status, reached };
    if (!before || before.status === status) return;
    advanceRoute(route, before.reached, reached);
  }, [status]);

  return <span ref={ref} hidden />;
}
