// Supabase Edge Function: ocr-processor
// Placeholder — will receive a Storage object path, call Gemini Vision for
// OCR, and write extracted text back to the (future) documents table.
// Left unimplemented intentionally: this scaffold covers platform wiring
// only, not learning-domain modules.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (_req: Request) => {
  return new Response(
    JSON.stringify({ message: "ocr-processor not implemented in the platform scaffold." }),
    { status: 501, headers: { "Content-Type": "application/json" } },
  );
});
