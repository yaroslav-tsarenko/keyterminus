import type { MotionEnv } from "../env";

export function mountSign(root: Document, env: MotionEnv): () => void {
  if (env.reduced) return () => {};
  const fold = window.innerHeight;
  const signs = Array.from(root.querySelectorAll<HTMLElement>('[data-anim="sign"]')).filter((el) => el.getBoundingClientRect().top > fold);
  if (signs.length === 0) return () => {};
  for (const el of signs) el.dataset.sign = "armed";
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.sign = "in";
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.2 },
  );
  for (const el of signs) io.observe(el);
  return () => {
    io.disconnect();
    for (const el of signs) delete el.dataset.sign;
  };
}
