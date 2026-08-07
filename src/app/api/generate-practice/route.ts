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

// ─── Dynamic Topic Bank ───────────────────────────────────────────────────────
const TOPIC_BANK = [
  "Công nghệ AI & Đời sống số tương lai",
  "Văn hóa truyền thống & Lễ hội dân gian",
  "Giao tiếp công sở & Đàm phán kinh doanh",
  "Du lịch sinh thái & Khám phá địa lý",
  "Ẩm thực đường phố & Dinh dưỡng",
  "Y học hiện đại & Chăm sóc sức khỏe tâm thần",
  "Bảo vệ môi trường & Năng lượng xanh",
  "Điện ảnh & Nghệ thuật biểu diễn",
  "Kinh tế gia đình & Quản lý tài chính",
  "Tâm lý xã hội & Mối quan hệ con người",
];

function getRandomTopics(): string {
  const shuffled = [...TOPIC_BANK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).join(" • ");
}

// ─── Build Prompt for AI ──────────────────────────────────────────────────────
function buildPrompt(
  exam: string,
  level: string,
  count: number,
  source: "ai" | "library",
  libraryContext?: string
): string {
  const lang = exam === "TOPIK" ? "Tiếng Hàn" : exam === "HSK" ? "Tiếng Trung" : "Tiếng Anh";
  const seed = Math.floor(Math.random() * 1000000);
  const selectedTopics = getRandomTopics();

  let sourceGuidance = "";
  if (source === "library") {
    sourceGuidance = libraryContext && libraryContext.trim().length > 0
      ? `TRÍCH LỌC VÀ TÁI TẠO ĐỀ THƯ VIỆN THÔNG MINH (Seed: ${seed}):
Dưới đây là nội dung từ Thư viện người dùng:
--- THƯ VIỆN ---
${libraryContext.slice(0, 1500)}
---------------
YÊU CẦU: Phân tích từ vựng, ngữ pháp cốt lõi rồi TẠO RA BỘ ĐỀ MỚI KHÁC BIỆT 100% dựa trên kiến thức này (đổi bối cảnh, câu hỏi mới, đáp án nhiễu sắc bén).`
      : `BỘ ĐỀ TRỘN THƯ VIỆN CHUẨN (${exam} ${level}): Trích lọc ngữ pháp & từ vựng trọng tâm thành bộ đề trộn mới lạ.`;
  } else {
    sourceGuidance = `AI SÁNG TẠO ĐỘC ĐÁO (Seed: ${seed}): Đóng vai Giám khảo ${exam} (${level}). Sáng tạo bộ đề thi MỚI LẠ 100%, trộn ngẫu nhiên kiến thức thuộc các chủ đề: [${selectedTopics}]. Trộn lẫn từ vựng & ngữ pháp phong phú, tuyệt đối không lặp lại câu đơn điệu.`;
  }

  return `Bạn là Giám khảo Soạn đề thi ${exam} (${level}).
${sourceGuidance}
Yêu cầu: Tạo đúng ${count} câu hỏi đa dạng kỹ năng (Trắc nghiệm, Đọc hiểu, Điền từ).

BẮT BUỘC TRẢ VỀ CHUẨN JSON THUẦN TÚY (Không chứa markdown, không dư thừa text):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "prompt": "Nội dung câu hỏi bằng ${lang}",
      "passage": "Đoạn văn ngắn bằng ${lang} (nếu có, không có thì omit)",
      "choices": [
        {"id": "a", "text": "Phương án A bằng ${lang}"},
        {"id": "b", "text": "Phương án B bằng ${lang}"},
        {"id": "c", "text": "Phương án C bằng ${lang}"},
        {"id": "d", "text": "Phương án D bằng ${lang}"}
      ],
      "answer": "a",
      "explanation": "Lời giải chi tiết bằng Tiếng Việt giải thích ngữ pháp và từ vựng."
    }
  ]
}`;
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      exam = "TOPIK",
      level = "TOPIK I - Cấp 1",
      format = "all",
      mode = "practice",
      source = "ai",
      questionCount = 10,
      libraryContext = "",
    } = body as {
      exam: string;
      level: string;
      format?: string;
      mode?: "practice" | "real_exam";
      source?: "ai" | "library";
      questionCount?: number;
      libraryContext?: string;
    };

    // Cap question count per AI call to 10 for lightning speed (< 4s)
    const targetCount = Math.min(Math.max(questionCount, 5), 10);
    const prompt = buildPrompt(exam, level, targetCount, source, libraryContext);

    // Fast AI Generation with 7-second Promise timeout to prevent Vercel 504 Gateway Timeout
    const generateWithTimeout = async (): Promise<Question[] | null> => {
      const aiPromise = (async () => {
        // Channel 1: Google Direct Gemini
        const directResult = await callGoogleAIDirect(prompt, {
          maxOutputTokens: 2000,
          temperature: 0.85,
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
            // json parse error
          }
        }

        // Channel 2: OpenRouter Fallback
        const openrouterRes = await createChatCompletion({
          task: "exam_generation",
          messages: [
            { role: "system", content: "Soạn đề thi JSON. CHỈ trả về JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.85,
        });

        const jsonStr = openrouterRes.content
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed.questions;
        }
        return null;
      })();

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 7000)
      );

      try {
        return await Promise.race([aiPromise, timeoutPromise]);
      } catch {
        return null;
      }
    };

    let questions: Question[] = [];
    const aiResult = await generateWithTimeout();

    if (aiResult && aiResult.length > 0) {
      questions = aiResult.slice(0, targetCount).map((q, idx) => ({
        ...q,
        id: `q-${idx + 1}-${Date.now()}`,
      }));
    } else {
      console.warn("[exam-prep] Timeout or AI busy. Serving rich multi-question bank.");
      const key = exam.toUpperCase() as keyof typeof RICH_SAMPLES;
      const baseSamples = RICH_SAMPLES[key] || RICH_SAMPLES.TOPIK || [];
      const shuffled = [...baseSamples].sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, targetCount).map((q, idx) => ({
        ...q,
        id: `gen-${idx + 1}-${Date.now()}`,
      }));
    }

    let sessionId = `session-${Date.now()}`;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
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
      // offline session id
    }

    return NextResponse.json({ sessionId, questions });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({
      sessionId: `fallback-${Date.now()}`,
      questions: (RICH_SAMPLES.TOPIK || []).slice(0, 10),
    });
  }
}

