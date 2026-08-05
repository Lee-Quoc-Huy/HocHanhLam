import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFromPrompt } from "@/lib/ai/google-ai-client";

export const maxDuration = 60;

const requestSchema = z.object({
  gameType: z.enum(["listening", "quiz", "spelling", "reflex", "blank"]),
  language: z.enum(["en", "ko", "zh"]).default("en"),
  topic: z.string().optional(),
  level: z.string().optional(),
  words: z.array(z.object({ word: z.string(), meaning: z.string() })).optional(),
  grammar: z.array(z.object({ title: z.string(), meaning: z.string() })).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { gameType, language, topic, level, words, grammar } = parsed.data;

    const langLabel =
      language === "en" ? "tiếng Anh" : language === "ko" ? "tiếng Hàn" : "tiếng Trung";

    const prompt = `Bạn là chuyên gia giáo dục ngôn ngữ AI (${langLabel}).
Nhiệm vụ: Tạo một bộ câu hỏi/bài tập cho trò chơi "${gameType}" trình độ ${level || "Trung cấp"}, chủ đề: "${topic || "Giao tiếp tổng hợp"}".

${
  words && words.length > 0
    ? `Dưới đây là một số từ vựng từ hệ thống web của người dùng để kết hợp:
${words.slice(0, 15).map((w) => `- ${w.word}: ${w.meaning}`).join("\n")}`
    : ""
}

${
  grammar && grammar.length > 0
    ? `Dưới đây là môt số ngữ pháp từ web của người dùng để kết hợp:
${grammar.slice(0, 10).map((g) => `- ${g.title}: ${g.meaning}`).join("\n")}`
    : ""
}

Yêu cầu cụ thể cho trò chơi "${gameType}":
${
  gameType === "listening"
    ? `1. Tạo 6-10 CÂU HOÀN CHỈNH chuẩn ngữ pháp (${langLabel}).
2. Mỗi câu phải chứa 1 từ vựng/ngữ pháp quan trọng làm từ khuyết (missingWord).
3. Đặt dấu khuyết [ ___ ] đúng vị trí của missingWord trong câu fullSentence.
4. Trả về fullSentence (câu đầy đủ âm thanh), sentenceWithBlank (câu có khuyết [ ___ ]), missingWord (từ cần điền), vietnameseTranslation (dịch câu), và 4 lựa chọn (options).`
    : `1. Tạo 6-10 câu hỏi trò chơi ${gameType} chất lượng cao.
2. Với mỗi item, trả về frontText (từ/câu hỏi), backText (nghĩa/đáp án), hint (gợi ý), options (4 đáp án nếu trắc nghiệm).`
}

CHỈ TRẢ VỀ JSON DUY NHẤT theo cấu trúc:
{
  "gameTitle": "Tên trò chơi AI vừa tạo",
  "language": "${language}",
  "items": [
    {
      "id": "1",
      "frontText": "...",
      "backText": "...",
      "fullSentence": "Câu hoàn chỉnh tiếng ${langLabel} để đọc TTS",
      "sentenceWithBlank": "Câu có chỗ trống [ ___ ]",
      "missingWord": "Từ hoặc cụm từ bị thiếu",
      "vietnameseTranslation": "Nghĩa tiếng Việt",
      "hint": "Gợi ý",
      "options": ["A", "B", "C", "D"]
    }
  ]
}`;

    const rawResponse = await generateFromPrompt({
      prompt,
      systemInstruction: "Bạn là giáo viên ngoại ngữ AI cao cấp. Chỉ trả về JSON duy nhất, không markdown code block.",
      temperature: 0.4,
    });

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI không trả về JSON hợp lệ" }, { status: 502 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Generate game API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Không thể tạo trò chơi AI" },
      { status: 500 }
    );
  }
}
