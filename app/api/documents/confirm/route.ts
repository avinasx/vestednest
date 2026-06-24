import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getApplication } from "@/lib/applications";

const schema = z.object({
  applicationId: z.string().uuid(),
  docType: z.string().min(1),
  filePath: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().optional(),
  sizeBytes: z.number().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!parsed.data.filePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const app = await getApplication(parsed.data.applicationId);
  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const { error: insertError } = await service.from("application_documents").insert({
    application_id: parsed.data.applicationId,
    user_id: user.id,
    doc_type: parsed.data.docType,
    file_path: parsed.data.filePath,
    file_name: parsed.data.fileName,
    content_type: parsed.data.contentType ?? null,
    size_bytes: parsed.data.sizeBytes ?? null,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (!app.user_id) {
    await service
      .from("applications")
      .update({ user_id: user.id })
      .eq("id", parsed.data.applicationId);
  }

  return NextResponse.json({ ok: true });
}
