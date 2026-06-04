import { LoanInquiryForm } from "@/components/vestednest/loan-inquiry-form";
import { Nav } from "@/components/vestednest/nav";
import { PageShell } from "@/components/vestednest/section";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/apply");
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "there";

  return (
    <PageShell>
      <Nav />
      <main className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-[100px] md:py-16">
        <h1 className="text-[40px] font-semibold leading-tight text-black md:text-[46px]">
          Start your inquiry
        </h1>
        <p className="mt-4 max-w-[640px] text-lg font-light leading-8 text-black/80">
          Welcome back, {displayName}. Enter a property address to pull property
          data and save your loan inquiry.
        </p>
        <LoanInquiryForm />
      </main>
    </PageShell>
  );
}
