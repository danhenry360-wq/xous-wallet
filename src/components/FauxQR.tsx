// A deterministic, decorative QR-style code derived from the address string.
// It is intentionally non-scannable — this is a simulated wallet.
export function FauxQR({ seed, size = 168 }: { seed: string; size?: number }) {
  const n = 25;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };

  const cells: boolean[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => rand() > 0.52)
  );

  const isFinder = (r: number, c: number) => {
    const inBox = (R: number, C: number) =>
      r >= R && r < R + 7 && c >= C && c < C + 7;
    return inBox(0, 0) || inBox(0, n - 7) || inBox(n - 7, 0);
  };

  const cell = size / n;

  return (
    <div
      className="rounded-2xl bg-white p-3 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {cells.map((row, r) =>
          row.map((on, c) => {
            if (isFinder(r, c)) return null;
            return on ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell}
                y={r * cell}
                width={cell * 0.92}
                height={cell * 0.92}
                rx={cell * 0.2}
                fill="#0a0b0f"
              />
            ) : null;
          })
        )}
        {[
          [0, 0],
          [0, (n - 7) * cell],
          [(n - 7) * cell, 0],
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width={cell * 7} height={cell * 7} rx={cell} fill="#0a0b0f" />
            <rect
              x={x + cell}
              y={y + cell}
              width={cell * 5}
              height={cell * 5}
              rx={cell * 0.8}
              fill="#fff"
            />
            <rect
              x={x + cell * 2}
              y={y + cell * 2}
              width={cell * 3}
              height={cell * 3}
              rx={cell * 0.6}
              fill="#6d5efc"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
