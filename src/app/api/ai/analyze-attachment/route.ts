import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFromImage, parseImageDataUrl } from "@/lib/ai/google-ai-client";

export const maxDuration = 60;

// ── Vision models via OpenRouter (Engine 2 Fallback) ──────────────────────────
const VISION_MODELS = [
  "google/gemma-4-31b-it:free",                        // Gemma 4 31B Vision
  "nvidia/nemotron-nano-12b-v2-vl:free",               // NVIDIA Vision-Language model
  "google/gemma-4-26b-a4b-it:free",                    // Gemma 4 26B Vision
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", // NVIDIA Omni reasoning
  "openrouter/free",                                   // OpenRouter auto-router
] as const;

const requestSchema = z.object({
  imageDataUrl: z.string().optional(),
  text: z.string().optional(),
  targetLanguage: z.enum(["en", "ko", "zh"]).default("en"),
  focus: z.enum(["vocabulary", "grammar"]).default("vocabulary"),
}).refine((v) => v.imageDataUrl || v.text, {
  message: "Cần có imageDataUrl hoặc text.",
});

// ── Vocabulary-focused prompt ─────────────────────────────────────────────────
const VOCABULARY_SYSTEM_PROMPT = (langLabel: string) =>
  `Bạn là một trợ lý AI thông minh chuyên trích xuất TỪ VỰNG từ ảnh chụp tài liệu học ngoại ngữ (${langLabel}).

Nhiệm vụ của bạn:
1. Đọc và TỰ ĐỘNG SỬA LỖI CHÍNH TẢ / LỖI OCR (nếu chữ trong ảnh bị nhòe, sai nét hay lỗi đọc ký tự), chuyển về từ gốc đúng chuẩn từ điển.
2. TỰ ĐỘNG PHÂN LOẠI CHỦ ĐỀ (collection) chính xác cho từng từ vựng (ví dụ: "Du lịch & Sân bay", "Giao tiếp công sở", "Ẩm thực & Gọi món", "TOPIK II", "HSK 4", "IELTS Academic"...).
3. Chỉ trích xuất TỪ VỰNG. Không trích xuất ngữ pháp.

Trả về 1 khối JSON DUY NHẤT (không thêm markdown code block, không thêm text ngoài JSON):
{
  "summary": "Tóm tắt ngắn gọn (1-2 câu tiếng Việt) về danh sách từ vựng trong ảnh",
  "vocabulary": [
    {
      "language": "en",
      "word": "Từ vựng (đã sửa chuẩn chính tả)",
      "ipa": "Phiên âm IPA hoặc Pinyin chuẩn",
      "vietnamese": "Nghĩa tiếng Việt chuẩn xác",
      "english_meaning": "Giải nghĩa tiếng Anh ngắn",
      "part_of_speech": "noun|verb|adjective|adverb|phrase|idiom",
      "example": "Câu ví dụ minh họa",
      "example_translation": "Dịch nghĩa câu ví dụ",
      "difficulty": "beginner|intermediate|advanced|master",
      "collection": "Tên chủ đề phân loại tự động"
    }
  ],
  "grammar": []
}

language phải là "en", "ko", hoặc "zh".
difficulty phải là "beginner", "intermediate", "advanced", hoặc "master".
QUAN TRỌNG: "grammar" luôn là mảng rỗng [] vì bạn chỉ trích xuất từ vựng.`;

// ── Grammar-focused prompt ────────────────────────────────────────────────────
const GRAMMAR_SYSTEM_PROMPT = (langLabel: string) =>
  `Bạn là một trợ lý AI thông minh chuyên phân tích NGỮ PHÁP từ ảnh chụp tài liệu học ngoại ngữ (${langLabel}).

Nhiệm vụ của bạn:
1. Đọc và TỰ ĐỘNG SỬA LỖI CHÍNH TẢ / LỖI OCR nếu chữ trong ảnh bị nhòe hoặc sai.
2. Xác định các CẤU TRÚC NGỮ PHÁP, mẫu câu, công thức có trong ảnh.
3. Chỉ trích xuất NGỮ PHÁP. Không trích xuất từ vựng đơn lẻ.

Trả về 1 khối JSON DUY NHẤT (không thêm markdown code block, không thêm text ngoài JSON):
{
  "summary": "Tóm tắt ngắn gọn (1-2 câu tiếng Việt) về các cấu trúc ngữ pháp trong ảnh",
  "vocabulary": [],
  "grammar": [
    {
      "language": "en",
      "title": "Tên cấu trúc ngữ pháp (ví dụ: Present Perfect Tense)",
      "meaning": "Tóm tắt ý nghĩa/công dụng bằng tiếng Việt",
      "explanation": "Công thức & cách dùng chi tiết (tiếng Việt)",
      "examples": [{ "example": "Câu ví dụ", "translation": "Dịch nghĩa" }],
      "category": "Danh mục ngữ pháp (Tenses / Conditionals / Modals / ...)",
      "difficulty": "beginner|intermediate|advanced|master"
    }
  ]
}

language phải là "en", "ko", hoặc "zh".
difficulty phải là "beginner", "intermediate", "advanced", hoặc "master".
QUAN TRỌNG: "vocabulary" luôn là mảng rỗng [] vì bạn chỉ trích xuất ngữ pháp.`;

