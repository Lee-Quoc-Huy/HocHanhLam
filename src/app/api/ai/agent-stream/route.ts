import { NextResponse } from "next/server";
import { z } from "zod";
import { createChatStream, type ChatMessage } from "@/lib/ai/openrouter-client";
import { AGENT_TEMPLATES } from "@/features/ai-center/lib/prompt-templates";
import { AgentType } from "@/features/ai-center/types";

const requestSchema = z.object({
  agentType: z.enum([
    "vocabulary",
    "grammar",
    "teacher",
    "conversation",
    "planner",
    "search",
    "translation",
    "recommendation",
  ]),
  targetLanguage: z.enum(["en", "ko", "zh"]).default("en"),
  messages: z
    .array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() }))
    .min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { agentType, targetLanguage, messages } = parsed.data;

  const template = AGENT_TEMPLATES[agentType as AgentType];
  const langLabel =
    targetLanguage === "en" ? "English" : targetLanguage === "ko" ? "Korean" : "Chinese";

  const systemMessage: ChatMessage = {
    role: "system",
    content: template.systemPrompt(langLabel),
  };

  const fullMessages: ChatMessage[] = [systemMessage, ...(messages as ChatMessage[])];

  try {
    const streamResponse = await createChatStream({
      task: template.taskType,
      messages: fullMessages,
      temperature: 0.7,
      stream: true,
    });

    return new Response(streamResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Agent Stream Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Streaming failed." },
      { status: 502 }
    );
  }
}
