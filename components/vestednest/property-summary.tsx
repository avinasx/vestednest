import { buildRealiePropertySections } from "@/lib/realie-property-display";

type PropertySummaryProps = {
  property: Record<string, unknown>;
};

export function PropertySummary({ property }: PropertySummaryProps) {
  const sections = buildRealiePropertySections(property);

  return (
    <div className="mt-4 space-y-4">
      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-lg border border-vn-green/20 bg-vn-green/5 p-4"
        >
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-vn-green">
            {section.title}
          </h4>
          <dl className="grid gap-2 text-sm">
            {section.rows.map(({ label, value }) => (
              <div
                key={`${section.title}-${label}`}
                className="grid gap-1 border-b border-black/5 pb-2 last:border-0 last:pb-0 sm:grid-cols-[minmax(8rem,30%)_1fr]"
              >
                <dt className="font-medium text-black/60">{label}</dt>
                <dd className="break-words text-black sm:text-right">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
