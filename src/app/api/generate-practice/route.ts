import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callGoogleAIDirect } from "@/config/ai-models";
import { createChatCompletion } from "@/lib/ai/openrouter-client";

export const maxDuration = 60;

interface Question {
  id: string;
  type: "multiple-choice" | "reading-comprehension" | "fill-blank" | "sentence-order" | "speaking-prompt" | "listening";
  prompt: string;
  passage?: string;
  audioUrl?: string;
  choices?: { id: string; text: string }[];
  answer: string;
  explanation: string;
}

// ─── Dynamic Topic Bank for Unlimited Diversity ────────────────────────────────
const TOPIC_BANK = [
  "Công nghệ AI, Robot & Đời sống số tương lai",
  "Văn hóa truyền thống, Di sản & Lễ hội dân gian",
  "Giao tiếp công sở, Đàm phán kinh doanh & Xin việc",
  "Du lịch sinh thái, Khám phá thiên nhiên & Địa lý",
  "Ẩm thực đường phố, Dinh dưỡng & Phong cách sống",
  "Y học hiện đại, Sức khỏe tâm thần & Chăm sóc bản thân",
  "Bảo vệ môi trường, Năng lượng xanh & Biến đổi khí hậu",
  "Điện ảnh, Văn học, Âm nhạc & Nghệ thuật biểu diễn",
  "Kinh tế gia đình, Đầu tư & Quản lý tài chính cá nhân",
  "Tâm lý xã hội, Mối quan hệ gia đình & Bạn bè",
  "Thể thao đỉnh cao, Rèn luyện thể lực & Xu hướng Fitness",
  "Giáo dục đại học, Học bổng du học & Nghiên cứu khoa học",
  "Giao thông đô thị, Đô thị thông minh & Xe điện",
  "Mua sắm trực tuyến, E-commerce & Hành vi tiêu dùng",
  "Khoa học vũ trụ, Thiên văn & Khám phá hành tinh",
  "Triết lý sống, Quản lý thời gian & Thói quen thành công",
  "Truyền thông xã hội, Mạng xã hội & Xu hướng giới trẻ",
];

function getRandomTopics(): string {
  const shuffled = [...TOPIC_BANK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4).join(" • ");
}

