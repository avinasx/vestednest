import { NextResponse } from "next/server";
import { upsertApplication } from "@/lib/applications";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      applicationId?: string;
      address?: string;
      propertyIntel?: unknown;
      termSheet?: unknown;
      fico?: number;
      borrowerType?: string;
      purpose?: string;
      status?: string;
    };

    if (!body.sessionId || !body.address) {
      return NextResponse.json(
        { error: "sessionId and address are required" },
        { status: 400 },
      );
    }

    const app = await upsertApplication({
      sessionId: body.sessionId,
      applicationId: body.applicationId,
      address: body.address,
      propertyIntel: body.propertyIntel as never,
      termSheet: body.termSheet as never,
      fico: body.fico,
      borrowerType: body.borrowerType,
      purpose: body.purpose,
      status: body.status as never,
    });

    if (!app) {
      return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
    }

    return NextResponse.json({ application: app });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 },
    );
  }
}