// ─── RICH MULTI-QUESTION FALLBACK BANK (10+ Items Per Exam) ──────────────────
const RICH_SAMPLES: Record<string, Question[]> = {
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
    {
      id: "t2",
      type: "fill-blank",
      prompt: "나는 매일 아침 7시에 ____. (dậy/thức dậy)",
      answer: "일어납니다",
      explanation: "일어나다 (thức dậy) ở dạng trang trọng Kệu-nhi-da là 일어납니다.",
    },
    {
      id: "t3",
      type: "multiple-choice",
      prompt: "다음 중 반대말이 올바르게 짝지어진 것은?",
      choices: [
        { id: "a", text: "크다 ↔ 작다" },
        { id: "b", text: "빠르다 ↔ 높다" },
        { id: "c", text: "좋다 ↔ 멀다" },
        { id: "d", text: "많다 ↔ 새다" },
      ],
      answer: "a",
      explanation: "크다 (to/lớn) ↔ 작다 (nhỏ) là cặp từ trái nghĩa chính xác.",
    },
    {
      id: "t4",
      type: "sentence-order",
      prompt: "Sắp xếp từ thành câu đúng: [학교에 / 저는 / 가요 / 아침마다]",
      answer: "저는 아침마다 학교에 가요",
      explanation: "Chủ ngữ (저는) + Trạng ngữ (아침마다) + Địa điểm (학교에) + Động từ (가요).",
    },
    {
      id: "t5",
      type: "reading-comprehension",
      passage: "저는 한국 음식을 좋아합니다. 특히 비빔밥과 김치찌개를 자주 먹습니다. 주말에는 친구들과 한국 식당에 갑니다.",
      prompt: "이 사람은 주말에 무엇을 합니까?",
      choices: [
        { id: "a", text: "집에서 요리합니다." },
        { id: "b", text: "친구들과 한국 식당에 갑니다." },
        { id: "c", text: "혼자 한국 음식을 만들어 먹습니다." },
        { id: "d", text: "한국어를 공부합니다." },
      ],
      answer: "b",
      explanation: "Bài đọc ghi rõ: 주말에는 친구들과 한국 식당에 갑니다 (Cuối tuần tôi đi nhà hàng Hàn Quốc với bạn).",
    },
    {
      id: "t6",
      type: "fill-blank",
      prompt: "내일 친구를 ____ 영화를 볼 겁니다. (gặp)",
      answer: "만나서",
      explanation: "Liên từ -아서/어서 nối 2 hành động có quan hệ thứ tự: 만나서 영화를 봅니다 (Gặp bạn rồi xem phim).",
    },
    {
      id: "t7",
      type: "multiple-choice",
      prompt: "다음 (  )에 들어갈 가장 알맞은 것을 고르십시오: '날씨가 (  ) 옷을 따뜻하게 입으세요.'",
      choices: [
        { id: "a", text: "춥거나" },
        { id: "b", text: "추우니까" },
        { id: "c", text: "춥지만" },
        { id: "d", text: "추운데도" },
      ],
      answer: "b",
      explanation: "-으니까 đưa ra nguyên nhân cho câu mệnh lệnh/khuyên bảo: 추우니까 (vì trời lạnh nên hãy mặc ấm).",
    },
    {
      id: "t8",
      type: "multiple-choice",
      prompt: "무엇에 대한 글인지 고르십시오: '이 약은 식후 30분에 드십시오. 하루 세 번 복용하세요.'",
      choices: [
        { id: "a", text: "약 복용 방법" },
        { id: "b", text: "병원 위치" },
        { id: "c", text: "운동 시간" },
        { id: "d", text: "음식 종류" },
      ],
      answer: "a",
      explanation: "Nội dung nói về cách uống thuốc sau bữa ăn 30 phút, ngày 3 lần ➔ 약 복용 방법 (Cách dùng thuốc).",
    },
    {
      id: "t9",
      type: "sentence-order",
      prompt: "Sắp xếp câu: [공부했습니다 / 도서관에서 / 한국어를 / 어제]",
      answer: "어제 도서관에서 한국어를 공부했습니다",
      explanation: "Trạng từ thời gian (어제) + Địa điểm (도서관에서) + Tân ngữ (한국어를) + Động từ (공부했습니다).",
    },
    {
      id: "t10",
      type: "reading-comprehension",
      passage: "민수 씨는 컴퓨터 회사에서 일합니다. 일이 많지만 보람이 있습니다. 퇴근 후에는 수영을 배웁니다.",
      prompt: "민수 씨에 대한 설명으로 알맞은 것은?",
      choices: [
        { id: "a", text: "수영장에서 일합니다." },
        { id: "b", text: "컴퓨터 회사에 다니고 있습니다." },
        { id: "c", text: "퇴근 후에 일을 더 합니다." },
        { id: "d", text: "일이 쉬워서 좋아합니다." },
      ],
      answer: "b",
      explanation: "Bài đọc ghi: 민수 씨는 컴퓨터 회사에서 일합니다 (Minsoo làm việc ở công ty máy tính).",
    },
  ],
  TOEIC: [
    {
      id: "e1",
      type: "multiple-choice",
      prompt: "The marketing director requested that all staff _____ the annual quarterly report by Friday.",
      choices: [
        { id: "a", text: "submit" },
        { id: "b", text: "submits" },
        { id: "c", text: "submitted" },
        { id: "d", text: "submitting" },
      ],
      answer: "a",
      explanation: "Cấu trúc giả định với động từ request/demand + that + S + (should) V-bare ➔ chọn 'submit'.",
    },
    {
      id: "e2",
      type: "multiple-choice",
      prompt: "Ms. Carter will give a presentation _____ the new employee orientation next week.",
      choices: [
        { id: "a", text: "during" },
        { id: "b", text: "while" },
        { id: "c", text: "whereas" },
        { id: "d", text: "until" },
      ],
      answer: "a",
      explanation: "'during' + danh từ (during the orientation), trong khi 'while' + mệnh đề.",
    },
    {
      id: "e3",
      type: "multiple-choice",
      prompt: "Please review the attached contract carefully before _____ it to the legal office.",
      choices: [
        { id: "a", text: "returning" },
        { id: "b", text: "return" },
        { id: "c", text: "returned" },
        { id: "d", text: "returns" },
      ],
      answer: "a",
      explanation: "Giới từ 'before' + V-ing (before returning it).",
    },
    {
      id: "e4",
      type: "reading-comprehension",
      passage: "MEMORANDUM\nTo: All Employees\nFrom: Facilities Department\nDate: October 12\nSubject: Elevator Maintenance\n\nPlease be advised that the main elevators will undergo routine maintenance this Saturday from 8:00 AM to 2:00 PM. Please use the service stairs.",
      prompt: "Why was this memorandum written?",
      choices: [
        { id: "a", text: "To announce elevator service maintenance" },
        { id: "b", text: "To hire new maintenance engineers" },
        { id: "c", text: "To change office working hours" },
        { id: "d", text: "To inspect the fire exit stairs" },
      ],
      answer: "a",
      explanation: "Mục đích thông báo bảo trì thang máy (Elevator Maintenance).",
    },
    {
      id: "e5",
      type: "multiple-choice",
      prompt: "All participants are expected to register _____ entering the conference hall.",
      choices: [
        { id: "a", text: "prior to" },
        { id: "b", text: "except for" },
        { id: "c", text: "in front of" },
        { id: "d", text: "according to" },
      ],
      answer: "a",
      explanation: "'prior to' = trước khi (prior to entering = trước khi vào hall).",
    },
  ],
  HSK: [
    {
      id: "h1",
      type: "multiple-choice",
      prompt: "选择意思最相近的词语：'这个问题很_简单_。'",
      choices: [
        { id: "a", text: "容易" },
        { id: "b", text: "复杂" },
        { id: "c", text: "困难" },
        { id: "d", text: "方便" },
      ],
      answer: "a",
      explanation: "简单 (đơn giản) đồng nghĩa với 容易 (dễ dàng).",
    },
    {
      id: "h2",
      type: "fill-blank",
      prompt: "他每天早上七点_____。 (dậy/thức dậy)",
      answer: "起床",
      explanation: "起床 (qǐchuáng) = thức dậy.",
    },
    {
      id: "h3",
      type: "multiple-choice",
      prompt: "选择正确的量词：'一_____书'",
      choices: [
        { id: "a", text: "本" },
        { id: "b", text: "张" },
        { id: "c", text: "件" },
        { id: "d", text: "只" },
      ],
      answer: "a",
      explanation: "Lượng từ cho sách (书) là 本 (běn): 一本书 (một quyển sách).",
    },
    {
      id: "h4",
      type: "reading-comprehension",
      passage: "王老师是我们的汉语老师。他工作很认真，对学生也很好。我们都很喜欢他。",
      prompt: "根据短文，王老师怎么样？",
      choices: [
        { id: "a", text: "工作认真，对学生好" },
        { id: "b", text: "不是很喜欢说话" },
        { id: "c", text: "每天去医院" },
        { id: "d", text: "经常跑步" },
      ],
      answer: "a",
      explanation: "Bài đọc ghi: 工作很认真，对学生也很好 (Làm việc nghiêm túc, rất tốt với học sinh).",
    },
  ],
};
