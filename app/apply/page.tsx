import { SecondaryPageShell } from "@/components/landing/secondary-page-shell";
import { LoanInquiryForm } from "@/components/vestednest/loan-inquiry-form";
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
    <SecondaryPageShell>
      <div className="secondary-content">
        <div className="secondary-badge">
          <span className="secondary-badge-dot" aria-hidden />
          Signed in · Loan inquiry
        </div>
        <h1 className="secondary-h1">Start your inquiry.</h1>
        <p className="secondary-lead">
          Welcome back, <strong>{displayName}</strong>. Enter a property address to pull
          parcel data, rent comps, and save your loan inquiry.
        </p>
        <LoanInquiryForm />
      </div>
    </SecondaryPageShell>
  );
}
