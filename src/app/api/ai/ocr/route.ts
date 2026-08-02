import { NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * Placeholder for Gemini Vision OCR ingestion (document photos -> text).
 * Wiring only: validates auth and the incoming multipart payload shape.
 * The actual extraction pipeline belongs to the (not-yet-built) documents
 * learning module and will call supabase/functions/ocr-processor.
 */
export async function POST(request: Request) {
  // Personal single-user app — no login wall on any feature.
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
