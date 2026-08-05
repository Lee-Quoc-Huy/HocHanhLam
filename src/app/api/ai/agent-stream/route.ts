import { NextResponse } from "next/server";
import { z } from "zod";
import { createChatStream, type ChatMessage } from "@/lib/ai/openrouter-client";
import { AGENT_TEMPLATES } from "@/features/ai-center/lib/prompt-templates";
import { AgentType } from "@/features/ai-center/types";
import { AI_MODEL_ROUTES } from "@/config/ai-models";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const requestSchema = z.object({
  agentType: z.enum(["vocabulary", "grammar", "teacher", "translation", "flashcard"]),
  targetLanguage: z.enum(["en", "ko", "zh"]).default("en"),
  messages: z
    .array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() }))
    .min(1),
  useWebSearch: z.boolean().default(false),
  responseMode: z.enum(["short", "explain"]).default("short"),
});

// Lets the person ask for content creation in plain chat ("hãy tạo 1
// flashcard từ vựng tiếng Hàn về trường học", "thêm giúp tôi từ này vào kho
// từ vựng", "soạn 5 từ vựng chủ đề du lịch"...) without needing to attach an
// image. When the request implies creating vocabulary/grammar/flashcards,
// the model appends a structured block the client parses out of the reply
// and renders as the same confirm-to-save card used for image attachments —
// nothing is ever saved without the person clicking a "Lưu" button.
const ACTION_PROTOCOL_INSTRUCTIONS = `--- GIAO THỨC TẠO NỘI DUNG (ACTION_JSON) ---
Nếu người dùng yêu cầu bạn TẠO MỚI một hoặc nhiều mục từ vựng, cấu trúc ngữ pháp, hoặc flashcard (ví dụ: "tạo giúp tôi 1 flashcard...", "soạn 5 từ vựng chủ đề...", "thêm từ này vào kho từ vựng", "tạo cấu trúc ngữ pháp về...", hoặc bất kỳ cách diễn đạt tương đương nào khác bằng tiếng Việt hay ngoại ngữ), hãy:
1. Trả lời bình thường bằng văn bản thân thiện, ngắn gọn xác nhận những gì bạn vừa tạo.
2. Ở CUỐI câu trả lời, thêm một khối JSON duy nhất được bọc chính xác trong thẻ <ACTION_JSON> và </ACTION_JSON>, theo đúng cấu trúc:
<ACTION_JSON>
{
  "vocabulary": [ { "language": "en|ko|zh", "word": "...", "ipa": "...", "vietnamese": "...", "english_meaning": "...", "part_of_speech": "...", "example": "...", "example_translation": "...", "difficulty": "beginner|intermediate|advanced|master" } ],
  "grammar": [ { "language": "en|ko|zh", "title": "...", "meaning": "...", "explanation": "...", "examples": [{"example":"...","translation":"..."}], "category": "...", "difficulty": "beginner|intermediate|advanced|master" } ],
  "flashcards": [ { "front_text": "...", "front_subtext": "...", "back_text": "...", "back_explanation": "...", "tags": ["..."] } ]
}
</ACTION_JSON>
3. Chỉ điền các mảng thực sự liên quan đến yêu cầu, để mảng rỗng [] cho phần không liên quan.
4. TUYỆT ĐỐI KHÔNG dùng khối ACTION_JSON nếu người dùng chỉ đang hỏi/giải thích/trò chuyện thông thường mà không yêu cầu tạo mới nội dung để lưu.
5. Không đề cập đến việc "đã lưu" — vì nội dung chỉ được lưu khi người dùng tự bấm xác nhận trên giao diện, không phải do bạn.`;

