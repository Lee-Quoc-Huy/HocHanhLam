// Supabase Edge Function: embed-content
// Placeholder — will generate pgvector embeddings for study content so it
// becomes semantically searchable. Left unimplemented for the same reason
// as ocr-processor: no learning-domain logic in this scaffold.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (_req: Request) => {
  return new Response(
    JSON.stringify({ message: "embed-content not implemented in the platform scaffold." }),
    { status: 501, headers: { "Content-Type": "application/json" } },
  );
});
