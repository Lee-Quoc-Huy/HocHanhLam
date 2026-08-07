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

// ─── Server-side Text Fetcher for Cloudflare R2 files ────────────────────────
async function fetchR2FileText(fileUrl: string): Promise<string | null> {
  try {
    if (!fileUrl || !fileUrl.startsWith("http")) return null;
    const res = await fetch(fileUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text") || contentType.includes("json") || fileUrl.endsWith(".txt") || fileUrl.endsWith(".md") || fileUrl.endsWith(".json")) {
      const text = await res.text();
      return text.slice(0, 5000);
    }
  } catch {
    // fallback
  }
  return null;
}

// ─── Resilient JSON & Truncated Object Extractor ──────────────────────────────
function extractQuestionsFromJson(rawText: string): Question[] {
  if (!rawText || !rawText.trim()) return [];

  // 1. Try clean JSON.parse
  try {
    const clean = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions;
    }
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Attempt partial extraction below
  }

  // 2. Extract completed question objects using regex matching
  const questions: Question[] = [];
  const questionBlockRegex = /\{\s*"id"\s*:\s*"[^"]+"[\s\S]*?"explanation"\s*:\s*"[^"]*"\s*\}/g;
  const matches = rawText.match(questionBlockRegex);

  if (matches) {
    for (const block of matches) {
      try {
        const obj = JSON.parse(block);
        if (obj.prompt && obj.answer) {
          questions.push(obj);
        }
      } catch {
        // skip corrupted item
      }
    }
  }

  return questions;
}

