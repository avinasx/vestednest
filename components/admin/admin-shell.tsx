import type { ReactNode } from "react";
import { AuthNav } from "@/components/vestednest/auth-nav";
import { VestedNestLogo } from "@/components/vestednest/logo";
import Link from "next/link";
import { AdminNav } from "./admin-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-brand">
            <Link href="/" className="admin-logo-link" aria-label="Vested Nest home">
              <VestedNestLogo />
            </Link>
            <span className="admin-header-badge">Admin</span>
          </div>
          <AdminNav />
          <div className="admin-header-actions">
            <Link href="/" className="admin-header-home">
              View site
            </Link>
            <AuthNav />
          </div>
        </div>
      </header>
      <div className="admin-grid" aria-hidden />
      <main className="admin-main">{children}</main>
    </div>
  );
}

type AdminPageHeaderProps = {
  badge?: string;
  title: string;
  lead?: string;
};

export function AdminPageHeader({ badge, title, lead }: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      {badge ? (
        <div className="secondary-badge">
          <span className="secondary-badge-dot" aria-hidden />
          {badge}
        </div>
      ) : null}
      <h1 className="admin-page-title">{title}</h1>
      {lead ? <p className="admin-page-lead">{lead}</p> : null}
    </header>
  );
}
