/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║            LINGUAVERSE AI — 8-MODEL MULTI-AI ROUTING CONFIG             ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  2 Google AI Studio (Direct API)  +  6 OpenRouter Model Routing         ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  GOOGLE AI STUDIO DIRECT (Kênh 1 — Ưu tiên cao nhất, không phí GW)     ║
 * ║   1. gemini-2.5-flash   → Thi thật, Sinh đề, AI Tutor realtime         ║
 * ║   2. gemini-2.0-flash   → Flashcard generation, OCR nhanh, Fallback    ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  OPENROUTER MODEL ROUTING (Kênh 2 — Luân phiên khi Direct bị quá tải)  ║
 * ║   3. google/gemini-2.5-flash     → Chat tutor, exam_generation primary  ║
 * ║   4. deepseek/deepseek-r1        → Giải thích ngữ pháp, lý luận sâu    ║
 * ║   5. qwen/qwen-2.5-72b           → Sinh flashcard, game, lookup nhanh  ║
 * ║   6. nvidia/nemotron-ultra-550b  → Exam generation heavy tasks          ║
 * ║   7. meta-llama/llama-3.3-70b   → AI Tutor conversation fallback       ║
 * ║   8. google/gemma-4-26b          → Fast completion, micro-tasks         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ── 2 Google AI Studio Direct Models ─────────────────────────────────────────
export const GOOGLE_AI_STUDIO_MODELS = {
  /** Primary — Gemini 2.5 Flash: Tạo đề thi, AI Tutor, phân tích dài */
  primary: "gemini-2.5-flash",
  /** Secondary — Gemini 2.0 Flash: Flashcard, OCR, completion nhanh */
  secondary: "gemini-2.0-flash",
} as const;

// ── 6 OpenRouter Models (Phân công theo nhiệm vụ) ────────────────────────────
export const OPENROUTER_MODELS = {
  /** #3 — Gemini 2.5 Flash via OpenRouter: fallback chat_tutor & exam */
  gemini_flash:   "google/gemini-2.5-flash",
  /** #4 — DeepSeek R1: Giải thích ngữ pháp, reasoning sâu, exam scoring */
  deepseek_r1:    "deepseek/deepseek-r1",
  /** #5 — Qwen 2.5 72B: Sinh flashcard ngôn ngữ, game engine, JSON fast */
  qwen_72b:       "qwen/qwen-2.5-72b-instruct",
  /** #6 — Nvidia Nemotron: Heavy exam generation, phân tích đề thi phức tạp */
  nemotron:       "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
  /** #7 — Llama 3.3 70B: AI Tutor conversation fallback, general Q&A */
  llama_33:       "meta-llama/llama-3.3-70b-instruct:free",
  /** #8 — Gemma 26B: Fast micro-tasks, quick hints, tag suggestions */
  gemma_26b:      "google/gemma-4-26b-a4b-it:free",
} as const;

// ── Task Types ────────────────────────────────────────────────────────────────
export type AiTaskType =
  | "chat_tutor"       // AI Tutor: conversational language practice
  | "reasoning"        // Ngữ pháp: deep grammar explain & answer reasoning
  | "fast_completion"  // Nhanh: flashcard hints, tag suggestions, quick fills
  | "vision_ocr"       // OCR: Gemini Vision document/image extraction
  | "embedding"        // Semantic search / SRS pgvector similarity
  | "exam_generation"  // Sinh đề: TOPIK / TOEIC / IELTS / HSK questions
  | "game_engine"      // Game: quiz/listening/spelling question generation
  | "flashcard_gen";   // Flashcard: auto-generate from text/document

export interface AiModelRoute {
  task: AiTaskType;
  provider: "google" | "deepseek" | "qwen" | "openai" | "nvidia" | "meta" | "mistral";
  model: string;
  /** Ordered list of fallback model IDs (OpenRouter format) */
  fallbackModels?: string[];
  maxOutputTokens: number;
  /** Whether to try Google AI Studio Direct API first before OpenRouter */
  preferDirect?: boolean;
}

