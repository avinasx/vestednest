import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const service = createServiceClient();
  if (!service) return NextResponse.json({ officers: [] });

  const { data } = await service
    .from("loan_officers")
    .select("*")
    .order("name");

  return NextResponse.json({ officers: data ?? [] });
}

export async function POST(request: Request) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
    avatar_initials?: string;
    active?: boolean;
  };

  if (!body.name || !body.email) {
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  }

  const { data, error: insertError } = await service
    .from("loan_officers")
    .insert({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      title: body.title ?? "Loan Officer",
      avatar_initials: body.avatar_initials ?? body.name.slice(0, 2).toUpperCase(),
      active: body.active ?? true,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ officer: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const body = (await request.json()) as {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
    avatar_initials?: string;
    active?: boolean;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { id, ...updates } = body;
  const { data, error: updateError } = await service
    .from("loan_officers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ officer: data });
}
