import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Placeholder for Gemini Vision OCR ingestion (document photos -> text).
 * Wiring only: validates auth and the incoming multipart payload shape.
 * The actual extraction pipeline belongs to the (not-yet-built) documents
 * learning module and will call supabase/functions/ocr-processor.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' in form data." }, { status: 400 });
  }

  return NextResponse.json(
    { message: "OCR pipeline not implemented in the platform scaffold yet." },
    { status: 501 },
  );
}