/**
 * Call OpenRouter with vision-capable free models (Engine 2).
 */
async function analyzeWithOpenRouter(params: {
  systemPrompt: string;
  userText: string;
  imageDataUrl?: string;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Thiếu OPENROUTER_API_KEY. Vui lòng thêm vào biến môi trường Vercel."
    );
  }

  const baseUrl =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  const userContent: Record<string, unknown>[] = [
    { type: "text", text: params.userText },
  ];

  if (params.imageDataUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: params.imageDataUrl },
    });
  }

  const requestBody = {
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 4096,
    temperature: 0.3,
  };

  const errors: string[] = [];

  for (const model of VISION_MODELS) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL ?? "https://linguaverse.ai",
          "X-Title": "LinguaVerse AI",
        },
        body: JSON.stringify({ ...requestBody, model }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        const reason = `HTTP ${response.status}${errBody ? `: ${errBody.slice(0, 200)}` : ""}`;
        console.warn(`[analyze-attachment] ${model} → ${reason}`);
        errors.push(`${model}: ${reason}`);
        continue;
      }

      const data = await response.json();

      if (data?.error) {
        const errMsg = data.error.message || JSON.stringify(data.error);
        console.warn(`[analyze-attachment] ${model} → OpenRouter error payload: ${errMsg}`);
        errors.push(`${model}: ${errMsg}`);
        continue;
      }

      const text: string = data?.choices?.[0]?.message?.content ?? "";

      const isOverloadedOrError =
        !text.trim() ||
        text.toLowerCase().includes("overloaded") ||
        text.toLowerCase().includes("rate limit") ||
        text.toLowerCase().includes("try again later") ||
        text.toLowerCase().includes("capacity");

      if (isOverloadedOrError) {
        const reason = text ? text.slice(0, 150) : "empty response";
        console.warn(`[analyze-attachment] ${model} → response invalid/overloaded: ${reason}`);
        errors.push(`${model}: ${reason}`);
        continue;
      }

      if (model !== VISION_MODELS[0]) {
        console.info(`[analyze-attachment] Used fallback vision model: ${model}`);
      }
      return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[analyze-attachment] ${model} → error:`, msg);
      errors.push(`${model}: ${msg}`);
    }
  }

  throw new Error(
    `Hệ thống AI đọc ảnh hiện tại đang bận hoặc quá tải (OpenRouter Free Rate-Limit).\n` +
      `Chi tiết:\n${errors.map((e, i) => `  ${i + 1}. ${e}`).join("\n")}\n` +
      `Vui lòng thử lại sau vài giây.`
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { imageDataUrl, text, targetLanguage, focus } = parsed.data;
  const langLabel =
    targetLanguage === "en"
      ? "tiếng Anh"
      : targetLanguage === "ko"
        ? "tiếng Hàn"
        : "tiếng Trung";

  // Use focused system prompt based on what the caller needs
  const systemPrompt = focus === "grammar"
    ? GRAMMAR_SYSTEM_PROMPT(langLabel)
    : VOCABULARY_SYSTEM_PROMPT(langLabel);

  const userText = text?.trim()
    ? text
    : focus === "grammar"
      ? "Hãy phân tích ảnh này và trích xuất tất cả cấu trúc ngữ pháp có trong đó."
      : "Hãy phân tích ảnh này và trích xuất tất cả từ vựng có trong đó.";

  let responseText = "";

  // Engine 1: Try Google AI Direct (Gemini 3.5 Flash / 2.5 Flash) first for maximum speed
  if (process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY) {
    try {
      responseText = await generateFromImage({
        systemInstruction: systemPrompt,
        userText: userText,
        image: imageDataUrl ? parseImageDataUrl(imageDataUrl) : undefined,
        temperature: 0.3,
      });
    } catch (err) {
      console.warn("[analyze-attachment] Engine 1 (Google Direct) failed, falling back to Engine 2 (OpenRouter):", err);
    }
  }

  // Engine 2: Fallback to OpenRouter Vision Chain if Engine 1 produced no result
  if (!responseText) {
    try {
      responseText = await analyzeWithOpenRouter({
        systemPrompt,
        userText,
        imageDataUrl,
      });
    } catch (err) {
      console.error("Analyze attachment error (Engine 2):", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Không thể phân tích tệp đính kèm.",
        },
        { status: 502 }
      );
    }
  }

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI không trả về dữ liệu đúng định dạng JSON. Vui lòng thử lại." },
        { status: 502 }
      );
    }

    const extracted = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      summary: extracted.summary ?? "",
      vocabulary: Array.isArray(extracted.vocabulary) ? extracted.vocabulary : [],
      grammar: Array.isArray(extracted.grammar) ? extracted.grammar : [],
      flashcards: [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Không thể đọc dữ liệu từ phản hồi của AI. Thử lại sau." },
      { status: 500 }
    );
  }
}
