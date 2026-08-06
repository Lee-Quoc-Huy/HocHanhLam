import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

/**
 * POST /api/generate-practice
 *
 * Body: { exam: "TOPIK" | "TOEIC" | "HSK", level: string, fileUrls: string[] }
 *
 * Uses the Google Gemini API (via GEMINI_API_KEY env var) to generate a
 * 10-question practice set, then auto-saves the session to Supabase.
 *
 * Falls back to hard-coded sample questions when GEMINI_API_KEY is not set,
 * so the UI is fully functional even without a key during local development.
 */

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: "multiple-choice" | "fill-blank" | "listening";
  prompt: string;
  choices?: Choice[];
  answer: string;
  audioUrl?: string;
  explanation?: string;
}

// ─── Sample fallback questions per exam ───────────────────────────────────────
const SAMPLES: Record<string, Question[]> = {
  TOPIK: [
    {
      id: "t1",
      type: "multiple-choice",
      prompt: "다음 중 '학교'의 뜻으로 알맞은 것은 무엇입니까?",
      choices: [
        { id: "a", text: "Nhà hàng" },
        { id: "b", text: "Trường học" },
        { id: "c", text: "Bệnh viện" },
        { id: "d", text: "Siêu thị" },
      ],
      answer: "b",
      explanation: "학교 (hakgyo) có nghĩa là 'trường học'.",
    },
    {
      id: "t2",
      type: "fill-blank",
      prompt: "나는 매일 아침 ____을/를 먹습니다. (bữa sáng)",
      answer: "밥",
      explanation: "밥 (bap) là cơm / bữa ăn trong tiếng Hàn.",
    },
    {
      id: "t3",
      type: "multiple-choice",
      prompt: "다음 중 반대말이 올바른 것은?",
      choices: [
        { id: "a", text: "크다 ↔ 작다" },
        { id: "b", text: "빠르다 ↔ 높다" },
        { id: "c", text: "좋다 ↔ 멀다" },
        { id: "d", text: "많다 ↔ 새다" },
      ],
      answer: "a",
      explanation: "크다 (lớn) ↔ 작다 (nhỏ) là cặp từ đối nghĩa đúng.",
    },
    {
      id: "t4",
      type: "fill-blank",
      prompt: "저는 한국____입니다. (người)",
      answer: "사람",
      explanation: "사람 (saram) nghĩa là 'người'.",
    },
    {
      id: "t5",
      type: "multiple-choice",
      prompt: "다음 문장을 완성하세요: '오늘 날씨가 ____.'",
      choices: [
        { id: "a", text: "좋아요" },
        { id: "b", text: "먹어요" },
        { id: "c", text: "배워요" },
        { id: "d", text: "드려요" },
      ],
      answer: "a",
      explanation: "'날씨가 좋아요' = Thời tiết hôm nay đẹp.",
    },
    {
      id: "t6",
      type: "fill-blank",
      prompt: "우리 가족은 ____명입니다. (ba người)",
      answer: "세",
      explanation: "세 명 = ba người trong tiếng Hàn.",
    },
    {
      id: "t7",
      type: "multiple-choice",
      prompt: "'어디에 가요?' có nghĩa là gì?",
      choices: [
        { id: "a", text: "Bạn ăn gì?" },
        { id: "b", text: "Bạn đi đâu?" },
        { id: "c", text: "Bạn làm gì?" },
        { id: "d", text: "Bạn mua gì?" },
      ],
      answer: "b",
      explanation: "어디에 가요 = Bạn đi đâu vậy?",
    },
    {
      id: "t8",
      type: "fill-blank",
      prompt: "커피 한 ____주세요. (tách/ly)",
      answer: "잔",
      explanation: "잔 (jan) là đơn vị đếm cho tách/ly đồ uống.",
    },
    {
      id: "t9",
      type: "multiple-choice",
      prompt: "다음 중 존댓말이 올바른 것은?",
      choices: [
        { id: "a", text: "먹어" },
        { id: "b", text: "먹습니다" },
        { id: "c", text: "먹자" },
        { id: "d", text: "먹어라" },
      ],
      answer: "b",
      explanation: "먹습니다 là thể kính ngữ (formal polite) của 먹다.",
    },
    {
      id: "t10",
      type: "fill-blank",
      prompt: "저는 회사____다닙니다. (입자 trợ từ vị trí/địa điểm)",
      answer: "에",
      explanation: "에 là trợ từ chỉ địa điểm/hướng đến (에 = ở/đến).",
    },
  ],
  TOEIC: [
    {
      id: "tc1",
      type: "multiple-choice",
      prompt: "The meeting has been ____ until next Monday.",
      choices: [
        { id: "a", text: "postponed" },
        { id: "b", text: "cancelled out" },
        { id: "c", text: "approved" },
        { id: "d", text: "submitted" },
      ],
      answer: "a",
      explanation: "postponed = hoãn lại. 'postponed until' là cụm cố định.",
    },
    {
      id: "tc2",
      type: "fill-blank",
      prompt: "Please ____ the attached document before the deadline. (review)",
      answer: "review",
      explanation: "review = xem xét, đọc lại tài liệu.",
    },
    {
      id: "tc3",
      type: "multiple-choice",
      prompt: "The report ____ by the manager before noon.",
      choices: [
        { id: "a", text: "will approve" },
        { id: "b", text: "will be approved" },
        { id: "c", text: "approves" },
        { id: "d", text: "was approving" },
      ],
      answer: "b",
      explanation: "Câu bị động tương lai: will be + V3.",
    },
    {
      id: "tc4",
      type: "fill-blank",
      prompt: "We need to ____ a new strategy for the next quarter. (develop)",
      answer: "develop",
      explanation: "develop a strategy = xây dựng chiến lược.",
    },
    {
      id: "tc5",
      type: "multiple-choice",
      prompt: "Which word means 'to postpone'?",
      choices: [
        { id: "a", text: "accelerate" },
        { id: "b", text: "delay" },
        { id: "c", text: "confirm" },
        { id: "d", text: "process" },
      ],
      answer: "b",
      explanation: "delay = trì hoãn, hoãn lại.",
    },
    {
      id: "tc6",
      type: "fill-blank",
      prompt: "The client was ____ with our proposal. (hài lòng)",
      answer: "satisfied",
      explanation: "satisfied with = hài lòng với.",
    },
    {
      id: "tc7",
      type: "multiple-choice",
      prompt: "The deadline for ____ the application is Friday.",
      choices: [
        { id: "a", text: "submit" },
        { id: "b", text: "submitted" },
        { id: "c", text: "submitting" },
        { id: "d", text: "to submit" },
      ],
      answer: "c",
      explanation: "Sau giới từ 'for', dùng V-ing: for submitting.",
    },
    {
      id: "tc8",
      type: "fill-blank",
      prompt: "Please ____ the invoice to accounting. (forward/send)",
      answer: "forward",
      explanation: "forward = chuyển tiếp, gửi đi.",
    },
    {
      id: "tc9",
      type: "multiple-choice",
      prompt: "Employees are ____ to attend the safety training.",
      choices: [
        { id: "a", text: "required" },
        { id: "b", text: "requested" },
        { id: "c", text: "supposed" },
        { id: "d", text: "allowed" },
      ],
      answer: "a",
      explanation: "required to = bắt buộc phải.",
    },
    {
      id: "tc10",
      type: "fill-blank",
      prompt: "The company will ____ a bonus to all employees. (award)",
      answer: "award",
      explanation: "award a bonus = trao thưởng/bonus.",
    },
  ],
  HSK: [
    {
      id: "h1",
      type: "multiple-choice",
      prompt: "'你好' có nghĩa là gì?",
      choices: [
        { id: "a", text: "Tạm biệt" },
        { id: "b", text: "Xin chào" },
        { id: "c", text: "Cảm ơn" },
        { id: "d", text: "Xin lỗi" },
      ],
      answer: "b",
      explanation: "你好 (nǐ hǎo) = Xin chào.",
    },
    {
      id: "h2",
      type: "fill-blank",
      prompt: "我____中文。(học)",
      answer: "学",
      explanation: "学 (xué) = học.",
    },
    {
      id: "h3",
      type: "multiple-choice",
      prompt: "'谢谢' đọc là gì?",
      choices: [
        { id: "a", text: "xièxie" },
        { id: "b", text: "nǐhǎo" },
        { id: "c", text: "zàijiàn" },
        { id: "d", text: "duìbuqǐ" },
      ],
      answer: "a",
      explanation: "谢谢 (xièxie) = Cảm ơn.",
    },
    {
      id: "h4",
      type: "fill-blank",
      prompt: "我____北京人。(là)",
      answer: "是",
      explanation: "是 (shì) = là, động từ to be trong tiếng Trung.",
    },
    {
      id: "h5",
      type: "multiple-choice",
      prompt: "Chữ nào có nghĩa là 'nước'?",
      choices: [
        { id: "a", text: "火" },
        { id: "b", text: "水" },
        { id: "c", text: "土" },
        { id: "d", text: "木" },
      ],
      answer: "b",
      explanation: "水 (shuǐ) = nước.",
    },
    {
      id: "h6",
      type: "fill-blank",
      prompt: "今天____期几？(thứ mấy)",
      answer: "星",
      explanation: "星期几 (xīngqī jǐ) = thứ mấy?",
    },
    {
      id: "h7",
      type: "multiple-choice",
      prompt: "'我不喝茶' có nghĩa là?",
      choices: [
        { id: "a", text: "Tôi uống trà" },
        { id: "b", text: "Tôi không uống trà" },
        { id: "c", text: "Tôi thích trà" },
        { id: "d", text: "Tôi mua trà" },
      ],
      answer: "b",
      explanation: "不 (bù) = không, phủ định. 喝茶 = uống trà.",
    },
    {
      id: "h8",
      type: "fill-blank",
      prompt: "她____老师。(là)",
      answer: "是",
      explanation: "是 = là, dùng để nối chủ ngữ và danh từ.",
    },
    {
      id: "h9",
      type: "multiple-choice",
      prompt: "Số '八' trong tiếng Hán đọc là?",
      choices: [
        { id: "a", text: "liù" },
        { id: "b", text: "qī" },
        { id: "c", text: "bā" },
        { id: "d", text: "jiǔ" },
      ],
      answer: "c",
      explanation: "八 (bā) = 8.",
    },
    {
      id: "h10",
      type: "fill-blank",
      prompt: "你____什么名字？(tên bạn là gì — động từ hỏi tên)",
      answer: "叫",
      explanation: "你叫什么名字？(nǐ jiào shénme míngzì) = Bạn tên là gì?",
    },
  ],
};

