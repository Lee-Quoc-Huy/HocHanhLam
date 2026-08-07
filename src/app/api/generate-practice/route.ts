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
      return text.slice(0, 4000); // return up to 4000 chars per file
    }
  } catch {
    // fallback
  }
  return null;
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
Chế độ: ${mode === "real_exam" ? `THI THẬT CHUẨN KỲ THI (${targetCount} câu hỏi chuẩn)` : `BÀI ÔN TẬP TỰ ĐỘNG (${targetCount} câu hỏi)`}.

DƯỚI ĐÂY LÀ 5 NHÓM TÀI LIỆU & ĐỀ THI ĐÃ TRÍCH XUẤT TỪ THƯ VIỆN NGƯỜI DÙNG:
------------------------------------------------------------------------
${libraryContext}
------------------------------------------------------------------------
${audioGuidance}

YÊU CẦU BIÊN SOẠN THÔNG MINH BẬC CAO:
1. ĐỌC VÀ PHÂN TÍCH TẤT CẢ FILE: Tự động tổng hợp dữ liệu từ 5 Nhóm Thư viện ở trên (1. Đề thi, 2. Đáp án Đọc, 3. Đáp án Nghe, 4. Đáp án Viết, 5. File nghe/Youtube).
2. NẾU CÓ 1 ĐỀ THI: Hãy trích xuất tái lập chuẩn xác toàn bộ bộ đề thi thật đó kèm đáp án và lời giải chi tiết.
3. NẾU CÓ NHIỀU ĐỀ THI: Hãy THÔNG MINH TRỘN (re-mix) các câu hỏi, bài đọc, ngữ pháp từ nhiều bộ đề có sẵn trong Thư viện để tạo ra BỘ ĐỀ THI MỚI 100% độc đáo, không trùng lặp đơn điệu.
4. ĐẢM BẢO ĐỦ SỐ CÂU HỎI: Tạo đúng ${targetCount} câu hỏi (bao gồm các phần Đọc hiểu, Nghe hiểu, Điền từ/Ngữ pháp).

BẮT BUỘC TRẢ VỀ CHUẨN JSON THUẦN TÚY (Không chứa mã markdown \`\`\`json, không có text dư thừa):
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

    const targetCount = mode === "real_exam" ? questionCount : Math.min(Math.max(questionCount, 5), 15);

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
    const generateQuestions = async (): Promise<Question[] | null> => {
      // Step 1: Gemini 2.5 Pro / 3.5 Flash Direct
      const directResult = await callGoogleAIDirect(prompt, {
        maxOutputTokens: 6000,
        temperature: 0.8,
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

        const jsonStr = openrouterRes.content
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

    let questions: Question[] = [];
    const aiResult = await generateQuestions();

    if (aiResult && aiResult.length > 0) {
      questions = aiResult.slice(0, targetCount).map((q, idx) => ({
        ...q,
        id: `q-${idx + 1}-${Date.now()}`,
        audioUrl: q.audioUrl || (extractedAudioUrls[idx % extractedAudioUrls.length] ?? undefined),
      }));
    } else {
      console.warn("[exam-prep] Serving rich fallback questions bank.");
      const key = exam.toUpperCase() as keyof typeof RICH_SAMPLES;
      const baseSamples = RICH_SAMPLES[key] || RICH_SAMPLES.TOPIK || [];
      const shuffled = [...baseSamples].sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, targetCount).map((q, idx) => ({
        ...q,
        id: `gen-${idx + 1}-${Date.now()}`,
        audioUrl: q.audioUrl || (extractedAudioUrls[0] ?? undefined),
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
      // offline session
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
