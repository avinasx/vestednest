import { NextResponse } from "next/server";
import { searchAddressSuggestions } from "@/lib/realie";
import { ensureServerSettings } from "@/lib/settings";

export async function GET(request: Request) {
  await ensureServerSettings();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const state = searchParams.get("state") ?? "";

  if (!state || state.length !== 2) {
    return NextResponse.json(
      { error: "A two-letter state code is required (e.g. FL)." },
      { status: 400 },
    );
  }

  try {
    const { suggestions, error } = await searchAddressSuggestions(
      query,
      state,
    );
    if (error) {
      return NextResponse.json({ error }, { status: 502 });
    }
    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Address suggestion failed",
      },
      { status: 500 },
    );
  }
}
