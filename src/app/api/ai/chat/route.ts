import { NextResponse } from "next/server";
import { z } from "zod";
import { createChatCompletion, type ChatMessage } from "@/lib/ai/openrouter-client";

export const maxDuration = 60;

/**
 * Generic authenticated proxy to the AI chat layer. Learning-domain
 * endpoints (e.g. /api/ai/vocabulary-explain) will be built on top of this
 * same pattern later; this route only proves the platform wiring
 * (auth check -> task routing -> OpenRouter) end to end.
 */

const requestSchema = z.object({
  task: z.enum([
    "chat_tutor",
    "reasoning",
    "fast_completion",
    "exam_generation",
    "game_engine",
    "flashcard_gen",
  ]),
  messages: z
    .array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() }))
    .min(1),
});

export async function POST(request: Request) {
  // Personal single-user app — no login wall on any feature.
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await createChatCompletion({
      task: parsed.data.task,
      messages: parsed.data.messages as ChatMessage[],
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed." },
      { status: 502 },
    );
  }
}
