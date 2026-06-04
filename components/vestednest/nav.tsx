import Link from "next/link";
import { AuthNav } from "./auth-nav";
import { VestedNestLogo } from "./logo";

const links = [
  "DSCR loans",
  "Bridge → DSCR",
  "lorem ipsum",
  "lorem ipsum",
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/80 bg-white">
      <div className="mx-auto flex h-[78px] w-full max-w-[1440px] items-center justify-between px-6 md:px-[80px]">
        <VestedNestLogo />
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((label) => (
            <a
              key={label}
              href="#"
              className="text-base leading-6 text-[#4a5565] transition-colors hover:text-black"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4 sm:gap-6">
          <AuthNav />
          <Link
            href="#loan-inquiry-form"
            className="rounded-full bg-black/10 px-5 py-3 text-sm font-medium leading-5 text-black sm:px-6"
          >
            Get pre-qualified
          </Link>
        </div>
      </div>
    </header>
  );
}
