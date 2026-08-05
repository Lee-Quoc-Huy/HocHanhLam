import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFromImage, parseImageDataUrl } from "@/lib/ai/google-ai-client";

export const maxDuration = 60;

const requestSchema = z.object({
  imageDataUrl: z.string().optional(),
  text: z.string().optional(),
  targetLanguage: z.enum(["en", "ko", "zh"]).default("en"),
}).refine((v) => v.imageDataUrl || v.text, {
  message: "Cần có imageDataUrl hoặc text.",
});

const EXTRACTION_SYSTEM_PROMPT = (langLabel: string) => `Bạn là một trợ lý AI thông minh chuyên phân tích ảnh chụp/tài liệu học ngoại ngữ (${langLabel}).

Nhiệm vụ của bạn:
1. Đọc và TỰ ĐỘNG SỬA LỖI CHÍNH TẢ / LỖI OCR (nếu chữ trong ảnh bị nhòe, sai nét hay lỗi đọc ký tự), chuyển về từ gốc đúng chuẩn từ điển.
2. TỰ ĐỘNG PHÂN LOẠI CHỦ ĐỀ (collection) chính xác cho từng từ vựng (ví dụ: "Du lịch & Sân bay", "Giao tiếp công sở", "Ẩm thực & Gọi món", "TOPIK II", "HSK 4", "IELTS Academic"...).
3. Đề xuất danh sách từ vựng và cấu trúc ngữ pháp có trong ảnh.

Trả về 1 khối JSON DUY NHẤT đúng cấu trúc (không thêm markdown code block):
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

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { imageDataUrl, text, targetLanguage } = parsed.data;
  const langLabel =
    targetLanguage === "en" ? "tiếng Anh" : targetLanguage === "ko" ? "tiếng Hàn" : "tiếng Trung";

  try {
    const responseText = await generateFromImage({
      systemInstruction: EXTRACTION_SYSTEM_PROMPT(langLabel),
      userText: text?.trim() ? text : "Hãy phân tích ảnh này, sửa lỗi chính tả nếu có và tự lọc chủ đề.",
      image: imageDataUrl ? parseImageDataUrl(imageDataUrl) : undefined,
      temperature: 0.3,
    });

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
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
      flashcards: [],
    });
  } catch (err) {
    console.error("Analyze attachment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Không thể phân tích tệp đính kèm." },
      { status: 502 }
    );
  }
}
