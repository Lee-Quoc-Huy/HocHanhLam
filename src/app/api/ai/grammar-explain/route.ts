import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai/openrouter-client";

export async function POST(req: Request) {
  try {
    const { title, language, meaning, explanation, examples } = await req.json();

    if (!title || !language) {
      return NextResponse.json(
        { error: "Title and language are required" },
        { status: 400 }
      );
    }

    const langName =
      language === "en" ? "English" : language === "ko" ? "Korean" : "Chinese";

    const prompt = `You are an expert master linguist and native language teacher specializing in ${langName}.
Analyze the following grammar structure in depth for a Vietnamese language learner:

**Grammar Structure**: "${title}" (${langName})
**Vietnamese Meaning**: "${meaning || "N/A"}"
**Explanation**: "${explanation || "N/A"}"
**Sample Examples**: ${JSON.stringify(examples || [])}

Please generate a comprehensive, highly structured, and engaging Markdown breakdown containing:
1. 💡 **Core Essence & Nuances** (Bản chất & Sắc thái sử dụng sâu sắc)
2. 🎯 **Formula & Pattern Rules** (Công thức chi tiết, quy tắc biến đổi từ/chia động từ)
3. ⚠️ **Critical Distinctions & Memory Tricks** (Điểm dễ nhầm lẫn & Mẹo ghi nhớ độc đáo)
4. 💬 **Real-World Conversational Dialogues** (Ví dụ hội thoại thực tế ngắn có kèm dịch nghĩa tiếng Việt)
5. 🎓 **Exam & Practice Tips** (Mẹo làm bài thi IELTS/TOPIK/HSK nếu có)

Keep the explanation clear, professional, formatted cleanly with GitHub Markdown, and explained in Vietnamese for maximum clarity.`;

    const result = await createChatCompletion({
      task: "reasoning",
      messages: [
        {
          role: "system",
          content:
            "You are LinguaVerse AI, an expert language learning assistant specializing in English, Korean, and Chinese grammar analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ explanation: result.content });
  } catch (error) {
    console.error("AI Grammar Explain API Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate AI explanation. Please verify your OpenRouter API key or try again later.",
      },
      { status: 500 }
    );
  }
}
