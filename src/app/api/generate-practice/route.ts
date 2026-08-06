import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createChatCompletion } from "@/lib/ai/openrouter-client";

export const maxDuration = 60;

/**
 * POST /api/generate-practice
 *
 * Body: { exam: "TOPIK" | "TOEIC" | "IELTS" | "HSK", level: string, format?: string, fileUrls?: string[] }
 *
 * Uses OpenRouter with a multi-AI fallback chain:
 *   Gemini 2.5 Flash → DeepSeek R1 → Qwen 72B → Nemotron → Llama 3.3
 */

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: "multiple-choice" | "fill-blank" | "listening" | "reading-comprehension" | "sentence-order" | "speaking-prompt";
  prompt: string;
  passage?: string;
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
      prompt: "나는 매일 아침 ____을/를 먹습니다. (cơm/bữa ăn)",
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
      type: "sentence-order",
      prompt: "Hãy sắp xếp từ sau thành câu hoàn chỉnh: [가요 / 학교에 / 저는]",
      answer: "저는 학교에 가요",
      explanation: "Chủ ngữ (저는) + Địa điểm (학교에) + Động từ (가요).",
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
      type: "reading-comprehension",
      passage: "저는 민수입니다. 저는 한국어 선생님입니다. 매일 학교에서 학생들에게 한국어를 가르칩니다.",
      prompt: "민수의 직업은 무엇입니까?",
      choices: [
        { id: "a", text: "의사" },
        { id: "b", text: "선생님" },
        { id: "c", text: "요리사" },
        { id: "d", text: "경찰" },
      ],
      answer: "b",
      explanation: "Trong đoạn văn ghi: '저는 한국어 선생님입니다' (Tôi là giáo viên tiếng Hàn).",
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
      explanation: "먹습니다 là thể kính ngữ trang trọng của 먹다.",
    },
    {
      id: "t10",
      type: "speaking-prompt",
      prompt: "한국어로 자기소개를 해 보세요. (Hãy tự giới thiệu bản thân bằng tiếng Hàn: Tên, quốc tịch, nghề nghiệp)",
      answer: "안녕하세요",
      explanation: "Mẫu câu cơ bản: 안녕하세요. 저는 [Tên]입니다. 베트남 사람입니다.",
    },
  ],
  TOEIC: [
    {
      id: "tc1",
      type: "multiple-choice",
      prompt: "The meeting has been ____ until next Monday due to severe weather conditions.",
      choices: [
        { id: "a", text: "postponed" },
        { id: "b", text: "cancelled out" },
        { id: "c", text: "approved" },
        { id: "d", text: "submitted" },
      ],
      answer: "a",
      explanation: "postponed = trì hoãn. Cụm 'postponed until' nghĩa là hoãn đến khi...",
    },
    {
      id: "tc2",
      type: "fill-blank",
      prompt: "Please ____ the attached budget proposal before tomorrow's executive meeting.",
      answer: "review",
      explanation: "review = xem xét, rà soát lại tài liệu.",
    },
    {
      id: "tc3",
      type: "multiple-choice",
      prompt: "The quarterly report ____ by the regional manager before noon.",
      choices: [
        { id: "a", text: "will approve" },
        { id: "b", text: "will be approved" },
        { id: "c", text: "approves" },
        { id: "d", text: "was approving" },
      ],
      answer: "b",
      explanation: "Câu bị động ở thì tương lai đơn: will be + V3/V-ed.",
    },
    {
      id: "tc4",
      type: "sentence-order",
      prompt: "Reorder into a correct sentence: [to / deadline / submitted / the / must be / report / before]",
      answer: "the report must be submitted before the deadline",
      explanation: "Cấu trúc bị động với động từ khuyết thiếu: must be + V3.",
    },
    {
      id: "tc5",
      type: "reading-comprehension",
      passage: "ABC Logistics announced yesterday that it will expand its express shipping service to three new international routes starting next month to meet rising consumer demand.",
      prompt: "What will ABC Logistics do next month?",
      choices: [
        { id: "a", text: "Close new offices" },
        { id: "b", text: "Expand shipping routes" },
        { id: "c", text: "Hire new executives" },
        { id: "d", text: "Reduce service prices" },
      ],
      answer: "b",
      explanation: "Bài đọc nêu rõ: 'expand its express shipping service to three new international routes'.",
    },
    {
      id: "tc6",
      type: "fill-blank",
      prompt: "All employees are required to ____ their security badges at all times inside the facility.",
      answer: "wear",
      explanation: "wear a badge = đeo thẻ nhân viên/an ninh.",
    },
    {
      id: "tc7",
      type: "multiple-choice",
      prompt: "The deadline for ____ the online application form is midnight Friday.",
      choices: [
        { id: "a", text: "submit" },
        { id: "b", text: "submitted" },
        { id: "c", text: "submitting" },
        { id: "d", text: "to submit" },
      ],
      answer: "c",
      explanation: "Sau giới từ 'for', ta dùng danh động từ (V-ing): for submitting.",
    },
    {
      id: "tc8",
      type: "fill-blank",
      prompt: "Please ____ the invoice to the accounting department for immediate processing.",
      answer: "forward",
      explanation: "forward = chuyển tiếp tài liệu/hóa đơn.",
    },
    {
      id: "tc9",
      type: "multiple-choice",
      prompt: "New staff members are ____ to attend the orientation session tomorrow morning.",
      choices: [
        { id: "a", text: "required" },
        { id: "b", text: "requested" },
        { id: "c", text: "supposed" },
        { id: "d", text: "allowed" },
      ],
      answer: "a",
      explanation: "be required to do sth = được yêu cầu / bắt buộc làm gì.",
    },
    {
      id: "tc10",
      type: "speaking-prompt",
      prompt: "Describe your daily working routine or study habits in 30 seconds.",
      answer: "work",
      explanation: "Mẫu câu: Every morning I start work at 8 AM and focus on priority tasks first.",
    },
  ],
  IELTS: [
    {
      id: "ie1",
      type: "multiple-choice",
      prompt: "Which of the following is a synonym for 'substantive' in academic context?",
      choices: [
        { id: "a", text: "Significant" },
        { id: "b", text: "Superficial" },
        { id: "c", text: "Temporary" },
        { id: "d", text: "Trivial" },
      ],
      answer: "a",
      explanation: "substantive = quan trọng, có ý nghĩa lớn (= significant).",
    },
    {
      id: "ie2",
      type: "reading-comprehension",
      passage: "Urbanisation has led to severe habitat fragmentation, forcing wildlife species to adapt rapidly to human-dominated environments or face local extinction.",
      prompt: "What primary consequence of urbanisation is mentioned in the text?",
      choices: [
        { id: "a", text: "Decrease in human population" },
        { id: "b", text: "Habitat fragmentation" },
        { id: "c", text: "Expansion of natural forests" },
        { id: "d", text: "Immediate extinction of all species" },
      ],
      answer: "b",
      explanation: "Tác hại được nêu ngay đầu đoạn: 'Urbanisation has led to severe habitat fragmentation'.",
    },
    {
      id: "ie3",
      type: "fill-blank",
      prompt: "The graph illustrates a significant ____ in renewable energy adoption over the last decade. (sự gia tăng)",
      answer: "increase",
      explanation: "a significant increase = sự gia tăng đáng kể trong bài Writing Task 1.",
    },
    {
      id: "ie4",
      type: "multiple-choice",
      prompt: "Choose the correct phrase to express cause and effect in Task 2 writing:",
      choices: [
        { id: "a", text: "As a consequence of" },
        { id: "b", text: "In spite of" },
        { id: "c", text: "On the other hand" },
        { id: "d", text: "Nevertheless" },
      ],
      answer: "a",
      explanation: "'As a consequence of' = Do kết quả/hậu quả của...",
    },
    {
      id: "ie5",
      type: "speaking-prompt",
      prompt: "IELTS Speaking Part 2: Describe a memorable journey you took recently. (Where, Who with, Why memorable)",
      answer: "trip",
      explanation: "Bố cục trả lời Part 2: Introduction → Context → Key events → Feeling.",
    },
    {
      id: "ie6",
      type: "fill-blank",
      prompt: "Technological advancements have ____ altered the way people communicate globally. (hoàn toàn / sâu sắc)",
      answer: "profoundly",
      explanation: "profoundly altered = làm thay đổi sâu sắc.",
    },
    {
      id: "ie7",
      type: "multiple-choice",
      prompt: "Select the word closest in meaning to 'ubiquitous':",
      choices: [
        { id: "a", text: "Omnipresent / Everywhere" },
        { id: "b", text: "Scarce / Rare" },
        { id: "c", text: "Obsolete" },
        { id: "d", text: "Fragile" },
      ],
      answer: "a",
      explanation: "ubiquitous = phổ biến ở khắp mọi nơi (= omnipresent).",
    },
    {
      id: "ie8",
      type: "sentence-order",
      prompt: "Reorder into an academic sentence: [far-reaching / climate change / consequences / has / global / for / ecosystems]",
      answer: "climate change has far-reaching consequences for global ecosystems",
      explanation: "Cụm 'far-reaching consequences' = hậu quả sâu rộng.",
    },
    {
      id: "ie9",
      type: "fill-blank",
      prompt: "It is widely argued that education plays a ____ role in reducing poverty rates.",
      answer: "pivotal",
      explanation: "pivotal role = vai trò then chốt / cốt lõi.",
    },
    {
      id: "ie10",
      type: "multiple-choice",
      prompt: "Which cohesive device shows contrast between two paragraphs?",
      choices: [
        { id: "a", text: "Conversely" },
        { id: "b", text: "Furthermore" },
        { id: "c", text: "In addition" },
        { id: "d", text: "Consequently" },
      ],
      answer: "a",
      explanation: "Conversely = Ngược lại, dùng thể hiện sự tương phản.",
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
      prompt: "'谢谢' đọc phiên âm Pinyin là gì?",
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
      type: "sentence-order",
      prompt: "Sắp xếp thành câu đúng: [是 / 我 / 中国人]",
      answer: "我是中国人",
      explanation: "Chủ ngữ (我) + Động từ (是) + Tân ngữ (中国人).",
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
      type: "reading-comprehension",
      passage: "我是小明。我每天早上七点起床，八点去学校学习汉语。我非常喜欢汉语。",
      prompt: "小明每天几点去学校？",
      choices: [
        { id: "a", text: "6点" },
        { id: "b", text: "7点" },
        { id: "c", text: "8点" },
        { id: "d", text: "9点" },
      ],
      answer: "c",
      explanation: "Bài đọc ghi: '八点去学校' (8 giờ đi đến trường).",
    },
    {
      id: "h8",
      type: "fill-blank",
      prompt: "她____老师。(là)",
      answer: "是",
      explanation: "是 (shì) = là.",
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
      type: "speaking-prompt",
      prompt: "用中文介绍一下你最喜欢吃的东西。(Hãy dùng tiếng Trung giới thiệu món ăn bạn thích nhất)",
      answer: "喜欢",
      explanation: "Mẫu câu: 我最喜欢吃[Tên món ăn]. 因为它非常好吃。",
    },
  ],
};

