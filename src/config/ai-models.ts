/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║         LINGUAVERSE AI — HIGH-PERFORMANCE DUAL-ENGINE AI ROUTING         ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  ENGINE 1: GOOGLE AI STUDIO DIRECT (Tốc độ tối đa, 0.5-1.5s latency)   ║
 * ║   • gemini-3.5-flash  → Multimodal Vision, Chat Tutor, Fast JSON        ║
 * ║   • gemini-2.5-pro    → Deep Reasoning, Complex Exam & Grammar          ║
 * ║   • gemini-2.5-flash  → High stability fallback                         ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  ENGINE 2: OPENROUTER GATEWAY (Dự phòng tự động khi Google quá tải)     ║
 * ║   • openrouter/free                      → Auto-router free models      ║
 * ║   • google/gemma-4-31b-it:free           → Vision & High accuracy       ║
 * ║   • nvidia/nemotron-3-ultra-550b-a55b:free → Large parameter reasoning    ║
 * ║   • poolside/laguna-s-2.1:free             → Deep grammar explain        ║
 * ║   • meta-llama/llama-3.3-70b-instruct:free → Conversation fallback       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ── Google AI Studio Direct Models (Engine 1 - Top Priority) ─────────────────
export const GOOGLE_AI_STUDIO_MODELS = {
  /** Primary – Gemini 3.5 Flash (Thế hệ mới nhất, tốc độ & vision cực mạnh) */
  primary: "gemini-3.5-flash",
  /** Secondary – Gemini 2.5 Pro (Trí tuệ cao nhất cho suy luận & sinh đề) */
  secondary: "gemini-2.5-pro",
  /** Tertiary – Gemini 2.5 Flash (Backup ổn định) */
  tertiary: "gemini-2.5-flash",
} as const;

// ── OpenRouter Gateway Models (Engine 2 - Automatic Fallback) ────────────────
export const OPENROUTER_MODELS = {
  /** Auto Free Router: Tự động chọn model miễn phí tốt nhất đang rảnh */
  auto_free:       "openrouter/free",
  /** Gemma 4 31B Vision & Reasoning */
  gemma_31b:       "google/gemma-4-31b-it:free",
  /** Nvidia Nemotron 550B: Chat tutor & Exam generation nặng */
  nemotron_ultra:  "nvidia/nemotron-3-ultra-550b-a55b:free",
  /** Poolside Laguna: Giải thích ngữ pháp sâu */
  laguna:          "poolside/laguna-s-2.1:free",
  /** Llama 3.3 70B: Conversation fallback */
  llama_33:        "meta-llama/llama-3.3-70b-instruct:free",
  /** Cohere Code: JSON fast generation */
  cohere_code:     "cohere/north-mini-code:free",
  /** GPT-OSS: Fast micro-tasks */
  gpt_oss:         "openai/gpt-oss-20b:free",
} as const;

// ── Task Types ────────────────────────────────────────────────────────────────
export type AiTaskType =
  | "chat_tutor"       // AI Tutor: conversational language practice
  | "reasoning"        // Ngữ pháp: deep grammar explain & reasoning
  | "fast_completion"  // Nhanh: flashcard hints, tag suggestions
  | "vision_ocr"       // OCR: Image/document extraction
  | "embedding"        // Semantic search
  | "exam_generation"  // Sinh đề thi thật (TOPIK / TOEIC / IELTS / HSK)
  | "game_engine"      // Game engine: quiz / listening / spelling
  | "flashcard_gen";   // Flashcard: auto-generate

export interface AiModelRoute {
  task: AiTaskType;
  provider: "google" | "openrouter" | "nvidia" | "meta" | "cohere" | "poolside";
  model: string;
  fallbackModels: string[];
  maxOutputTokens: number;
  preferDirect: boolean;
}

