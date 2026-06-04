import { AuthForm } from "@/components/vestednest/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-vn-bg px-6">
      <div className="w-full max-w-md rounded-xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-black">Sign in</h1>
        <p className="mt-2 text-sm font-light text-black/70">
          Continue with Google to save your loan inquiries to your account.
        </p>
        <div className="mt-8">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
