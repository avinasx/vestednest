import { NextResponse } from "next/server";
import { submitPrequal } from "@/lib/applications";
import { getClientIp } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as { consent?: boolean };
    if (!body.consent) {
      return NextResponse.json(
        { error: "Consent is required for soft credit pull" },
        { status: 400 },
      );
    }

    const ip = getClientIp(request);
    const app = await submitPrequal(id, ip);

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application: app, status: "prequal_submitted" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pre-qual submit failed" },
      { status: 500 },
    );
  }
}
