/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║            LINGUAVERSE AI — 8-MODEL MULTI-AI ROUTING CONFIG             ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  GOOGLE AI STUDIO DIRECT (Kênh 1 — Ưu tiên cao nhất, không phí GW)     ║
 * ║   1. gemini-2.5-flash      → Thi thật, Exam gen, AI Tutor chính         ║
 * ║   2. gemini-2.0-flash      → Flashcard gen, OCR, Game, Fast fallback    ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  OPENROUTER MODEL ROUTING (Kênh 2 — Luân phiên khi Direct quá tải)     ║
 * ║   3. nvidia/nemotron-3-ultra-550b-a55b:free → Chat tutor, Exam heavy    ║
 * ║   4. poolside/laguna-s-2.1:free             → Grammar reasoning sâu     ║
 * ║   5. cohere/north-mini-code:free            → Flashcard gen, JSON fast  ║
 * ║   6. google/gemma-4-26b-a4b-it:free         → Exam generation backup    ║
 * ║   7. meta-llama/llama-3.3-70b-instruct:free → AI Tutor fallback         ║
 * ║   8. openai/gpt-oss-20b:free                → Micro-tasks, quick hints  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ── Google AI Studio Direct Models (Chọn từ bảng Quota tài khoản thực tế) ──
export const GOOGLE_AI_STUDIO_MODELS = {
  /** Primary – Gemini 2.5 Flash (Multimodal Vision + Reasoning mạnh nhất) */
  primary: "gemini-2.5-flash",
  /** Secondary – Gemini 2.5 Flash Lite (Nhanh, nhẹ, quota riêng) */
  secondary: "gemini-2.5-flash-lite",
  /** Tertiary – Gemini 3.5 Flash (Backup mới nhất nếu 2.5 bị rate limit) */
  tertiary: "gemini-3.5-flash",
} as const;

// ── 6 OpenRouter Models (Phân công theo nhiệm vụ) ────────────────────────────
export const OPENROUTER_MODELS = {
  /** #3 – Nvidia Nemotron 550B: Chat tutor chính, Exam generation nặng */
  nemotron_ultra:  "nvidia/nemotron-3-ultra-550b-a55b:free",
  /** #4 – Poolside Laguna: Giải thích ngữ pháp, reasoning sâu */
  laguna:          "poolside/laguna-s-2.1:free",
  /** #5 – Cohere North Mini Code: Sinh flashcard, game engine, JSON nhanh */
  cohere_code:     "cohere/north-mini-code:free",
  /** #6 – Gemma 26B: Exam generation backup, bài ôn tập */
  gemma_26b:       "google/gemma-4-26b-a4b-it:free",
  /** #7 – Llama 3.3 70B: AI Tutor conversation fallback, Q&A */
  llama_33:        "meta-llama/llama-3.3-70b-instruct:free",
  /** #8 – GPT-OSS 20B: Micro-tasks, quick hints, tag suggestions */
  gpt_oss:         "openai/gpt-oss-20b:free",
} as const;

// ── Task Types ────────────────────────────────────────────────────────────────
export type AiTaskType =
  | "chat_tutor"       // AI Tutor: conversational language practice
  | "reasoning"        // Ngữ pháp: deep grammar explain & reasoning
  | "fast_completion"  // Nhanh: flashcard hints, tag suggestions, fills
  | "vision_ocr"       // OCR: Gemini Vision document/image extraction
  | "embedding"        // Semantic search / SRS pgvector similarity
  | "exam_generation"  // Sinh đề: TOPIK / TOEIC / IELTS / HSK questions
  | "game_engine"      // Game: quiz/listening/spelling question generation
  | "flashcard_gen";   // Flashcard: auto-generate from text/document

export interface AiModelRoute {
  task: AiTaskType;
  provider: "google" | "deepseek" | "qwen" | "openai" | "nvidia" | "meta" | "cohere" | "poolside";
  model: string;
  /** Ordered list of fallback model IDs (OpenRouter format) */
  fallbackModels?: string[];
  /** @deprecated – use fallbackModels */
  fallbackModel?: string;
  maxOutputTokens: number;
  /** Try Google AI Studio Direct API before OpenRouter */
  preferDirect?: boolean;
}

