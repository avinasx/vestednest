export function HeroMap() {
  const cells = Array.from({ length: 12 * 14 }, (_, i) => {
    const row = Math.floor(i / 14);
    const col = i % 14;
    const active =
      (row + col) % 5 === 0 ||
      (row * col) % 7 === 0 ||
      (row > 3 && row < 9 && col > 4 && col < 10);
    return active;
  });

  return (
    <div className="relative h-full min-h-[520px] w-full overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1d4d2e_0%,#050505_55%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_50%_20%,rgba(37,147,62,0.35),transparent_50%)]" />
      <div className="absolute inset-0 grid grid-cols-14 grid-rows-12 gap-[3px] p-6 opacity-90">
        {cells.map((active, i) => (
          <div
            key={i}
            className={`rounded-[2px] border border-white/5 ${
              active ? "bg-[#25933e]/90" : "bg-white/[0.03]"
            }`}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,transparent_0%,#000_75%)]" />
    </div>
  );
}