async function buildLiveDataContext(agentType: AgentType, targetLanguage: string): Promise<string> {
  if (agentType !== "vocabulary" && agentType !== "grammar" && agentType !== "flashcard") return "";

  const supabase = await createClient();
  const blocks: string[] = [];

  try {
    if (agentType === "vocabulary" || agentType === "flashcard") {
      const { data } = await supabase
        .from("vocabulary")
        .select("word, vietnamese, part_of_speech, collection, language")
        .eq("language", targetLanguage)
        .order("created_at", { ascending: false })
        .limit(60);

      if (data && data.length > 0) {
        const lines = data
          .map((w: any) => `- ${w.word} (${w.part_of_speech}) — ${w.vietnamese} [Bộ sưu tập: ${w.collection}]`)
          .join("\n");
        blocks.push(`DỮ LIỆU TỪ VỰNG HIỆN CÓ (mẫu tối đa 60 từ mới nhất, ngôn ngữ ${targetLanguage}):\n${lines}`);
      }
    }

    if (agentType === "grammar" || agentType === "flashcard") {
      const { data } = await supabase
        .from("grammar")
        .select("title, meaning, category, language")
        .eq("language", targetLanguage)
        .order("created_at", { ascending: false })
        .limit(40);

      if (data && data.length > 0) {
        const lines = data
          .map((g: any) => `- ${g.title} — ${g.meaning} [Danh mục: ${g.category}]`)
          .join("\n");
        blocks.push(`DỮ LIỆU NGỮ PHÁP HIỆN CÓ (mẫu tối đa 40 cấu trúc mới nhất, ngôn ngữ ${targetLanguage}):\n${lines}`);
      }
    }
  } catch {
    // Offline / query failed — agent just answers without live grounding.
  }

  return blocks.length > 0 ? `\n\n${blocks.join("\n\n")}` : "";
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { agentType, targetLanguage, messages, useWebSearch, responseMode } = parsed.data;

  const template = AGENT_TEMPLATES[agentType as AgentType];
  const langLabel =
    targetLanguage === "en" ? "English" : targetLanguage === "ko" ? "Korean" : "Chinese";

  const liveDataContext = await buildLiveDataContext(agentType as AgentType, targetLanguage);

  // Brevity injection — short mode forces one tight paragraph/bullets;
  // explain mode allows full depth.
  const brevityInstruction =
    responseMode === "short"
      ? `\n\n**CHẾ ĐỘ TRẢ LỜI NGẮN:** Chỉ trả lời ĐÚNG trọng tâm người dùng hỏi. Tối đa 2–3 câu hoặc 1 danh sách ngắn. KHÔNG giải thích thêm, KHÔNG lịch sự vòng vo, KHÔNG ví dụ thừa. Tiết kiệm token tối đa.`
      : `\n\n**CHẾ ĐỘ GIẢI THÍCH:** Trả lời đầy đủ, có chiều sâu. Bao gồm: định nghĩa rõ ràng, ví dụ thực tế, phân tích ngữ pháp/ngữ nghĩa nếu cần, mẹo ghi nhớ. Định dạng Markdown với tiêu đề phân cấp.`;

  const systemMessage: ChatMessage = {
    role: "system",
    content: useWebSearch
      ? `${template.systemPrompt(langLabel)}${liveDataContext}${brevityInstruction}\n\nBạn có quyền truy cập Internet cho câu trả lời này — hãy tra cứu thông tin mới nhất/chính xác nhất khi cần, và nêu rõ nếu có dùng nguồn từ web.\n\n${ACTION_PROTOCOL_INSTRUCTIONS}`
      : `${template.systemPrompt(langLabel)}${liveDataContext}${brevityInstruction}\n\n${ACTION_PROTOCOL_INSTRUCTIONS}`,
  };

  const fullMessages: ChatMessage[] = [systemMessage, ...(messages as ChatMessage[])];

  // AI_MODEL_ROUTES[task].model already includes the provider prefix
  // (e.g. "google/gemini-2.5-flash"); OpenRouter turns on its web-search
  // plugin for any model when ":online" is appended to it — no separate
  // tool-calling loop needed for this MVP.
  const route = AI_MODEL_ROUTES[template.taskType];
  const modelOverride = useWebSearch ? `${route.model}:online` : undefined;

  try {
    const streamResponse = await createChatStream({
      task: template.taskType,
      messages: fullMessages,
      temperature: responseMode === "short" ? 0.4 : 0.7,
      stream: true,
      modelOverride,
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