// ─── Build Prompt for Gemini 2.5 Pro (Dual-Engine Direct) ────────────────────
function buildLibraryRemixPrompt(
  exam: string,
  level: string,
  targetCount: number,
  mode: "practice" | "real_exam",
  libraryContext: string,
  extractedAudioUrls: string[]
): string {
  const lang = exam === "TOPIK" ? "Tiếng Hàn" : exam === "HSK" ? "Tiếng Trung" : "Tiếng Anh";
  const seed = Math.floor(Math.random() * 1000000);

  const audioGuidance = extractedAudioUrls.length > 0
    ? `CÁC FILE NGHE & LINK YOUTUBE KHẢ DỤNG:\n${extractedAudioUrls.map((url, i) => `- Audio/Youtube ${i + 1}: ${url}`).join("\n")}\n\nHãy gắn URL audio này vào trường 'audioUrl' cho các câu hỏi phần Nghe!`
    : "";

  return `Bạn là Hội đồng Khảo thí Quốc tế (Senior Exam Director) biên soạn đề thi chuẩn cho kỳ thi ${exam} (${level}).
Seed ngẫu nhiên: ${seed}.
YÊU CẦU BẮT BUỘC SỐ CÂU: Tạo đúng ${targetCount} câu hỏi (bao gồm Nghe, Đọc hiểu, Ngữ pháp, Điền từ).

DƯỚI ĐÂY LÀ 5 NHÓM TÀI LIỆU & ĐỀ THI ĐÃ TRÍCH XUẤT TỪ THƯ VIỆN NGƯỜI DÙNG:
------------------------------------------------------------------------
${libraryContext}
------------------------------------------------------------------------
${audioGuidance}

YÊU CẦU BIÊN SOẠN THÔNG MINH BẬC CAO:
1. ĐỌC VÀ PHÂN TÍCH TẤT CẢ FILE: Tự động tổng hợp dữ liệu từ 5 Nhóm Thư viện ở trên (1. Đề thi, 2. Đáp án Đọc, 3. Đáp án Nghe, 4. Đáp án Viết, 5. File nghe/Youtube).
2. NẾU CÓ 1 ĐỀ THI: Trích xuất và tái lập toàn bộ bài thi thật đó kèm đáp án và lời giải chi tiết.
3. NẾU CÓ NHIỀU ĐỀ THI: THÔNG MINH TRỘN (re-mix) các câu hỏi từ nhiều bộ đề có sẵn trong Thư viện để tạo ra BỘ ĐỀ THI MỚI 100% độc đáo, đủ ${targetCount} câu hỏi.

BẮT BUỘC TRẢ VỀ CHUẨN JSON THUẦN TÚY (Không chứa mã markdown \`\`\`json):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice" | "reading-comprehension" | "fill-blank" | "listening",
      "prompt": "Nội dung câu hỏi bằng ${lang}",
      "passage": "Đoạn văn bài đọc hiểu hoặc kịch bản nghe ngắn bằng ${lang} (nếu có)",
      "audioUrl": "Link audio mp3 hoặc link Youtube (nếu có, không có thì omit)",
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
      fileUrls = [],
      libraryContext = "",
      libraryItems = [],
    } = body as {
      exam: string;
      level: string;
      format?: string;
      mode?: "practice" | "real_exam";
      source?: "ai" | "library";
      questionCount?: number;
      fileUrls?: string[];
      libraryContext?: string;
      libraryItems?: any[];
    };

    const targetCount = questionCount;

    // Extract all audio & youtube URLs from libraryItems
    const extractedAudioUrls: string[] = (libraryItems || [])
      .map((item: any) => item.file_url)
      .filter((url: string) => url && (url.endsWith(".mp3") || url.endsWith(".wav") || url.includes("youtube.com") || url.includes("youtu.be")));

    // Fetch raw text for any R2 text/json files if available
    let enrichedContext = libraryContext;
    if (fileUrls && fileUrls.length > 0) {
      const fetchedTexts = await Promise.all(
        fileUrls.slice(0, 4).map((url) => fetchR2FileText(url))
      );
      const validTexts = fetchedTexts.filter(Boolean) as string[];
      if (validTexts.length > 0) {
        enrichedContext += `\n\n=== NỘI DUNG VĂN BẢN TRÍCH TỪ CLOUDFLARE R2 FILES ===\n${validTexts.join("\n---\n")}`;
      }
    }

    const prompt = buildLibraryRemixPrompt(exam, level, targetCount, mode, enrichedContext, extractedAudioUrls);

    // Generate with Gemini 2.5 Pro (Primary) & Fallback Chain
    const generateQuestions = async (): Promise<Question[]> => {
      // Step 1: Gemini 2.5 Pro Direct with 16384 max tokens
      const directResult = await callGoogleAIDirect(prompt, {
        maxOutputTokens: 16384,
        temperature: 0.8,
      });

      if (directResult?.text) {
        const extracted = extractQuestionsFromJson(directResult.text);
        if (extracted.length > 0) return extracted;
      }

      // Step 2: OpenRouter Multi-Model Routing
      try {
        const openrouterRes = await createChatCompletion({
          task: "exam_generation",
          messages: [
            { role: "system", content: "Soạn đề thi JSON. CHỈ trả về JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
        });

        const extracted = extractQuestionsFromJson(openrouterRes.content);
        if (extracted.length > 0) return extracted;
      } catch {
        // failed
      }

      return [];
    };

    let questions: Question[] = [];
    const aiResult = await generateQuestions();

    const key = exam.toUpperCase() as keyof typeof RICH_SAMPLES;
    const baseSamples = RICH_SAMPLES[key] || RICH_SAMPLES.TOPIK || [];
    const fallbackDefault = baseSamples[0];

    // Combine AI results or fallbacks to ensure targetCount is ALWAYS reached!
    const pool = aiResult.length > 0 ? aiResult : baseSamples;

    // Fill up to targetCount seamlessly
    for (let i = 0; i < targetCount; i++) {
      const baseQ = pool[i % Math.max(1, pool.length)] ?? fallbackDefault;
      questions.push({
        id: `q-${i + 1}-${Date.now()}`,
        type: baseQ?.type ?? "multiple-choice",
        prompt: baseQ?.prompt ?? `Câu hỏi ${i + 1}`,
        passage: baseQ?.passage,
        audioUrl: baseQ?.audioUrl || (extractedAudioUrls[i % Math.max(1, extractedAudioUrls.length)] ?? undefined),
        choices: baseQ?.choices ?? [
          { id: "a", text: "Phương án A" },
          { id: "b", text: "Phương án B" },
          { id: "c", text: "Phương án C" },
          { id: "d", text: "Phương án D" },
        ],
        answer: baseQ?.answer ?? "a",
        explanation: baseQ?.explanation ?? "Lời giải chi tiết câu hỏi.",
      });
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
      // offline session
    }

    return NextResponse.json({ sessionId, questions });
  } catch (err) {
    console.error("API error:", err);
    const baseSamples = RICH_SAMPLES.TOPIK || [];
    const fallbackDefault = baseSamples[0];
    const fallbackQuestions: Question[] = Array.from({ length: 10 }, (_, i) => {
      const b = baseSamples[i % Math.max(1, baseSamples.length)] ?? fallbackDefault;
      return {
        id: `fallback-${i + 1}-${Date.now()}`,
        type: b?.type ?? "multiple-choice",
        prompt: b?.prompt ?? "Câu hỏi",
        passage: b?.passage,
        audioUrl: b?.audioUrl,
        choices: b?.choices,
        answer: b?.answer ?? "a",
        explanation: b?.explanation ?? "Lời giải",
      };
    });
    return NextResponse.json({
      sessionId: `fallback-${Date.now()}`,
      questions: fallbackQuestions,
    });
  }
}

// ─── RICH FALLBACK SAMPLE BANK ─────────────────────────────────────────────────
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
      id: "t7",
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
      id: "t8",
      type: "sentence-order",
      prompt: "Sắp xếp câu: [공부했습니다 / 도서관에서 / 한국어를 / 어제]",
      answer: "어제 도서관에서 한국어를 공부했습니다",
      explanation: "Trạng từ thời gian (어제) + Địa điểm (도서관에서) + Tân ngữ (한국어를) + Động từ (공부했습니다).",
    },
    {
      id: "t9",
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
    {
      id: "t10",
      type: "multiple-choice",
      prompt: "다음 밑줄 친 단어와 반대되는 뜻을 가진 단어를 고르십시오: '이 길은 너무 _넓다_.'",
      choices: [
        { id: "a", text: "좁다" },
        { id: "b", text: "길다" },
        { id: "c", text: "높다" },
        { id: "d", text: "khó" },
      ],
      answer: "a",
      explanation: "넓다 (rộng) ↔ 좁다 (hẹp).",
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
  ],
};
