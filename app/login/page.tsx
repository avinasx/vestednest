import { SecondaryPageShell } from "@/components/landing/secondary-page-shell";
import { AuthForm } from "@/components/vestednest/auth-form";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const redirectTo = next?.startsWith("/") ? next : "/apply";

  return (
    <SecondaryPageShell centered narrow>
      <div className="secondary-card secondary-auth-card">
        <Link href="/" className="secondary-back-link">
          ← Back to home
        </Link>
        <div className="secondary-badge secondary-badge--muted">
          <span className="secondary-badge-dot" aria-hidden />
          Account access
        </div>
        <h1 className="secondary-h1 secondary-h1--sm">Sign in</h1>
        <p className="secondary-lead secondary-lead--sm">
          Continue with Google to access the loan inquiry form and save your property
          lookups.
        </p>
        {error === "auth" ? (
          <p className="secondary-error">Sign-in failed. Please try again.</p>
        ) : null}
        {error === "denied" ? (
          <p className="secondary-error">
            Access denied. Admin access requires a superadmin account.
          </p>
        ) : null}
        <div className="secondary-auth-form">
          <AuthForm redirectTo={redirectTo} />
        </div>
        <p className="secondary-footnote">
          No hard pull · No W2 · Soft credit only when you proceed
        </p>
      </div>
    </SecondaryPageShell>
  );
}