// ── Routing Table: Tối ưu hoá năng lực AI cho từng nhiệm vụ ──────────────────
export const AI_MODEL_ROUTES: Record<AiTaskType, AiModelRoute> = {

  // ── AI Tutor Chat ──────────────────────────────────────────────────────────
  chat_tutor: {
    task: "chat_tutor",
    provider: "google",
    model: OPENROUTER_MODELS.auto_free,
    fallbackModels: [
      OPENROUTER_MODELS.nemotron_ultra,
      OPENROUTER_MODELS.llama_33,
      OPENROUTER_MODELS.gemma_31b,
    ],
    maxOutputTokens: 2048,
    preferDirect: true, // Google Direct Gemini 3.5 Flash first
  },

  // ── Giải Thích Ngữ Pháp & Suy Luận Sâu (Reasoning) ─────────────────────────
  reasoning: {
    task: "reasoning",
    provider: "google",
    model: OPENROUTER_MODELS.laguna,
    fallbackModels: [
      OPENROUTER_MODELS.auto_free,
      OPENROUTER_MODELS.nemotron_ultra,
      OPENROUTER_MODELS.llama_33,
    ],
    maxOutputTokens: 4096,
    preferDirect: true, // Gemini 2.5 Pro / 3.5 Flash Direct first
  },

  // ── Fast Completion (Micro-tasks, Tag Hints) ──────────────────────────────
  fast_completion: {
    task: "fast_completion",
    provider: "google",
    model: OPENROUTER_MODELS.auto_free,
    fallbackModels: [
      OPENROUTER_MODELS.cohere_code,
      OPENROUTER_MODELS.gpt_oss,
    ],
    maxOutputTokens: 1024,
    preferDirect: true,
  },

  // ── OCR & Vision Processing ────────────────────────────────────────────────
  vision_ocr: {
    task: "vision_ocr",
    provider: "google",
    model: OPENROUTER_MODELS.gemma_31b,
    fallbackModels: [
      "nvidia/nemotron-nano-12b-v2-vl:free",
      OPENROUTER_MODELS.auto_free,
    ],
    maxOutputTokens: 4096,
    preferDirect: true,
  },

  // ── Semantic Embedding ─────────────────────────────────────────────────────
  embedding: {
    task: "embedding",
    provider: "openrouter",
    model: process.env.AI_MODEL_EMBEDDING ?? "poolside/laguna-s-2.1:free",
    fallbackModels: [],
    maxOutputTokens: 0,
    preferDirect: false,
  },

  // ── Sinh Đề Thi Thật (Exam Generation) ────────────────────────────────────
  exam_generation: {
    task: "exam_generation",
    provider: "google",
    model: OPENROUTER_MODELS.nemotron_ultra,
    fallbackModels: [
      OPENROUTER_MODELS.auto_free,
      OPENROUTER_MODELS.gemma_31b,
      OPENROUTER_MODELS.laguna,
    ],
    maxOutputTokens: 4096,
    preferDirect: true,
  },

  // ── Game Engine ────────────────────────────────────────────────────────────
  game_engine: {
    task: "game_engine",
    provider: "google",
    model: OPENROUTER_MODELS.auto_free,
    fallbackModels: [
      OPENROUTER_MODELS.cohere_code,
      OPENROUTER_MODELS.gpt_oss,
    ],
    maxOutputTokens: 2048,
    preferDirect: true,
  },

  // ── Sinh Flashcard Tự Động ─────────────────────────────────────────────────
  flashcard_gen: {
    task: "flashcard_gen",
    provider: "google",
    model: OPENROUTER_MODELS.auto_free,
    fallbackModels: [
      OPENROUTER_MODELS.cohere_code,
      OPENROUTER_MODELS.gemma_31b,
    ],
    maxOutputTokens: 2048,
    preferDirect: true,
  },
};

export const OPENROUTER_CONFIG = {
  baseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  apiKeyEnv: "OPENROUTER_API_KEY",
  siteHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    "X-Title": "LinguaVerse AI",
  },
} as const;

/**
 * Call Google AI Studio Direct API with multi-model fallback chain:
 * Gemini 3.5 Flash → Gemini 2.5 Pro → Gemini 2.5 Flash.
 */
export async function callGoogleAIDirect(
  prompt: string,
  options: {
    maxOutputTokens?: number;
    temperature?: number;
  } = {}
): Promise<{ text: string; model: string } | null> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelsToTry = [
    GOOGLE_AI_STUDIO_MODELS.primary,   // gemini-3.5-flash
    GOOGLE_AI_STUDIO_MODELS.secondary, // gemini-2.5-pro
    GOOGLE_AI_STUDIO_MODELS.tertiary,  // gemini-2.5-flash
  ];

  for (const modelId of modelsToTry) {
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

      if (!res.ok) continue;

      const data = await res.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text.trim()) {
        return { text, model: `google-ai-studio/${modelId}` };
      }
    } catch {
      // Try next model
    }
  }

  return null;
}
