import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

// ── Vision models via OpenRouter (free, separate from Google AI Studio) ───────
// Uses OpenRouter free router and specific free vision models with automatic fallback.
const VISION_MODELS = [
  "openrouter/free",                                   // OpenRouter auto-router (free)
  "nvidia/nemotron-nano-12b-v2-vl:free",               // NVIDIA Vision-Language model
  "google/gemma-4-31b-it:free",                        // Gemma 4 31B Vision
  "google/gemma-4-26b-a4b-it:free",                    // Gemma 4 26B Vision
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", // NVIDIA Omni reasoning
] as const;

const requestSchema = z.object({
  imageDataUrl: z.string().optional(),
  text: z.string().optional(),
  targetLanguage: z.enum(["en", "ko", "zh"]).default("en"),
}).refine((v) => v.imageDataUrl || v.text, {
  message: "Cần có imageDataUrl hoặc text.",
});

const EXTRACTION_SYSTEM_PROMPT = (langLabel: string) =>
  `Bạn là một trợ lý AI thông minh chuyên phân tích ảnh chụp/tài liệu học ngoại ngữ (${langLabel}).

Nhiệm vụ của bạn:
1. Đọc và TỰ ĐỘNG SỬA LỖI CHÍNH TẢ / LỖI OCR (nếu chữ trong ảnh bị nhòe, sai nét hay lỗi đọc ký tự), chuyển về từ gốc đúng chuẩn từ điển.
2. TỰ ĐỘNG PHÂN LOẠI CHỦ ĐỀ (collection) chính xác cho từng từ vựng (ví dụ: "Du lịch & Sân bay", "Giao tiếp công sở", "Ẩm thực & Gọi món", "TOPIK II", "HSK 4", "IELTS Academic"...).
3. Đề xuất danh sách từ vựng và cấu trúc ngữ pháp có trong ảnh.

Trả về 1 khối JSON DUY NHẤT đúng cấu trúc (không thêm markdown code block, không thêm text ngoài JSON):
{
  "summary": "Tóm tắt ngắn gọn (1-2 câu tiếng Việt) về nội dung tài liệu này",
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
  "grammar": [
    {
      "language": "en",
      "title": "Cấu trúc ngữ pháp",
      "meaning": "Tóm tắt ý nghĩa bằng tiếng Việt",
      "explanation": "Công thức & cách dùng chi tiết",
      "examples": [{ "example": "...", "translation": "..." }],
      "category": "Danh mục ngữ pháp tự động",
      "difficulty": "intermediate"
    }
  ]
}

language phải là "en", "ko", hoặc "zh".
difficulty phải là "beginner", "intermediate", "advanced", hoặc "master".`;

/**
 * Call OpenRouter with vision-capable free models.
 * Tries each model in order until one succeeds and returns a valid response.
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

  // Build the user message content
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

      // Check if OpenRouter returned an error payload inside 200 OK
      if (data?.error) {
        const errMsg = data.error.message || JSON.stringify(data.error);
        console.warn(`[analyze-attachment] ${model} → OpenRouter error payload: ${errMsg}`);
        errors.push(`${model}: ${errMsg}`);
        continue;
      }

      const text: string = data?.choices?.[0]?.message?.content ?? "";

      // Check if the response contains model overload / rate limit notice text
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
        console.info(`[analyze-attachment] Used fallback model: ${model}`);
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

  const { imageDataUrl, text, targetLanguage } = parsed.data;
  const langLabel =
    targetLanguage === "en"
      ? "tiếng Anh"
      : targetLanguage === "ko"
        ? "tiếng Hàn"
        : "tiếng Trung";

  try {
    const responseText = await analyzeWithOpenRouter({
      systemPrompt: EXTRACTION_SYSTEM_PROMPT(langLabel),
      userText: text?.trim()
        ? text
        : "Hãy phân tích ảnh này, sửa lỗi chính tả nếu có và tự lọc chủ đề.",
      imageDataUrl,
    });

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
    console.error("Analyze attachment error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Không thể phân tích tệp đính kèm.",
      },
      { status: 502 }
    );
  }
}
