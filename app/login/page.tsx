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
    <main className="flex min-h-screen items-center justify-center bg-vn-bg px-6">
      <div className="w-full max-w-md rounded-xl border border-black/5 bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-light text-black/60 transition-colors hover:text-black"
        >
          ← Back to home
        </Link>
        <h1 className="text-2xl font-semibold text-black">Sign in</h1>
        <p className="mt-2 text-sm font-light text-black/70">
          Continue with Google to access the loan inquiry form and save your
          property lookups.
        </p>
        {error === "auth" ? (
          <p className="mt-3 text-sm text-red-600">
            Sign-in failed. Please try again.
          </p>
        ) : null}
        <div className="mt-8">
          <AuthForm redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
