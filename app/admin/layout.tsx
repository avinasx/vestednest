import { AuthNav } from "@/components/vestednest/auth-nav";
import { promoteSuperadminIfEligible } from "@/lib/auth/superadmin";
import { getSessionProfile, isSuperadmin } from "@/lib/auth/session";
import Link from "next/link";
import { redirect } from "next/navigation";

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
      <main className="flex min-h-screen items-center justify-center bg-vn-bg px-6">
        <div className="max-w-md rounded-xl border border-black/5 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-black">Access denied</h1>
          <p className="mt-2 text-sm text-black/70">
            Admin access requires a superadmin account. Contact your administrator
            or sign in with an authorized email.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-vn-green hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-vn-bg">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-lg font-semibold text-black">
              Vested Nest Admin
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="text-black/70 hover:text-black">
                Dashboard
              </Link>
              <Link href="/admin/knowledge" className="text-black/70 hover:text-black">
                Knowledge Base
              </Link>
              <Link href="/admin/settings" className="text-black/70 hover:text-black">
                Settings
              </Link>
            </nav>
          </div>
          <AuthNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