// ── Routing Table: 8 AI phân công theo nhiệm vụ ──────────────────────────────
export const AI_MODEL_ROUTES: Record<AiTaskType, AiModelRoute> = {

  // ── AI Tutor Chat ──────────────────────────────────────────────────────────
  // Primary: Gemini 2.5 Flash (Direct) → Gemini 2.5 Flash (OR) → Llama 3.3
  chat_tutor: {
    task: "chat_tutor",
    provider: "google",
    model: OPENROUTER_MODELS.gemini_flash,
    fallbackModels: [
      OPENROUTER_MODELS.llama_33,
      OPENROUTER_MODELS.qwen_72b,
    ],
    maxOutputTokens: 2048,
    preferDirect: true, // Try Gemini 2.5 Flash Direct first
  },

  // ── Giải Thích Ngữ Pháp & Reasoning ───────────────────────────────────────
  // Primary: DeepSeek R1 (reasoning specialist) → Gemini 2.5 Flash fallback
  reasoning: {
    task: "reasoning",
    provider: "deepseek",
    model: OPENROUTER_MODELS.deepseek_r1,
    fallbackModels: [
      OPENROUTER_MODELS.gemini_flash,
      OPENROUTER_MODELS.llama_33,
    ],
    maxOutputTokens: 4096,
    preferDirect: false,
  },

  // ── Fast Completion (Gợi ý nhanh, Tag, Micro-tasks) ───────────────────────
  // Primary: Gemini 2.0 Flash (Direct) → Gemma 26B → Qwen 72B
  fast_completion: {
    task: "fast_completion",
    provider: "google",
    model: OPENROUTER_MODELS.gemma_26b,
    fallbackModels: [
      OPENROUTER_MODELS.qwen_72b,
      OPENROUTER_MODELS.llama_33,
    ],
    maxOutputTokens: 512,
    preferDirect: true, // Try Gemini 2.0 Flash Direct (secondary model)
  },

  // ── OCR & Vision Processing ────────────────────────────────────────────────
  // Primary: Gemini 2.5 Flash Direct (multimodal) → Gemini 2.0 Flash Direct
  vision_ocr: {
    task: "vision_ocr",
    provider: "google",
    model: "google/gemini-2.5-flash",
    fallbackModels: ["google/gemini-2.0-flash"],
    maxOutputTokens: 4096,
    preferDirect: true,
  },

  // ── Semantic Embedding ─────────────────────────────────────────────────────
  embedding: {
    task: "embedding",
    provider: "openai",
    model: process.env.AI_MODEL_EMBEDDING ?? "text-embedding-3-large",
    maxOutputTokens: 0,
    preferDirect: false,
  },

  // ── Sinh Đề Thi Thật (Exam Generation) ────────────────────────────────────
  // Dual Gateway: Gemini 2.5 Flash Direct → OpenRouter (6-model chain)
  exam_generation: {
    task: "exam_generation",
    provider: "google",
    model: OPENROUTER_MODELS.gemini_flash,
    fallbackModels: [
      OPENROUTER_MODELS.deepseek_r1,
      OPENROUTER_MODELS.qwen_72b,
      OPENROUTER_MODELS.nemotron,
      OPENROUTER_MODELS.llama_33,
      OPENROUTER_MODELS.gemma_26b,
    ],
    maxOutputTokens: 4096,
    preferDirect: true, // Gemini 2.5 Flash Direct → then chain above
  },

  // ── Game Engine (Quiz / Listening / Spelling) ─────────────────────────────
  // Primary: Qwen 72B (fast JSON generation) → Llama 3.3 → Gemma 26B
  game_engine: {
    task: "game_engine",
    provider: "qwen",
    model: OPENROUTER_MODELS.qwen_72b,
    fallbackModels: [
      OPENROUTER_MODELS.llama_33,
      OPENROUTER_MODELS.gemma_26b,
      OPENROUTER_MODELS.gemini_flash,
    ],
    maxOutputTokens: 2048,
    preferDirect: false,
  },

  // ── Sinh Flashcard Tự Động ─────────────────────────────────────────────────
  // Primary: Gemini 2.0 Flash Direct (nhanh, chính xác ngôn ngữ) → Qwen 72B
  flashcard_gen: {
    task: "flashcard_gen",
    provider: "google",
    model: OPENROUTER_MODELS.gemini_flash,
    fallbackModels: [
      OPENROUTER_MODELS.qwen_72b,
      OPENROUTER_MODELS.deepseek_r1,
      OPENROUTER_MODELS.llama_33,
    ],
    maxOutputTokens: 2048,
    preferDirect: true, // Try Gemini 2.0 Flash Direct (secondary)
  },
};

// ── OpenRouter Gateway Config ─────────────────────────────────────────────────
export const OPENROUTER_CONFIG = {
  baseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  apiKeyEnv: "OPENROUTER_API_KEY",
  siteHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    "X-Title": "LinguaVerse AI",
  },
} as const;

// ── Helper: Gọi Google AI Studio Direct API ───────────────────────────────────
/**
 * Gọi trực tiếp Google AI Studio REST API (không qua OpenRouter gateway).
 * Ưu tiên model primary (Gemini 2.5 Flash), nếu lỗi dùng secondary (Gemini 2.0 Flash).
 */
export async function callGoogleAIDirect(
  prompt: string,
  options: {
    useSecondary?: boolean; // true = dùng gemini-2.0-flash thay vì 2.5-flash
    maxOutputTokens?: number;
    temperature?: number;
  } = {}
): Promise<{ text: string; model: string } | null> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelId = options.useSecondary
    ? GOOGLE_AI_STUDIO_MODELS.secondary
    : GOOGLE_AI_STUDIO_MODELS.primary;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxOutputTokens ?? 4096,
          },
        }),
      }
    );

    if (!res.ok) {
      // If primary fails, try secondary (Gemini 2.0 Flash)
      if (!options.useSecondary) {
        return callGoogleAIDirect(prompt, { ...options, useSecondary: true });
      }
      return null;
    }

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return text ? { text, model: `google-ai-studio/${modelId}` } : null;
  } catch {
    // Try secondary model on any exception (network, timeout, quota)
    if (!options.useSecondary) {
      return callGoogleAIDirect(prompt, { ...options, useSecondary: true });
    }
    return null;
  }
}
