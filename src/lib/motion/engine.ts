import { readMotionEnv, type MotionEnv } from "./env";
import { mountDepth } from "./scenes/depth";
import { mountGate } from "./scenes/gate";
import { mountNextStop } from "./scenes/next-stop";
import { mountRails } from "./scenes/rails";
import { mountRoutes } from "./scenes/routes";
import { mountSign } from "./scenes/sign";

interface Scene {
  selector: string;
  mount: (el: HTMLElement, env: MotionEnv) => () => void;
  reduced?: boolean;
}

interface PageScene {
  mount: (root: Document, env: MotionEnv) => () => void;
  reduced?: boolean;
}

const SCENES: Scene[] = [{ selector: '[data-scene="routes"], [data-scene="gate"], [data-route-line="footer"]', mount: mountRoutes }];

const PAGE_SCENES: PageScene[] = [{ mount: mountRails, reduced: true }, { mount: mountSign }, { mount: mountGate }, { mount: mountNextStop }, { mount: mountDepth }];

const yieldToMain = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0));

export function mountMotion(root: Document): () => void {
  const env = readMotionEnv();
  const cleanups: (() => void)[] = [];
  let cancelled = false;

  (async () => {
    for (const scene of PAGE_SCENES) {
      if (env.reduced && !scene.reduced) continue;
      await yieldToMain();
      if (cancelled) return;
      cleanups.push(scene.mount(root, env));
    }
    for (const scene of SCENES) {
      if (env.reduced && !scene.reduced) continue;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(scene.selector));
      if (nodes.length === 0) continue;
      await yieldToMain();
      if (cancelled) return;
      for (const node of nodes) cleanups.push(scene.mount(node, env));
    }
  })();

  return () => {
    cancelled = true;
    for (const cleanup of cleanups.reverse()) cleanup();
    cleanups.length = 0;
  };
}
