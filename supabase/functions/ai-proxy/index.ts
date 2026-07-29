// Supabase Edge Function: ai-proxy
// Server-side-only proxy to OpenRouter, used for AI calls that must run
// close to the DB (e.g. triggered by Postgres webhooks/Realtime) instead
// of from the Next.js server. Mirrors src/lib/ai/openrouter-client.ts —
// keep model routing logic identical between the two.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
  }

  const { task, model, messages } = await req.json();

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }), {
      status: 500,
    });
  }

  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "LinguaVerse AI",
    },
    body: JSON.stringify({ model, messages, task }),
  });

  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: upstream.status,
  });
});
