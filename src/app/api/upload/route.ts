import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { getEnv, getOptionalEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  const bucket = getOptionalEnv("SUPABASE_STORAGE_BUCKET") ?? "archive-images";
  const serviceRoleKey = getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!serviceRoleKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured." }, { status: 500 });
  }

  const supabase = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), serviceRoleKey);
  const fileExt = file.name.split(".").pop() ?? "jpg";
  const filePath = `bands/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return NextResponse.json({ publicUrl: data.publicUrl });
}
