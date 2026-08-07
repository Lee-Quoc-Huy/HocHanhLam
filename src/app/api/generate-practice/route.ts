import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callGoogleAIDirect } from "@/config/ai-models";
import { createChatCompletion } from "@/lib/ai/openrouter-client";

export const maxDuration = 60;

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType =
  | "multiple-choice"
  | "reading-comprehension"
  | "fill-blank"
  | "sentence-order"
  | "speaking-prompt"
  | "listening"
  | "writing";

interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  passage?: string;
  audioUrl?: string;
  choices?: { id: string; text: string }[];
  answer: string;
  explanation: string;
  section?: string; // e.g. "Nghe", "Đọc", "Viết"
}

interface SectionConfig {
  label: string;        // Display name e.g. "Phần 1: Nghe Hiểu"
  sectionKey: string;   // Short key e.g. "Nghe"
  type: QuestionType;   // Dominant question type for this section
  count: number;        // Exact number of questions
}

// ─── EXAM SECTIONS CONFIG ─────────────────────────────────────────────────────
// Defines the EXACT structure of every real exam.
// This is the single source of truth for question counts & types.
const EXAM_SECTIONS: Record<string, Record<string, SectionConfig[]>> = {
  TOPIK: {
    "TOPIK I - Cấp 1": [
      { label: "Phần 1: Nghe Hiểu (듣기)", sectionKey: "Nghe", type: "listening", count: 30 },
      { label: "Phần 2: Đọc Hiểu (읽기)", sectionKey: "Đọc", type: "reading-comprehension", count: 40 },
    ],
    "TOPIK I - Cấp 2": [
      { label: "Phần 1: Nghe Hiểu (듣기)", sectionKey: "Nghe", type: "listening", count: 30 },
      { label: "Phần 2: Đọc Hiểu (읽기)", sectionKey: "Đọc", type: "reading-comprehension", count: 40 },
    ],
    "TOPIK II - Cấp 3": [
      { label: "Phần 1: Nghe Hiểu (듣기)", sectionKey: "Nghe", type: "listening", count: 50 },
      { label: "Phần 2: Viết (쓰기)", sectionKey: "Viết", type: "writing", count: 4 },
      { label: "Phần 3: Đọc Hiểu (읽기)", sectionKey: "Đọc", type: "reading-comprehension", count: 50 },
    ],
    "TOPIK II - Cấp 4": [
      { label: "Phần 1: Nghe Hiểu (듣기)", sectionKey: "Nghe", type: "listening", count: 50 },
      { label: "Phần 2: Viết (쓰기)", sectionKey: "Viết", type: "writing", count: 4 },
      { label: "Phần 3: Đọc Hiểu (읽기)", sectionKey: "Đọc", type: "reading-comprehension", count: 50 },
    ],
    "TOPIK II - Cấp 5": [
      { label: "Phần 1: Nghe Hiểu (듣기)", sectionKey: "Nghe", type: "listening", count: 50 },
      { label: "Phần 2: Viết (쓰기)", sectionKey: "Viết", type: "writing", count: 4 },
      { label: "Phần 3: Đọc Hiểu (읽기)", sectionKey: "Đọc", type: "reading-comprehension", count: 50 },
    ],
    "TOPIK II - Cấp 6": [
      { label: "Phần 1: Nghe Hiểu (듣기)", sectionKey: "Nghe", type: "listening", count: 50 },
      { label: "Phần 2: Viết (쓰기)", sectionKey: "Viết", type: "writing", count: 4 },
      { label: "Phần 3: Đọc Hiểu (읽기)", sectionKey: "Đọc", type: "reading-comprehension", count: 50 },
    ],
    "TOPIK Speaking": [
      { label: "Phần Nói (말하기)", sectionKey: "Nói", type: "speaking-prompt", count: 6 },
    ],
  },
  TOEIC: {
    "Target 250 - 400": [
      { label: "Part 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 100 },
      { label: "Part 5-7: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 100 },
    ],
    "Target 405 - 600": [
      { label: "Part 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 100 },
      { label: "Part 5-7: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 100 },
    ],
    "Target 605 - 780": [
      { label: "Part 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 100 },
      { label: "Part 5-7: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 100 },
    ],
    "Target 785 - 900": [
      { label: "Part 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 100 },
      { label: "Part 5-7: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 100 },
    ],
    "Target 905 - 990": [
      { label: "Part 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 100 },
      { label: "Part 5-7: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 100 },
    ],
    "TOEIC Speaking & Writing": [
      { label: "Speaking (11 câu Nói)", sectionKey: "Speaking", type: "speaking-prompt", count: 11 },
      { label: "Writing (8 câu Viết)", sectionKey: "Writing", type: "writing", count: 8 },
    ],
  },
  IELTS: {
    "Band 4.0 - 4.5": [
      { label: "Section 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 40 },
      { label: "Passage 1-3: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 40 },
      { label: "Task 1 & 2: Writing (Viết)", sectionKey: "Writing", type: "writing", count: 2 },
    ],
    "Band 5.0 - 5.5": [
      { label: "Section 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 40 },
      { label: "Passage 1-3: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 40 },
      { label: "Task 1 & 2: Writing (Viết)", sectionKey: "Writing", type: "writing", count: 2 },
    ],
    "Band 6.0 - 6.5": [
      { label: "Section 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 40 },
      { label: "Passage 1-3: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 40 },
      { label: "Task 1 & 2: Writing (Viết)", sectionKey: "Writing", type: "writing", count: 2 },
    ],
    "Band 7.0 - 7.5": [
      { label: "Section 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 40 },
      { label: "Passage 1-3: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 40 },
      { label: "Task 1 & 2: Writing (Viết)", sectionKey: "Writing", type: "writing", count: 2 },
    ],
    "Band 8.0 - 9.0": [
      { label: "Section 1-4: Listening (Nghe)", sectionKey: "Listening", type: "listening", count: 40 },
      { label: "Passage 1-3: Reading (Đọc)", sectionKey: "Reading", type: "reading-comprehension", count: 40 },
      { label: "Task 1 & 2: Writing (Viết)", sectionKey: "Writing", type: "writing", count: 2 },
    ],
  },
  HSK: {
    "HSK 1": [
      { label: "一、听力 (Nghe hiểu)", sectionKey: "Nghe", type: "listening", count: 20 },
      { label: "二、阅读 (Đọc hiểu)", sectionKey: "Đọc", type: "reading-comprehension", count: 20 },
    ],
    "HSK 2": [
      { label: "一、听力 (Nghe hiểu)", sectionKey: "Nghe", type: "listening", count: 35 },
      { label: "二、阅读 (Đọc hiểu)", sectionKey: "Đọc", type: "reading-comprehension", count: 25 },
    ],
    "HSK 3": [
      { label: "一、听力 (Nghe hiểu)", sectionKey: "Nghe", type: "listening", count: 40 },
      { label: "二、阅读 (Đọc hiểu)", sectionKey: "Đọc", type: "reading-comprehension", count: 30 },
      { label: "三、书写 (Viết)", sectionKey: "Viết", type: "writing", count: 10 },
    ],
    "HSK 4": [
      { label: "一、听力 (Nghe hiểu)", sectionKey: "Nghe", type: "listening", count: 45 },
      { label: "二、阅读 (Đọc hiểu)", sectionKey: "Đọc", type: "reading-comprehension", count: 40 },
      { label: "三、书写 (Viết)", sectionKey: "Viết", type: "writing", count: 15 },
    ],
    "HSK 5": [
      { label: "一、听力 (Nghe hiểu)", sectionKey: "Nghe", type: "listening", count: 45 },
      { label: "二、阅读 (Đọc hiểu)", sectionKey: "Đọc", type: "reading-comprehension", count: 45 },
      { label: "三、书写 (Viết)", sectionKey: "Viết", type: "writing", count: 10 },
    ],
    "HSK 6": [
      { label: "一、听力 (Nghe hiểu)", sectionKey: "Nghe", type: "listening", count: 50 },
      { label: "二、阅读 (Đọc hiểu)", sectionKey: "Đọc", type: "reading-comprehension", count: 50 },
      { label: "三、书写 (Viết)", sectionKey: "Viết", type: "writing", count: 1 },
    ],
    "HSK 7-9": [
      { label: "一、听力 (Nghe hiểu)", sectionKey: "Nghe", type: "listening", count: 30 },
      { label: "二、阅读 (Đọc hiểu)", sectionKey: "Đọc", type: "reading-comprehension", count: 38 },
      { label: "三、书写 (Viết)", sectionKey: "Viết", type: "writing", count: 20 },
      { label: "四、翻译 (Dịch)", sectionKey: "Dịch", type: "fill-blank", count: 10 },
    ],
    "HSKK Sơ Cấp": [
      { label: "口语 (Nói)", sectionKey: "Nói", type: "speaking-prompt", count: 27 },
    ],
    "HSKK Trung Cấp": [
      { label: "口语 (Nói)", sectionKey: "Nói", type: "speaking-prompt", count: 14 },
    ],
    "HSKK Cao Cấp": [
      { label: "口语 (Nói)", sectionKey: "Nói", type: "speaking-prompt", count: 6 },
    ],
  },
};

// ─── Helper: Get sections for this exam/level ─────────────────────────────────
function getSections(exam: string, level: string): SectionConfig[] {
  const examKey = exam.toUpperCase();
  const sections = EXAM_SECTIONS[examKey]?.[level];
  if (sections && sections.length > 0) return sections;

  // Fuzzy match level key
  const examSections = EXAM_SECTIONS[examKey];
  if (examSections) {
    const keys = Object.keys(examSections);
    const fuzzyKey = keys.find(
      (k) => k.toLowerCase().includes(level.toLowerCase()) || level.toLowerCase().includes(k.toLowerCase())
    );
    if (fuzzyKey && examSections[fuzzyKey]) return examSections[fuzzyKey]!;
    // Return first level as fallback
    const firstKey = keys[0];
    if (firstKey && examSections[firstKey]) return examSections[firstKey]!;
  }

  // Ultimate fallback: generic 10-question exam
  return [
    { label: "Đề Thi Tổng Hợp", sectionKey: "Tổng hợp", type: "multiple-choice", count: 10 },
  ];
}

// ─── Server-side Text Fetcher for Cloudflare R2 files ────────────────────────
async function fetchR2FileText(fileUrl: string): Promise<string | null> {
  try {
    if (!fileUrl || !fileUrl.startsWith("http")) return null;
    const res = await fetch(fileUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (
      contentType.includes("text") ||
      contentType.includes("json") ||
      fileUrl.endsWith(".txt") ||
      fileUrl.endsWith(".md") ||
      fileUrl.endsWith(".json")
    ) {
      const text = await res.text();
      return text.slice(0, 4000);
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
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) return parsed.questions;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Attempt partial extraction below
  }

  // 2. Extract completed question objects using regex matching
  const questions: Question[] = [];
  // Match objects that have at least id, prompt, answer
  const questionBlockRegex =
    /\{\s*"id"\s*:\s*"[^"]+"\s*,[\s\S]*?"answer"\s*:\s*"[^"]*"[\s\S]*?\}/g;
  const matches = rawText.match(questionBlockRegex);

  if (matches) {
    for (const block of matches) {
      try {
        // Try to close truncated objects by adding missing braces
        let candidate = block;
        const openBraces = (candidate.match(/\{/g) || []).length;
        const closeBraces = (candidate.match(/\}/g) || []).length;
        for (let i = 0; i < openBraces - closeBraces; i++) candidate += "}";

        const obj = JSON.parse(candidate);
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

// ─── Build Section Prompt ─────────────────────────────────────────────────────
function buildSectionPrompt(
  exam: string,
  level: string,
  section: SectionConfig,
  sectionIndex: number,
  totalSections: number,
  libraryContext: string,
  audioUrls: string[],
  startId: number
): string {
  const lang =
    exam === "TOPIK" ? "Tiếng Hàn (한국어)" : exam === "HSK" ? "Tiếng Trung (中文)" : "Tiếng Anh";
  const seed = Math.floor(Math.random() * 999999);

  const audioGuidance =
    section.type === "listening" && audioUrls.length > 0
      ? `\nFILE NGHE / YOUTUBE KHẢ DỤNG:\n${audioUrls.map((u, i) => `- Audio ${i + 1}: ${u}`).join("\n")}\nGắn các URL này vào trường "audioUrl" cho câu hỏi nghe tương ứng!\n`
      : "";

  const typeInstructions: Record<QuestionType, string> = {
    "listening": `Tạo ${section.count} câu hỏi NGHE HIỂU (type: "listening").
- Mỗi câu có passage mô tả tình huống/hội thoại ngắn bằng ${lang}.
- Câu hỏi hỏi về nội dung nghe.
- Có 4 đáp án trắc nghiệm (a,b,c,d).
- Gắn audioUrl nếu có file nghe.`,
    "reading-comprehension": `Tạo ${section.count} câu hỏi ĐỌC HIỂU (type: "reading-comprehension").
- Chia thành các nhóm bài đọc, mỗi nhóm có 1 đoạn văn passage bằng ${lang} + 2-5 câu hỏi về đoạn đó.
- Có 4 đáp án trắc nghiệm (a,b,c,d).`,
    "writing": `Tạo ${section.count} câu hỏi VIẾT (type: "writing").
- Đây là bài viết luận/short essay/task.
- prompt mô tả rõ yêu cầu đề bài.
- answer là đáp án mẫu/model answer chi tiết bằng ${lang}.
- choices: null (không có trắc nghiệm).`,
    "speaking-prompt": `Tạo ${section.count} câu hỏi NÓI (type: "speaking-prompt").
- prompt là đề bài nói rõ ràng bằng ${lang}.
- answer là gợi ý câu trả lời mẫu.`,
    "fill-blank": `Tạo ${section.count} câu hỏi ĐIỀN TỪ (type: "fill-blank").
- Câu có chỗ trống ___ cần điền.
- answer là từ/cụm từ đúng.`,
    "sentence-order": `Tạo ${section.count} câu hỏi SẮP XẾP (type: "sentence-order").
- Cung cấp các từ xáo trộn.
- answer là câu đúng.`,
    "multiple-choice": `Tạo ${section.count} câu hỏi TRẮC NGHIỆM (type: "multiple-choice").
- Có 4 đáp án (a,b,c,d).`,
  };

  return `Bạn là Hội Đồng Khảo Thí ${exam} chính thức. Seed: ${seed}.
Kỳ thi: ${exam} ${level}
Phần thi ${sectionIndex + 1}/${totalSections}: ${section.label}

${typeInstructions[section.type]}

${audioGuidance}

TÀI LIỆU THƯ VIỆN (Đọc kỹ để trích xuất câu hỏi & đáp án. Lưu ý: Tệp đáp án có thể tách riêng Đọc/Nghe HOẶC GỘP CHUNG Đọc + Nghe trong cùng 1 file, hãy đọc kỹ nội dung để lấy đúng đáp án cho phần này):
---
${libraryContext.slice(0, 7000)}
---

YÊU CẦU BẮT BUỘC: Tạo ĐÚNG ${section.count} câu. Không hơn, không kém.
Nếu thư viện có sẵn câu hỏi, ưu tiên sử dụng/tái tạo câu đó.
Nếu không đủ, AI tự soạn thêm đúng định dạng kỳ thi ${exam} thật sự.

BẮT BUỘC TRẢ VỀ JSON THUẦN TÚY (không markdown, không giải thích):
{
  "questions": [
    {
      "id": "s${sectionIndex + 1}_q${startId}",
      "type": "${section.type}",
      "section": "${section.sectionKey}",
      "prompt": "Nội dung câu hỏi bằng ${lang}",
      "passage": "Đoạn văn/kịch bản (nếu có, null nếu không)",
      "audioUrl": "URL mp3 hoặc youtube (chỉ cho phần nghe, null nếu không)",
      "choices": [
        {"id": "a", "text": "Phương án A"},
        {"id": "b", "text": "Phương án B"},
        {"id": "c", "text": "Phương án C"},
        {"id": "d", "text": "Phương án D"}
      ],
      "answer": "a",
      "explanation": "Lời giải chi tiết bằng Tiếng Việt."
    }
  ]
}`;
}

// ─── Generate One Section ─────────────────────────────────────────────────────
async function generateSection(prompt: string): Promise<Question[]> {
  // Primary: Dedicated 2 strongest Google AI Studio Models (Gemini 2.5 Pro & Gemini 2.0 Flash)
  try {
    const directResult = await callGoogleAIDirect(prompt, {
      maxOutputTokens: 8192,
      temperature: 0.75,
      modelsToTry: [
        GOOGLE_AI_STUDIO_MODELS.exam_primary,
        GOOGLE_AI_STUDIO_MODELS.exam_secondary,
      ],
    });
    if (directResult?.text) {
      const extracted = extractQuestionsFromJson(directResult.text);
      if (extracted.length > 0) return extracted;
    }
  } catch {
    // fall through
  }

  // Fallback: OpenRouter
  try {
    const orRes = await createChatCompletion({
      task: "exam_generation",
      messages: [
        { role: "system", content: "Soạn đề thi JSON. CHỈ trả về JSON thuần túy." },
        { role: "user", content: prompt },
      ],
      temperature: 0.75,
    });
    const extracted = extractQuestionsFromJson(orRes.content);
    if (extracted.length > 0) return extracted;
  } catch {
    // fall through
  }

  return [];
}

// ─── Build Rich Fallback for a Section ───────────────────────────────────────
function buildFallbackForSection(
  section: SectionConfig,
  exam: string,
  startId: number
): Question[] {
  const lang =
    exam === "TOPIK" ? "한국어" : exam === "HSK" ? "中文" : "English";

  const fallbacks: Partial<Record<QuestionType, Omit<Question, "id" | "section">>> = {
    "listening": {
      type: "listening",
      prompt: `[${section.sectionKey}] Nghe đoạn hội thoại và chọn đáp án đúng.`,
      passage: `두 사람이 이야기하고 있습니다. / Two people are talking. / 两个人在交谈。`,
      choices: [
        { id: "a", text: `Phương án A (${lang})` },
        { id: "b", text: `Phương án B (${lang})` },
        { id: "c", text: `Phương án C (${lang})` },
        { id: "d", text: `Phương án D (${lang})` },
      ],
      answer: "b",
      explanation: `Đây là câu hỏi phần nghe ${section.label}. Nghe kỹ đoạn hội thoại và xác định thông tin cần thiết.`,
    },
    "reading-comprehension": {
      type: "reading-comprehension",
      prompt: `[${section.sectionKey}] Đọc đoạn văn sau và trả lời câu hỏi.`,
      passage: `(${lang} reading passage ${startId}) Đây là đoạn văn bài đọc hiểu. Nội dung đề cập đến chủ đề học thuật trong kỳ thi.`,
      choices: [
        { id: "a", text: `Phương án A` },
        { id: "b", text: `Phương án B` },
        { id: "c", text: `Phương án C` },
        { id: "d", text: `Phương án D` },
      ],
      answer: "a",
      explanation: `Câu hỏi đọc hiểu ${section.label}. Đọc kỹ đoạn văn và xác định ý chính.`,
    },
    "writing": {
      type: "writing",
      prompt: `[${section.sectionKey}] Viết một đoạn văn (150-300 chữ) về chủ đề sau theo yêu cầu kỳ thi ${exam}.`,
      answer: `Bài viết mẫu: Đây là câu trả lời mẫu cho phần viết của kỳ thi ${exam}. Cần triển khai ý tưởng rõ ràng, logic và đúng ngữ pháp.`,
      explanation: `Phần viết ${section.label}: Chú ý cấu trúc bài, ngữ pháp và từ vựng phù hợp cấp độ.`,
    },
    "speaking-prompt": {
      type: "speaking-prompt",
      prompt: `[${section.sectionKey}] Nói về chủ đề sau trong 30-60 giây.`,
      answer: `Gợi ý trả lời: Trình bày ý kiến cá nhân rõ ràng, sử dụng từ vựng đa dạng và cấu trúc câu phong phú.`,
      explanation: `Phần nói ${section.label}: Phát âm rõ, nhịp điệu tự nhiên, nội dung logic.`,
    },
    "fill-blank": {
      type: "fill-blank",
      prompt: `[${section.sectionKey}] Điền từ thích hợp vào chỗ trống: "_____ là từ cần điền."`,
      answer: `từ đúng`,
      explanation: `Câu điền từ ${section.label}: Xem xét ngữ cảnh câu để chọn đúng từ/cụm từ.`,
    },
  };

  const template = fallbacks[section.type] ?? fallbacks["reading-comprehension"]!;

  return Array.from({ length: section.count }, (_, i) => ({
    ...template,
    id: `s_fallback_q${startId + i}`,
    section: section.sectionKey,
    prompt: `${template.prompt} (Câu ${startId + i})`,
  } as Question));
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

    // Fetch additional R2 text content
    let enrichedContext = libraryContext;
    if (fileUrls && fileUrls.length > 0) {
      const fetchedTexts = await Promise.all(
        fileUrls.slice(0, 4).map((url) => fetchR2FileText(url))
      );
      const validTexts = fetchedTexts.filter(Boolean) as string[];
      if (validTexts.length > 0) {
        enrichedContext += `\n\n=== NỘI DUNG FILE THƯ VIỆN ===\n${validTexts.join("\n---\n")}`;
      }
    }

    // Extract all audio & youtube URLs
    const extractedAudioUrls: string[] = (libraryItems || [])
      .map((item: any) => item.file_url)
      .filter(
        (url: string) =>
          url &&
          (url.endsWith(".mp3") ||
            url.endsWith(".wav") ||
            url.includes("youtube.com") ||
            url.includes("youtu.be"))
      );

    // ─── DETERMINE SECTIONS ────────────────────────────────────────────────────
    let sections: SectionConfig[];

    if (mode === "real_exam") {
      // Real exam: use exact section config
      sections = getSections(exam, level);
    } else {
      // Practice mode: create a single section with the requested count
      // Determine best type from format
      const formatToType: Record<string, QuestionType> = {
        listening: "listening",
        reading: "reading-comprehension",
        writing: "writing",
        speaking: "speaking-prompt",
        "vocab-grammar": "multiple-choice",
        all: "multiple-choice",
      };
      sections = [
        {
          label: "Bài Ôn Tập Tổng Hợp",
          sectionKey: "Ôn tập",
          type: formatToType[format] ?? "multiple-choice",
          count: questionCount,
        },
      ];
    }

    // ─── GENERATE EACH SECTION ─────────────────────────────────────────────────
    const allQuestions: Question[] = [];
    let globalId = 1;

    for (let si = 0; si < sections.length; si++) {
      const section = sections[si];
      if (!section) continue;

      const sectionPrompt = buildSectionPrompt(
        exam,
        level,
        section,
        si,
        sections.length,
        enrichedContext,
        extractedAudioUrls,
        globalId
      );

      const generated = await generateSection(sectionPrompt);

      // Ensure we have EXACTLY section.count questions
      let sectionQuestions: Question[];

      if (generated.length >= section.count) {
        // AI gave enough — take exactly the right count
        sectionQuestions = generated.slice(0, section.count);
      } else if (generated.length > 0) {
        // AI gave some — fill remainder with fallbacks
        const needed = section.count - generated.length;
        const fallback = buildFallbackForSection(section, exam, globalId + generated.length);
        sectionQuestions = [...generated, ...fallback.slice(0, needed)];
      } else {
        // AI gave nothing — use full fallbacks
        sectionQuestions = buildFallbackForSection(section, exam, globalId);
      }

      // Re-index IDs to be globally unique and sequential
      sectionQuestions = sectionQuestions.map((q, idx) => ({
        ...q,
        id: `s${si + 1}_q${globalId + idx}`,
        section: q.section ?? section.sectionKey,
        // Assign audio URL from library pool to listening questions without one
        audioUrl:
          q.audioUrl ||
          (section.type === "listening" && extractedAudioUrls.length > 0
            ? extractedAudioUrls[(globalId + idx - 1) % extractedAudioUrls.length]
            : undefined),
      }));

      allQuestions.push(...sectionQuestions);
      globalId += section.count;
    }

    // ─── SAVE SESSION ──────────────────────────────────────────────────────────
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
            total_questions: allQuestions.length,
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

    return NextResponse.json({
      sessionId,
      questions: allQuestions,
      sections: sections.map((s) => ({
        label: s.label,
        sectionKey: s.sectionKey,
        count: s.count,
        type: s.type,
      })),
      totalQuestions: allQuestions.length,
    });
  } catch (err) {
    console.error("generate-practice API error:", err);

    // Emergency fallback: return a minimal valid exam
    const fallbackSections = getSections("TOPIK", "TOPIK I - Cấp 1");
    const fallbackQuestions: Question[] = fallbackSections.flatMap((s, si) =>
      buildFallbackForSection(s, "TOPIK", si * 10 + 1)
    );

    return NextResponse.json({
      sessionId: `fallback-${Date.now()}`,
      questions: fallbackQuestions,
      sections: fallbackSections,
      totalQuestions: fallbackQuestions.length,
      error: "Hệ thống đang bận, đề dự phòng đã được tải.",
    });
  }
}
