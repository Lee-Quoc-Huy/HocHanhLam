import { NextResponse } from "next/server";
import { z } from "zod";
import { createChatCompletion, type ChatMessage } from "@/lib/ai/openrouter-client";
import { SearchResultItem } from "@/features/search/types";

const requestSchema = z.object({
  query: z.string().min(1),
  domain: z.enum([
    "all",
    "vocabulary",
    "grammar",
    "conversation",
    "documents",
    "flashcards",
    "quizzes",
    "collections",
    "knowledge_graph",
    "recommendation",
  ]).default("all"),
  language: z.enum(["all", "en", "ko", "zh"]).default("all"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { query, domain } = parsed.data;

  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are the Semantic Hybrid Search & AI Ranking Engine for LinguaVerse AI / Học Hành Lắm.
Analyze the user's search query: "${query}" (Domain filter: ${domain}).
Perform hybrid vector and keyword matching across Vocabulary, Grammar, Conversations, Documents, Flashcards, Quizzes, Collections, Knowledge Graph, and Recommendations.

Return ONLY a valid JSON array of objects matching this exact structure:
[
  {
    "id": "res-1",
    "domain": "vocabulary",
    "title": "Serendipity",
    "subtitle": "/ˌser.ənˈdɪp.ə.ti/ · IELTS Academic",
    "snippet": "Sự tình cờ may mắn. The occurrence of events by chance in a happy or beneficial way.",
    "url": "/vocabulary",
    "similarityScore": 98,
    "matchType": "semantic_vector",
    "language": "en"
  },
  {
    "id": "res-2",
    "domain": "grammar",
    "title": "Used to vs. Be used to",
    "subtitle": "English Grammar · Intermediate",
    "snippet": "Diễn tả thói quen trong quá khứ so với thói quen ở hiện tại.",
    "url": "/grammar",
    "similarityScore": 92,
    "matchType": "keyword_hybrid",
    "language": "en"
  }
]`,
      },
      { role: "user", content: `Search Query: ${query}` },
    ];

    const res = await createChatCompletion({ task: "fast_completion", messages });
    const jsonMatch = res.content.match(/\[[\s\S]*\]/);
    const results: SearchResultItem[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Semantic Search Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed." },
      { status: 502 }
    );
  }
}
