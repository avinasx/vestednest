import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminDashboardPage() {
  const service = createServiceClient();

  const [apps, inquiries, kb, lo] = service
    ? await Promise.all([
        service.from("applications").select("id", { count: "exact", head: true }),
        service.from("loan_inquiries").select("id", { count: "exact", head: true }),
        service.from("knowledge_documents").select("id", { count: "exact", head: true }),
        service.from("loan_officers").select("id", { count: "exact", head: true }),
      ])
    : [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }];

  const stats = [
    { label: "Applications", value: apps.count ?? 0, href: "/admin" },
    { label: "Loan Inquiries", value: inquiries.count ?? 0, href: "/apply" },
    { label: "KB Documents", value: kb.count ?? 0, href: "/admin/knowledge" },
    { label: "Loan Officers", value: lo.count ?? 0, href: "/admin/settings" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
      <p className="mt-1 text-sm text-black/60">
        Production overview for Vested Nest DSCR lending operations.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-black/5 bg-white p-6 shadow-sm transition hover:border-vn-green/30"
          >
            <div className="text-3xl font-bold text-vn-green">{s.value}</div>
            <div className="mt-1 text-sm text-black/70">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">Quick actions</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/admin/knowledge" className="text-vn-green hover:underline">
                Add knowledge base document →
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="text-vn-green hover:underline">
                Configure rate settings & funded states →
              </Link>
            </li>
            <li>
              <Link href="/" className="text-vn-green hover:underline">
                View production app →
              </Link>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">System status</h2>
          <ul className="mt-4 space-y-2 text-sm text-black/70">
            <li>Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Connected" : "✗ Missing"}</li>
            <li>Realie: {process.env.REALIE_API_KEY ? "✓ Configured" : "○ Not set"}</li>
            <li>Gemini: {process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY ? "✓ Configured" : "○ Not set"}</li>
            <li>Supermemory: {process.env.SUPERMEMORY_API_KEY ? "✓ Configured" : "○ Not set"}</li>
            <li>SendGrid: {process.env.SENDGRID_API_KEY ? "✓ Configured" : "○ Not set"}</li>
            <li>Twilio: {process.env.TWILIO_ACCOUNT_SID ? "✓ Configured" : "○ Not set"}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
