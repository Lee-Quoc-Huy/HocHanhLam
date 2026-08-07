import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFromImage, parseImageDataUrl } from "@/lib/ai/google-ai-client";

export const maxDuration = 60;

// ── Vision models via OpenRouter (Engine 2 Fallback) ──────────────────────────
const VISION_MODELS = [
  "google/gemini-2.5-flash:free",                        // Fast Gemini 2.5 Flash Vision
  "google/gemini-2.0-flash-exp:free",                    // Gemini 2.0 Flash Vision
  "google/gemma-4-31b-it:free",                        // Gemma 4 31B Vision
  "nvidia/nemotron-nano-12b-v2-vl:free",               // NVIDIA Vision-Language
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
const VOCABULARY_SYSTEM_PROMPT = (langCode: "en" | "ko" | "zh", langLabel: string) =>
  `Bạn là một chuyên gia OCR AI đỉnh cao chuyên trích xuất TỪ VỰNG từ ảnh chụp tài liệu học ${langLabel}.

YÊU CẦU QUAN TRỌNG:
1. Đọc chính xác 100% các từ vựng xuất hiện trong ảnh. Tự động sửa lỗi nhòe nét/lỗi OCR để đưa về dạng từ chuẩn từ điển.
2. Ngôn ngữ của các từ vựng được trích xuất là ${langLabel}. Tất cả các mục trong mảng vocabulary PHẢI có thuộc tính "language": "${langCode}".
   - Với Tiếng Hàn (ko): "word" phải là chữ Hán-Hàn (Hangul), "ipa" là phiên âm/cách đọc, "vietnamese" là nghĩa tiếng Việt chuẩn.
   - Với Tiếng Trung (zh): "word" phải là Chữ Hán (Hanzi), "ipa" là Pinyin kèm dấu thanh điệu, "vietnamese" là nghĩa tiếng Việt chuẩn.
   - Với Tiếng Anh (en): "word" là từ tiếng Anh, "ipa" là phiên âm IPA chuẩn, "vietnamese" là nghĩa tiếng Việt chuẩn.
3. TỰ ĐỘNG PHÂN LOẠI CHỦ ĐỀ (collection) thích hợp (ví dụ: "Giao tiếp cơ bản", "Du lịch & Ẩm thực", "Công sở & Kinh tế", "TOPIK I/II", "HSK 1-6", "IELTS/TOEIC"...).
4. CHỈ TRÍCH XUẤT TỪ VỰNG. Không trích xuất cấu trúc ngữ pháp.

Trả về 1 khối JSON DUY NHẤT (không thêm markdown code block, không thêm text ngoài JSON):
{
  "summary": "Tóm tắt ngắn gọn 1 câu bằng tiếng Việt về danh sách từ vựng đọc được",
  "vocabulary": [
    {
      "language": "${langCode}",
      "word": "Từ gốc chuẩn",
      "ipa": "Phiên âm IPA / Pinyin / Pronunciation",
      "vietnamese": "Nghĩa tiếng Việt chuẩn xác",
      "english_meaning": "Giải nghĩa ngắn bằng tiếng Anh (nếu có)",
      "part_of_speech": "noun|verb|adjective|adverb|phrase|idiom",
      "example": "Câu ví dụ minh họa bằng ${langLabel}",
      "example_translation": "Dịch nghĩa câu ví dụ sang tiếng Việt",
      "difficulty": "beginner|intermediate|advanced|master",
      "collection": "Tên chủ đề phân loại tự động"
    }
  ],
  "grammar": []
}`;

// ── Grammar-focused prompt ────────────────────────────────────────────────────
const GRAMMAR_SYSTEM_PROMPT = (langCode: "en" | "ko" | "zh", langLabel: string) =>
  `Bạn là một chuyên gia AI đỉnh cao chuyên phân tích NGỮ PHÁP từ ảnh chụp tài liệu học ${langLabel}.

YÊU CẦU QUAN TRỌNG:
1. Nhận diện chính xác 100% các CẤU TRÚC NGỮ PHÁP, công thức, mẫu câu có trong ảnh. Tự động sửa lỗi OCR nếu chữ bị mờ.
2. Ngôn ngữ của cấu trúc là ${langLabel}. Tất cả các mục trong mảng grammar PHẢI có thuộc tính "language": "${langCode}".
   - Với Tiếng Hàn (ko): "title" là mẫu ngữ pháp Hán-Hàn (ví dụ: "V + -아/어/여야 하다", "-기 때문에"), "explanation" giải thích công thức & cách dùng bằng tiếng Việt.
   - Với Tiếng Trung (zh): "title" là cấu trúc tiếng Trung (ví dụ: "除了……以外", "越……越……"), "explanation" giải thích bằng tiếng Việt.
   - Với Tiếng Anh (en): "title" là tên cấu trúc (ví dụ: "Present Perfect Tense", "Prefer A to B"), "explanation" giải thích bằng tiếng Việt.
3. CHỈ TRÍCH XUẤT NGỮ PHÁP. Không trích xuất từ vựng đơn lẻ.

Trả về 1 khối JSON DUY NHẤT (không thêm markdown code block, không thêm text ngoài JSON):
{
  "summary": "Tóm tắt ngắn gọn 1 câu bằng tiếng Việt về các cấu trúc ngữ pháp đọc được",
  "vocabulary": [],
  "grammar": [
    {
      "language": "${langCode}",
      "title": "Tên/Công thức cấu trúc ngữ pháp",
      "meaning": "Tóm tắt ý nghĩa bằng tiếng Việt",
      "explanation": "Công thức & cách dùng chi tiết bằng tiếng Việt",
      "examples": [{ "example": "Câu ví dụ bằng ${langLabel}", "translation": "Dịch nghĩa tiếng Việt" }],
      "category": "Danh mục ngữ pháp (Thì / Câu điều kiện / Mẫu câu / ...)",
      "difficulty": "beginner|intermediate|advanced|master"
    }
  ]
}`;

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
    ? GRAMMAR_SYSTEM_PROMPT(targetLanguage, langLabel)
    : VOCABULARY_SYSTEM_PROMPT(targetLanguage, langLabel);

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
