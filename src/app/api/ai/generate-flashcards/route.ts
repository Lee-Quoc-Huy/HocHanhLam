import { NextResponse } from "next/server";
import { z } from "zod";
import { createChatCompletion } from "@/lib/ai/openrouter-client";

export const maxDuration = 60;

const requestSchema = z.object({
  topic: z.string().min(1),
  language: z.enum(["en", "ko", "zh"]).default("en"),
  level: z.enum(["beginner", "intermediate", "advanced", "master"]).default("intermediate"),
  count: z.number().min(3).max(30).default(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { topic, language, level, count } = parsed.data;

    const langName = language === "en" ? "Tiếng Anh" : language === "ko" ? "Tiếng Hàn" : "Tiếng Trung";
    const levelName =
      level === "beginner"
        ? "Sơ cấp"
        : level === "intermediate"
        ? "Trung cấp"
        : level === "advanced"
        ? "Cao cấp"
        : "Thành thạo";

    const prompt = `Bạn là một chuyên gia soạn thảo Flashcard và Quiz học ngôn ngữ ${langName}.
Hãy soạn đúng ${count} thẻ ghi nhớ / câu hỏi quiz thuộc chủ đề "${topic}", trình độ "${levelName}".

YÊU CẦU ĐỊNH DẠNG JSON DUY NHẤT:
Trả về 1 mảng JSON thuần túy gồm ${count} phần tử. Mỗi phần tử có cấu trúc:
{
  "front_text": "Từ hoặc cụm từ bằng ${langName}",
  "front_subtext": "${language === "ko" ? "Phiên âm Hangul/IPA" : language === "zh" ? "Pinyin kèm dấu thanh" : "Phiên âm IPA"}",
  "back_text": "Nghĩa tiếng Việt ngắn gọn, chuẩn xác",
  "back_explanation": "Ví dụ thực tế bằng ${langName} kèm dịch nghĩa tiếng Việt",
  "english_hint": "Gợi ý nghĩa tiếng Anh ngắn gọn (Ví dụ: Airport, School, Decision...)",
  "tags": ["${topic}", "${levelName}"]
}

TUYỆT ĐỐI CHỈ TRẢ VỀ JSON ARRAY THUẦN TÚY, KHÔNG CÓ MARKDOWN HOẶC VĂN BẢN KHÁC.`;

    const rawResponse = await createChatCompletion({
      task: "fast_completion",
      messages: [
        { role: "system", content: "Chuyên gia tạo Flashcard & Quiz học ngoại ngữ. Chỉ trả về JSON array." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    // Parse JSON array from raw response
    const jsonMatch = rawResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse.trim();
    const items = JSON.parse(jsonStr);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("AI Generate Flashcards Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể tạo flashcard bằng AI." },
      { status: 500 }
    );
  }
}
