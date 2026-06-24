import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateFundingLane } from "@/lib/eligibility/matrix";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  state: z.string().min(2).max(2),
  vesting: z.enum(["llc", "individual", "foreign"]).optional(),
});

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/eligibility", 60);
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = evaluateFundingLane({
      state: parsed.data.state.toUpperCase(),
      vesting: parsed.data.vesting,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eligibility check failed" },
      { status: 500 },
    );
  }
}
