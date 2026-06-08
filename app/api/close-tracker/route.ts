import { NextResponse } from "next/server";
import { getCloseTrackerData } from "@/lib/applications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const data = await getCloseTrackerData(id);
  if (!data) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
