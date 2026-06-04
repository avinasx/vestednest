const logos = [
  "BiggerPockets",
  "Bloomberg",
  "Inman",
  "HOUSINGWIRE",
  "THE REAL DEAL",
];

export function PressLogos() {
  return (
    <section className="border-y border-black/[0.04] bg-vn-bg py-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-center gap-10 px-6 md:gap-16 md:px-[100px]">
        {logos.map((name) => (
          <span
            key={name}
            className="text-sm font-semibold tracking-wide text-black/35 grayscale md:text-base"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
