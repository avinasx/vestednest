import { AdminNav } from "@/components/admin/admin-nav";
import { AdminShell } from "@/components/admin/admin-shell";
import { promoteSuperadminIfEligible } from "@/lib/auth/superadmin";
import { getSessionProfile, isSuperadmin } from "@/lib/auth/session";
import Link from "next/link";
import { redirect } from "next/navigation";
import "../admin.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await promoteSuperadminIfEligible();
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/login?next=/admin");
  }

  if (!isSuperadmin(profile.role)) {
    return (
      <div className="admin-page">
        <div className="admin-grid" aria-hidden />
        <div className="admin-denied-wrap">
          <div className="secondary-card secondary-auth-card">
            <div className="secondary-badge secondary-badge--muted">
              <span className="secondary-badge-dot" aria-hidden />
              Access restricted
            </div>
            <h1 className="secondary-h1 secondary-h1--sm">Access denied</h1>
            <p className="secondary-lead secondary-lead--sm">
              Admin access requires a superadmin account. Contact your administrator or sign in
              with an authorized email.
            </p>
            <Link href="/" className="secondary-back-link">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <div className="admin-mobile-nav">
        <AdminNav mobile />
      </div>
      {children}
    </AdminShell>
  );
}
