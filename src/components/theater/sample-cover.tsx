function seedOf(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function SampleCover({ title, compact = false }: { title: string; compact?: boolean }) {
  const seed = seedOf(title);
  const pair = (seed % 6) + 1;
  const a = `var(--sample-${pair}-a)`;
  const b = `var(--sample-${pair}-b)`;
  const route = ((seed >>> 3) & 1) === 0;
  const lift = 150 + ((seed >>> 5) % 4) * 18;
  const words = title.split(" ");
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" aria-hidden="true">
      <rect width="300" height="400" fill={a} />
      {route ? (
        <>
          <rect x="0" y={lift + 70} width="300" height={230 - lift} fill={b} />
          <path d={`M-10 ${lift + 20} H170 L230 ${lift - 40} H262`} fill="none" stroke={b} strokeWidth="14" strokeLinejoin="round" />
          <circle cx="92" cy={lift + 20} r="17" fill={a} stroke={b} strokeWidth="10" />
          <rect x="262" y={lift - 78} width="16" height="76" fill={b} />
        </>
      ) : (
        <>
          <rect x="30" y="44" width="150" height="120" fill={b} />
          <rect x="30" y="176" width="150" height="68" fill={b} />
          <circle cx="222" cy={lift + 30} r="48" fill="none" stroke={b} strokeWidth="18" />
        </>
      )}
      {compact ? null : (
        <text x="22" y={route ? 352 : 330} fill="var(--sample-ink)" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 25, letterSpacing: "-0.01em" }}>
          {words.map((w, i) => (
            <tspan key={w + i} x="22" dy={i === 0 ? 0 : 27}>
              {w}
            </tspan>
          ))}
        </text>
      )}
    </svg>
  );
}
