/* eslint-disable @next/next/no-img-element */
export function CheckItem({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <span className={`landing-check${light ? " landing-check--light" : ""}`}>
      <img src="/landing/icon-check-circle.svg" alt="" aria-hidden />
      {children}
    </span>
  );
}
