import { AdminPageHeader } from "@/components/admin/admin-shell";
import Link from "next/link";
import { getIntegrationStatus } from "@/lib/settings";
import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminDashboardPage() {
  const service = createServiceClient();
  const integrationStatus = await getIntegrationStatus();

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

  const integrations = [
    { name: "Supabase", ok: integrationStatus.supabase },
    { name: "Realie", ok: integrationStatus.realie },
    { name: "RentCast", ok: integrationStatus.rentcast },
    { name: "Gemini", ok: integrationStatus.gemini },
    { name: "Supermemory", ok: integrationStatus.supermemory },
    { name: "SendGrid", ok: integrationStatus.sendgrid },
    { name: "Twilio", ok: integrationStatus.twilio },
  ];

  return (
    <>
      <AdminPageHeader
        badge="Operations"
        title="Dashboard"
        lead="Production overview for Vested Nest DSCR lending operations."
      />

      <div className="admin-stat-grid">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="admin-stat-card">
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="admin-grid-2" style={{ marginTop: 32 }}>
        <section className="admin-card">
          <h2 className="admin-card-title">Quick actions</h2>
          <ul className="admin-list admin-list--links admin-card-body">
            <li>
              <Link href="/admin/logic" className="admin-list-link">
                Review underwriting logic & state matrix →
              </Link>
            </li>
            <li>
              <Link href="/admin/knowledge" className="admin-list-link">
                Add knowledge base document →
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="admin-list-link">
                Configure rate settings & funded states →
              </Link>
            </li>
            <li>
              <Link href="/" className="admin-list-link">
                View production app →
              </Link>
            </li>
          </ul>
        </section>

        <section className="admin-card">
          <h2 className="admin-card-title">System status</h2>
          <ul className="admin-list admin-list--status admin-card-body">
            {integrations.map((item) => (
              <li key={item.name}>
                {item.ok ? "✓" : "○"} {item.name}:{" "}
                {item.ok ? "Connected" : "Not set"}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