// ─── Build prompt for AI ──────────────────────────────────────────────────────
function buildPrompt(
  exam: string,
  level: string,
  format: string,
  mode: "practice" | "real_exam",
  count: number,
  source: "ai" | "library",
  fileUrls: string[],
  libraryContext?: string
): string {
  const lang = exam === "TOPIK" ? "Tiếng Hàn" : exam === "HSK" ? "Tiếng Trung" : "Tiếng Anh";
  const seed = Math.floor(Math.random() * 1000000);
  const selectedTopics = getRandomTopics();

  let sourceGuidance = "";
  if (source === "library") {
    sourceGuidance = libraryContext && libraryContext.trim().length > 0
      ? `TRÍCH LỌC & TÁI TẠO ĐỀ THỨ VIỆN THÔNG MINH BẬC CAO (Seed: ${seed}):
Dưới đây là các tài liệu & đề thi từ Thư viện của người dùng:
--- NỘI DUNG THƯ VIỆN ---
${libraryContext}
-------------------------
YÊU CẦU TRÍCH LỌC VÀ SÁNG TẠO ĐỀ THI MỚI:
1. Đọc và phân tích các cấu trúc từ vựng, ngữ pháp chìa khóa, ý tưởng bài đọc trong các tài liệu Thư viện trên.
2. TÁI CẤU TRÚC HOÀN TOÀN THÀNH BỘ ĐỀ THI MỚI THÔNG MINH (Không copy nguyên văn): Đổi mới bối cảnh tình huống, tạo các đoạn văn đọc hiểu tương đương, đảo đáp án nhiễu thông minh, biến đổi dạng bài để kiểm tra khả năng tư duy & phản xạ sâu của người học.
3. Đảm bảo mọi câu hỏi đều xoay quanh kiến thức từ Thư viện nhưng mang diện mạo mới lạ 100%.`
      : `BỘ ĐỀ TRỘN THƯ VIỆN CHUẨN KỲ THI (Seed: ${seed}): Trích lọc kiến thức trọng tâm từ Thư viện, kết hợp ngữ pháp chuẩn cấp độ ${level} để tổng hợp bộ câu hỏi trộn mới lạ, phân hóa cao.`;
  } else {
    sourceGuidance = `AI SÁNG TẠO ĐỘC ĐÁO & ĐA DẠNG BẬC CAO (Seed: ${seed}):
Hãy đóng vai Hội đồng Khảo thí Quốc tế ${exam}. Sáng tạo bộ đề thi hoàn toàn MỚI LẠ 100%, trộn ngẫu nhiên kiến thức từ 4 chủ đề thực tế: [${selectedTopics}] thuộc trình độ ${level}.
BẮT BUỘC:
- Mãi mãi tạo ra câu hỏi độc đáo, tuyệt đối KHÔNG lặp lại các mẫu câu đơn điệu hay bài đọc quen thuộc của lần trước.
- Trộn lẫn nhiều mảng kiến thức ngữ pháp + từ vựng cao cấp thuộc cấp độ ${level}.
- Thiết lập câu hỏi phân loại tư duy (từ nhận biết đến phân tích logic), tạo phương án nhiễu sắc bén để giúp người học tiến bộ vượt bậc.`;
  }

  const examFormatGuide = `
QUY CHUẨN BÀI THI QUỐC TẾ (${exam} - ${level}):
- TOPIK (Hàn): Đọc hiểu đoạn văn ngắn/dài, điền từ/ngữ pháp phù hợp vào (  ), nhìn bài báo/biểu đồ chọn ý đúng, sắp xếp câu (가-나-da-라), chọn chủ đề/tâm trạng/suy nghĩ trọng tâm.
- TOEIC (Anh): Part 5 (Incomplete Sentences - Ngữ pháp & Từ vựng), Part 6 (Text Completion - Hoàn thành đoạn văn), Part 7 (Reading Comprehension - Email, Thông báo, Bài báo, Biểu đồ).
- IELTS (Anh): Multiple Choice, True/False/Not Given, Matching Headings (Ghép tiêu đề đoạn văn), Sentence & Summary Completion.
- HSK (Trung): Đọc hiểu đoạn văn ngắn, chọn từ điền chỗ trống, câu đúng/sai, trắc nghiệm từ vựng & cấu trúc ngữ pháp HSK chuẩn.
`;

  return `Bạn là Chuyên gia Khảo thí Quốc tế biên soạn đề thi ${exam} (${level}).
${sourceGuidance}
${examFormatGuide}

Yêu cầu: Tạo đúng ${count} câu hỏi đa dạng kỹ năng (Đọc hiểu, Từ vựng, Ngữ pháp, Phân tích bối cảnh).

BẮT BUỘC TRẢ VỀ CHUẨN JSON THUẦN TÚY (Không chứa mã markdown \`\`\`json, không có text dư thừa):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice" | "reading-comprehension" | "fill-blank" | "sentence-order",
      "prompt": "Nội dung câu hỏi bằng ${lang} (Ví dụ: Đọc đoạn văn sau và chọn đáp án trả lời câu hỏi)",
      "passage": "Đoạn văn ngắn/bài báo/hội thoại thực tế bằng ${lang} (nếu là dạng bài đọc hiểu, nếu không để rỗng hoặc omit)",
      "choices": [
        {"id": "a", "text": "Phương án A bằng ${lang}"},
        {"id": "b", "text": "Phương án B bằng ${lang}"},
        {"id": "c", "text": "Phương án C bằng ${lang}"},
        {"id": "d", "text": "Phương án D bằng ${lang}"}
      ],
      "answer": "a",
      "explanation": "Lời giải chi tiết chuyên sâu bằng Tiếng Việt: Giải thích rõ vì sao đáp án này đúng, phân tích từ vựng chìa khóa, cấu trúc ngữ pháp cốt lõi và vì sao các phương án còn lại sai."
    }
  ]
}
BẮT BUỘC: Mọi câu hỏi trắc nghiệm và đọc hiểu ĐỀU PHẢI CÓ ĐỦ 4 PHƯƠNG ÁN 'choices' (a, b, c, d). Phần 'answer' ghi rõ id đáp án ('a', 'b', 'c', hoặc 'd').`;
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      exam,
      level,
      format = "all",
      mode = "practice",
      source = "ai",
      questionCount = 10,
      fileUrls = [],
      libraryContext = "",
    } = body as {
      exam: string;
      level: string;
      format?: string;
      mode?: "practice" | "real_exam";
      source?: "ai" | "library";
      questionCount?: number;
      fileUrls?: string[];
      libraryContext?: string;
    };

    if (!exam || !level) {
      return NextResponse.json(
        { error: "Thiếu tham số exam hoặc level." },
        { status: 400 }
      );
    }

    const targetCount = Math.min(Math.max(questionCount, 5), 25);
    let questions: Question[] = [];
    const prompt = buildPrompt(exam, level, format, mode, targetCount, source, fileUrls, libraryContext);

    // AI Generation Logic with high temperature for maximum diversity & reasoning
    const generateAiQuestions = async (): Promise<Question[] | null> => {
      // KÊNH 1: Google AI Studio Direct (Gemini 2.5 Flash / 2.5 Pro)
      const directResult = await callGoogleAIDirect(prompt, {
        maxOutputTokens: 3500,
        temperature: 0.9, // High creativity & high variety
      });

      if (directResult?.text) {
        try {
          const jsonStr = directResult.text
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return parsed.questions;
          }
        } catch {
          // parse failed
        }
      }

      // KÊNH 2: OpenRouter Multi-Model Routing Chain (High Reasoning Models)
      try {
        const result = await createChatCompletion({
          task: "exam_generation",
          messages: [
            {
              role: "system",
              content: `Bạn là Hội đồng Khảo thí Quốc tế soạn đề ${exam} (${level}). MỖI LẦN TẠO LÀ BỘ ĐỀ ĐỘC ĐÁO MỚI 100%, KHÔNG LẶP LẠI. CHỈ TRẢ VỀ JSON THUẦN TÚY.`,
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.9,
        });

        const jsonStr = result.content
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed.questions;
        }
      } catch {
        // failed
      }

      return null;
    };

    const aiResult = await generateAiQuestions();

    if (aiResult && aiResult.length > 0) {
      questions = aiResult.slice(0, targetCount).map((q, idx) => ({
        ...q,
        id: `q-${idx + 1}-${Date.now()}`,
      }));
    } else {
      console.warn("[exam-prep] Serving dynamically shuffled preset fallback questions.");
      const key = exam.toUpperCase() as keyof typeof SAMPLES;
      const baseSamples = SAMPLES[key] || SAMPLES.TOPIK || [];
      const shuffled = [...baseSamples].sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, targetCount).map((q, idx) => ({
        ...q,
        id: `gen-${idx + 1}-${Date.now()}`,
      }));
    }

    let sessionId = `session-${Date.now()}`;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: session } = await supabase
          .from("practice_sessions")
          .insert({
            user_id: user.id,
            exam_type: exam,
            level,
            total_questions: questions.length,
            correct_count: 0,
            status: "in_progress",
          })
          .select("id")
          .single();

        if (session) sessionId = session.id;
      }
    } catch {
      // Supabase table not created yet, proceed with session ID
    }

    return NextResponse.json({ sessionId, questions });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({
      sessionId: `fallback-${Date.now()}`,
      questions: (SAMPLES.TOPIK || []).slice(0, 10),
    });
  }
}

// Preset samples fallback definition
const SAMPLES: Record<string, Question[]> = {
  TOPIK: [
    {
      id: "t1",
      type: "multiple-choice",
      prompt: "다음 밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오: '이 문제는 너무 _어렵다_.'",
      choices: [
        { id: "a", text: "쉬운 편이다" },
        { id: "b", text: "복잡하고 힘들다" },
        { id: "c", text: "재미있다" },
        { id: "d", text: "간단하다" },
      ],
      answer: "b",
      explanation: "어렵다 (khó) tương đương với 복잡하고 힘들다 (phức tạp và vất vả).",
    },
  ],
};