// ─── Build prompt for AI ──────────────────────────────────────────────────────
function buildPrompt(
  exam: string,
  level: string,
  format: string,
  mode: "practice" | "real_exam",
  count: number,
  fileUrls: string[]
): string {
  const context =
    fileUrls.length > 0
      ? `THAM KHẢO & TRỘN ĐỀ từ các tệp đề thi / tài liệu thư viện sau của người dùng: ${fileUrls.slice(0, 5).join(", ")}.`
      : "Hãy tự động tạo bộ đề thi chuẩn quốc tế sát với đề thi thật.";

  const modeInstruction =
    mode === "real_exam"
      ? `Đây là BÀI THI THẬT (Real Exam Simulation) của kỳ thi ${exam} (${level}). Số lượng câu yêu cầu là ${count} câu. Đảm bảo cấu trúc tỷ lệ các phần thi (Nghe / Đọc / Từ vựng / Ngữ pháp / Viết) đúng theo chuẩn bài thi thật quốc tế.`
      : `Đây là BÀI ÔN TẬP (Practice Session) cho kỳ thi ${exam} (${level}) với dạng bài ${format}. Số lượng câu hỏi yêu cầu là ${count} câu.`;

  return `Bạn là một giám khảo và chuyên gia soạn đề thi ${exam} quốc tế trình độ cao.
${modeInstruction}
${context}

Hãy tạo đúng ${count} câu hỏi luyện tập.
Trả về kết quả ở dạng JSON thuần túy có dạng:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice" | "fill-blank" | "reading-comprehension" | "sentence-order" | "speaking-prompt",
      "prompt": "Nội dung câu hỏi...",
      "passage": "Đoạn văn đọc hiểu (nếu có)",
      "choices": [{"id": "a", "text": "..."}, {"id": "b", "text": "..."}, {"id": "c", "text": "..."}, {"id": "d", "text": "..."}],
      "answer": "a",
      "explanation": "Giải thích chi tiết bằng tiếng Việt..."
    }
  ]
}

Quy tắc bắt buộc:
1. Nội dung câu hỏi phải hoàn toàn bằng ngôn ngữ thi (${exam === "TOPIK" ? "Tiếng Hàn" : exam === "HSK" ? "Tiếng Trung" : "Tiếng Anh"}), phần giải thích bằng tiếng Việt.
2. Đảm bảo độ khó phù hợp chuẩn xác với cấp độ ${level}.
3. Nếu type là "fill-blank" hoặc "sentence-order", mảng "choices" có thể để rỗng [], "answer" là chuỗi văn bản đáp án đúng.
4. CHỈ trả về JSON thuần túy, không chứa ký tự markdown hay văn bản thừa ngoài JSON.`;
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
      questionCount = 10,
      fileUrls = [],
    } = body as {
      exam: string;
      level: string;
      format?: string;
      mode?: "practice" | "real_exam";
      questionCount?: number;
      fileUrls?: string[];
    };

    if (!exam || !level) {
      return NextResponse.json(
        { error: "Thiếu tham số exam hoặc level." },
        { status: 400 }
      );
    }

    // Giới hạn số câu hợp lý cho request AI (Tối đa 40 câu / batch AI để tránh timeout)
    const targetCount = Math.min(Math.max(questionCount, 5), 40);

    let questions: Question[];

    try {
      // ── Multi-AI Fallback Chain via OpenRouter ─────────────────────────────
      // Gemini 2.5 Flash → DeepSeek R1 → Qwen 72B → Nemotron → Llama 3.3
      const prompt = buildPrompt(exam, level, format, mode, targetCount, fileUrls);
      const result = await createChatCompletion({
        task: "exam_generation",
        messages: [
          {
            role: "system",
            content: `Bạn là giám khảo và chuyên gia soạn đề thi ${exam} quốc tế. CHỈ trả về JSON array/object thuần túy.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      });

      const jsonStr = result.content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed = JSON.parse(jsonStr);
      questions = parsed.questions ?? [];

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("AI không trả về câu hỏi hợp lệ.");
      }

      console.info(
        `[exam-prep] Generated ${questions.length} questions for ${exam} (${level}) mode=${mode} via model: ${result.model}`
      );
    } catch (aiErr) {
      console.warn("[exam-prep] All AI models failed, using fallback samples:", aiErr);
      const key = exam.toUpperCase() as keyof typeof SAMPLES;
      questions = (SAMPLES[key] ?? SAMPLES["TOPIK"]).slice(0, targetCount);
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
      console.warn("Không thể lưu session vào Supabase:", dbErr);
    }

    return NextResponse.json({ sessionId, questions });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Lỗi không xác định.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