// ─── Build Gemini prompt ────────────────────────────────────────────────────────
function buildPrompt(exam: string, level: string, fileUrls: string[]): string {
  const context =
    fileUrls.length > 0
      ? `Tham khảo thêm nội dung từ các tệp sau (nếu có thể): ${fileUrls.slice(0, 3).join(", ")}.`
      : "Tạo câu hỏi dựa trên kiến thức chuẩn của kỳ thi.";

  return `Bạn là một giáo viên chuyên luyện thi ${exam} cấp độ ${level}.
${context}

Hãy tạo đúng 10 câu hỏi luyện tập cho kỳ thi ${exam} cấp ${level}.
Trả về JSON có dạng:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice" | "fill-blank",
      "prompt": "Nội dung câu hỏi...",
      "choices": [{"id": "a", "text": "..."}, ...],  // chỉ cho multiple-choice
      "answer": "a",  // id của đáp án đúng cho MC, hoặc chuỗi văn bản cho fill-blank
      "explanation": "Giải thích ngắn gọn..."
    }
  ]
}

Quy tắc:
- Dùng hỗn hợp multiple-choice và fill-blank
- Đảm bảo độ khó phù hợp cấp ${level}
- Câu hỏi bằng ngôn ngữ của kỳ thi (Hàn/Anh/Trung), giải thích bằng tiếng Việt
- CHỈ trả về JSON thuần túy, không có markdown hay text thừa`;
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exam, level, fileUrls = [] } = body as {
      exam: string;
      level: string;
      fileUrls: string[];
    };

    if (!exam || !level) {
      return NextResponse.json(
        { error: "Thiếu tham số exam hoặc level." },
        { status: 400 }
      );
    }

    let questions: Question[];
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // ── Call Gemini ────────────────────────────────────────────────────────
      const prompt = buildPrompt(exam, level, fileUrls);
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error("Gemini API error:", errText);
        throw new Error("Gemini API trả về lỗi. Dùng câu hỏi mẫu thay thế.");
      }

      const geminiData = await geminiRes.json();
      const rawText: string =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      // Strip markdown fences if present
      const jsonStr = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed = JSON.parse(jsonStr);
      questions = parsed.questions ?? [];

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Gemini không trả về câu hỏi hợp lệ.");
      }
    } else {
      // ── Fallback to sample questions ───────────────────────────────────────
      console.warn("GEMINI_API_KEY không được cài. Dùng câu hỏi mẫu.");
      const key = exam.toUpperCase() as keyof typeof SAMPLES;
      questions = SAMPLES[key] ?? SAMPLES["TOPIK"];
    }

    // ── Save session to Supabase ─────────────────────────────────────────────
    let sessionId = `local-${Date.now()}`;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: session } = await supabase
          .from("exam_sessions")
          .insert({
            user_id: user.id,
            exam,
            level,
            questions: questions as any,
          })
          .select("id")
          .single();

        if (session?.id) sessionId = session.id;
      }
    } catch (dbErr) {
      // Non-fatal — session still works, just won't be persisted
      console.warn("Không lưu được session vào Supabase:", dbErr);
    }

    return NextResponse.json({ sessionId, questions });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Lỗi không xác định.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
