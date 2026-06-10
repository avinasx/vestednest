"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/logic", label: "Logic Engine" },
  { href: "/admin/knowledge", label: "Knowledge Base" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={mobile ? "admin-nav-mobile" : "admin-nav"} aria-label="Admin">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-nav-link${active ? " admin-nav-link--active" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