// ── Routing Table: 8 AI phân công theo nhiệm vụ ──────────────────────────────
export const AI_MODEL_ROUTES: Record<AiTaskType, AiModelRoute> = {

  // ── AI Tutor Chat ──────────────────────────────────────────────────────────
  // Direct: Gemini 2.5 Flash → OpenRouter: Nemotron → Llama 3.3 → GPT-OSS
  chat_tutor: {
    task: "chat_tutor",
    provider: "nvidia",
    model: OPENROUTER_MODELS.nemotron_ultra,
    fallbackModels: [
      OPENROUTER_MODELS.llama_33,
      OPENROUTER_MODELS.laguna,
      OPENROUTER_MODELS.gpt_oss,
    ],
    maxOutputTokens: 2048,
    preferDirect: true, // Gemini 2.5 Flash Direct first
  },

  // ── Giải Thích Ngữ Pháp & Reasoning ───────────────────────────────────────
  // Primary: Poolside Laguna (reasoning specialist) → Nemotron → Llama
  reasoning: {
    task: "reasoning",
    provider: "poolside",
    model: OPENROUTER_MODELS.laguna,
    fallbackModels: [
      OPENROUTER_MODELS.nemotron_ultra,
      OPENROUTER_MODELS.llama_33,
    ],
    maxOutputTokens: 4096,
    preferDirect: false,
  },

  // ── Fast Completion (Hints, Tags, Micro-tasks) ─────────────────────────────
  // Direct: Gemini 2.0 Flash → GPT-OSS → Cohere Code
  fast_completion: {
    task: "fast_completion",
    provider: "openai",
    model: OPENROUTER_MODELS.gpt_oss,
    fallbackModels: [
      OPENROUTER_MODELS.cohere_code,
      OPENROUTER_MODELS.gemma_26b,
    ],
    maxOutputTokens: 512,
    preferDirect: true, // Gemini 2.0 Flash Direct (secondary)
  },

  // ── OCR & Vision Processing ────────────────────────────────────────────────
  // Chỉ dùng Google Direct (multimodal): Gemini 2.5 Flash → 2.0 Flash
  vision_ocr: {
    task: "vision_ocr",
    provider: "google",
    model: OPENROUTER_MODELS.nemotron_ultra, // fallback if no direct key
    fallbackModels: [OPENROUTER_MODELS.llama_33],
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
  // Direct: Gemini 2.5 Flash → OpenRouter: Nemotron → Laguna → Gemma → Llama → GPT-OSS
  exam_generation: {
    task: "exam_generation",
    provider: "nvidia",
    model: OPENROUTER_MODELS.nemotron_ultra,
    fallbackModels: [
      OPENROUTER_MODELS.laguna,
      OPENROUTER_MODELS.gemma_26b,
      OPENROUTER_MODELS.llama_33,
      OPENROUTER_MODELS.cohere_code,
      OPENROUTER_MODELS.gpt_oss,
    ],
    maxOutputTokens: 4096,
    preferDirect: true, // Gemini 2.5 Flash Direct → then chain above
  },

  // ── Game Engine (Quiz / Listening / Spelling) ─────────────────────────────
  // Direct: Gemini 2.0 Flash → Cohere Code → GPT-OSS → Gemma 26B
  game_engine: {
    task: "game_engine",
    provider: "cohere",
    model: OPENROUTER_MODELS.cohere_code,
    fallbackModels: [
      OPENROUTER_MODELS.gpt_oss,
      OPENROUTER_MODELS.gemma_26b,
      OPENROUTER_MODELS.llama_33,
    ],
    maxOutputTokens: 2048,
    preferDirect: true, // Gemini 2.0 Flash Direct (secondary) is fast for games
  },

  // ── Sinh Flashcard Tự Động ─────────────────────────────────────────────────
  // Direct: Gemini 2.0 Flash → Cohere Code → GPT-OSS → Gemma 26B
  flashcard_gen: {
    task: "flashcard_gen",
    provider: "cohere",
    model: OPENROUTER_MODELS.cohere_code,
    fallbackModels: [
      OPENROUTER_MODELS.gpt_oss,
      OPENROUTER_MODELS.gemma_26b,
      OPENROUTER_MODELS.laguna,
    ],
    maxOutputTokens: 2048,
    preferDirect: true, // Gemini 2.0 Flash Direct (secondary)
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
 * Thử PRIMARY (Gemini 2.5 Flash) trước, nếu lỗi thử SECONDARY (Gemini 2.0 Flash).
 */
export async function callGoogleAIDirect(
  prompt: string,
  options: {
    useSecondary?: boolean;
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
      if (!options.useSecondary) {
        return callGoogleAIDirect(prompt, { ...options, useSecondary: true });
      }
      return null;
    }

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      if (!options.useSecondary) {
        return callGoogleAIDirect(prompt, { ...options, useSecondary: true });
      }
      return null;
    }
    return { text, model: `google-ai-studio/${modelId}` };
  } catch {
    if (!options.useSecondary) {
      return callGoogleAIDirect(prompt, { ...options, useSecondary: true });
    }
    return null;
  }
}
