import { NextResponse } from "next/server";
import { z } from "zod";
import { runScenarioEngine } from "@/lib/scenario-engine";
import type { BorrowerGoal } from "@/lib/deal/types";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  deal: z.record(z.string(), z.unknown()),
  goal: z
    .enum(["cash-flow", "capital-efficiency", "return", "dscr", "lowest-rate", "lowest-payment"])
    .optional(),
});

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/scenario", 30);
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = runScenarioEngine(
      parsed.data.deal as Parameters<typeof runScenarioEngine>[0],
      (parsed.data.goal ?? "return") as BorrowerGoal,
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scenario engine failed" },
      { status: 500 },
    );
  }
}
