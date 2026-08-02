import { NextResponse } from "next/server";
import { z } from "zod";
import { createChatCompletion, type ChatMessage } from "@/lib/ai/openrouter-client";

/**
 * Reads an image (photo of a vocabulary list, a grammar chart, a textbook
 * page, etc.) or a plain-text document the person attaches in the AI chat,
 * and asks a vision-capable model (Gemini 2.5 Pro via the `vision_ocr`
 * route) to propose vocabulary words, grammar structures, and flashcards
 * found in it.
 *
 * This never writes to Supabase directly — it only returns candidates. The
 * person reviews and picks what to keep in the chat UI
 * (`ExtractionConfirmCard`), which then calls the normal
 * vocabulary/grammar/flashcard services to actually save anything.
 */

const requestSchema = z.object({
  imageDataUrl: z.string().optional(),
  text: z.string().optional(),
  targetLanguage: z.enum(["en", "ko", "zh"]).default("en"),
}).refine((v) => v.imageDataUrl || v.text, {
  message: "Cần có imageDataUrl hoặc text.",
});

const EXTRACTION_SYSTEM_PROMPT = (langLabel: string) => `Bạn là trợ lý học ngoại ngữ đang phân tích một ảnh chụp hoặc tài liệu (ví dụ: trang sách giáo khoa, ảnh chụp bảng từ vựng, ảnh chụp cấu trúc ngữ pháp, ghi chú tay...) liên quan đến ${langLabel}.

Nhiệm vụ của bạn:
1. Đọc kỹ toàn bộ nội dung nhìn thấy được.
2. Xác định TẤT CẢ từ vựng đáng học có trong đó (nếu có).
3. Xác định TẤT CẢ cấu trúc ngữ pháp đáng học có trong đó (nếu có).
4. Với mỗi từ vựng/ngữ pháp tìm được, đề xuất luôn một flashcard tương ứng.

CHỈ trả lời bằng một khối JSON DUY NHẤT, không thêm giải thích, không thêm markdown code fence, đúng theo cấu trúc sau (bỏ trống mảng nếu không có gì phù hợp):

{
  "summary": "Mô tả ngắn gọn (1-2 câu tiếng Việt) về nội dung ảnh/tài liệu này",
  "vocabulary": [
    {
      "language": "en",
      "word": "...",
      "ipa": "...",
      "vietnamese": "...",
      "english_meaning": "...",
      "part_of_speech": "noun",
      "example": "...",
      "example_translation": "...",
      "difficulty": "intermediate"
    }
  ],
  "grammar": [
    {
      "language": "en",
      "title": "...",
      "meaning": "Tóm tắt ý nghĩa bằng tiếng Việt",
      "explanation": "Giải thích chi tiết công thức & cách dùng",
      "examples": [{ "example": "...", "translation": "..." }],
      "category": "General",
      "difficulty": "intermediate"
    }
  ],
  "flashcards": [
    {
      "front_text": "...",
      "front_subtext": "...",
      "back_text": "...",
      "back_explanation": "...",
      "tags": ["Ảnh Đính Kèm"]
    }
  ]
}

language phải là một trong: "en", "ko", "zh" (tuỳ theo ngôn ngữ thực tế nhìn thấy trong ảnh — có thể khác ${langLabel} nếu ảnh chứa ngôn ngữ khác).
difficulty phải là một trong: "beginner", "intermediate", "advanced", "master".
Nếu ảnh không chứa nội dung học ngoại ngữ nào rõ ràng, trả về summary mô tả điều đó và để 3 mảng đều rỗng.`;

export async function POST(request: Request) {
  // Personal single-user app — no login wall on any feature.
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { imageDataUrl, text, targetLanguage } = parsed.data;
  const langLabel =
    targetLanguage === "en" ? "tiếng Anh" : targetLanguage === "ko" ? "tiếng Hàn" : "tiếng Trung";

  const userContent: ChatMessage["content"] = imageDataUrl
    ? [
        { type: "text", text: text?.trim() ? text : "Hãy phân tích ảnh này." },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ]
    : (text as string);

  const messages: ChatMessage[] = [
    { role: "system", content: EXTRACTION_SYSTEM_PROMPT(langLabel) },
    { role: "user", content: userContent },
  ];

  try {
    const res = await createChatCompletion({ task: "vision_ocr", messages, temperature: 0.3 });
    const jsonMatch = res.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI không trả về dữ liệu đúng định dạng. Vui lòng thử lại." },
        { status: 502 }
      );
    }

    const extracted = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      summary: extracted.summary ?? "",
      vocabulary: Array.isArray(extracted.vocabulary) ? extracted.vocabulary : [],
      grammar: Array.isArray(extracted.grammar) ? extracted.grammar : [],
      flashcards: Array.isArray(extracted.flashcards) ? extracted.flashcards : [],
    });
  } catch (err) {
    console.error("Analyze attachment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Không thể phân tích tệp đính kèm." },
      { status: 502 }
    );
  }
}
