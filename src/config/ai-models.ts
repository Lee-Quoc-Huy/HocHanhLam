/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║         LINGUAVERSE AI — 9 DEDICATED AI ENGINE MODEL ROUTING             ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  GOOGLE AI STUDIO (3 Dedicated Models):                                  ║
 * ║   • 1. gemini-2.5-pro    → Ôn Thi Primary (Strongest Reasoning/IQ)      ║
 * ║   • 2. gemini-2.0-flash  → Ôn Thi Secondary (High Capacity & Speed)       ║
 * ║   • 3. gemini-2.5-flash  → Đọc Ảnh AI OCR (Smartest Vision Intelligence) ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  OPENROUTER GATEWAY (6 Dedicated Models in AI Tutor):                    ║
 * ║   • 4. meta-llama/llama-3.3-70b-instruct:free   → Fluency & Conversation  ║
 * ║   • 5. nvidia/nemotron-3-ultra-550b-a55b:free   → Deep Reasoning Tutor    ║
 * ║   • 6. google/gemma-4-31b-it:free               → Multilingual Intelligence║
 * ║   • 7. qwen/qwen-2.5-72b-instruct:free          → KO & ZH Language Master ║
 * ║   • 8. mistralai/mistral-small-24b-instruct-2501:free → Fast Dialogue    ║
 * ║   • 9. openrouter/free                         → Uptime Auto-Balancer    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ── 3 Google AI Studio Direct Models ─────────────────────────────────────────
export const GOOGLE_AI_STUDIO_MODELS = {
  /** 1. Ôn Thi Strongest AI – Gemini 2.5 Pro (Trí tuệ cao nhất cho suy luận & đề thi) */
  exam_primary: "gemini-2.5-pro",
  /** 2. Ôn Thi Secondary AI – Gemini 2.0 Flash (Fast & High Capacity Exam Gen) */
  exam_secondary: "gemini-2.0-flash",
  /** 3. Đọc Ảnh AI (Vision OCR) – Gemini 2.5 Flash (Thông minh nhất về Vision OCR) */
  vision_smartest: "gemini-2.5-flash",
  vision_backup: "gemini-2.0-flash",
} as const;

// ── 6 OpenRouter Models Dedicated to AI Tutor ────────────────────────────────
export const OPENROUTER_TUTOR_MODELS = {
  /** 4. AI Tutor Model 1 – Llama 3.3 70B (Conversation & Fluency) */
  llama_70b: "meta-llama/llama-3.3-70b-instruct:free",
  /** 5. AI Tutor Model 2 – Nemotron 550B (Deep Tutoring & Grammar) */
  nemotron_550b: "nvidia/nemotron-3-ultra-550b-a55b:free",
  /** 6. AI Tutor Model 3 – Gemma 4 31B (Multilingual Intelligence) */
  gemma_31b: "google/gemma-4-31b-it:free",
  /** 7. AI Tutor Model 4 – Qwen 2.5 72B (Master Tiếng Hàn KO & Tiếng Trung ZH) */
  qwen_72b: "qwen/qwen-2.5-72b-instruct:free",
  /** 8. AI Tutor Model 5 – Mistral Small 24B (Fast Natural Dialogue) */
  mistral_24b: "mistralai/mistral-small-24b-instruct-2501:free",
  /** 9. AI Tutor Model 6 – OpenRouter Auto Free (Auto-balancer Uptime) */
  auto_free: "openrouter/free",
} as const;

// Backward compatibility alias
export const OPENROUTER_MODELS = OPENROUTER_TUTOR_MODELS;

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
  provider: "google" | "openrouter";
  model: string;
  fallbackModels: string[];
  maxOutputTokens: number;
  preferDirect: boolean;
}

// ── Routing Table: 9 AI Models System Topology ───────────────────────────────
export const AI_MODEL_ROUTES: Record<AiTaskType, AiModelRoute> = {

  // ── AI Tutor Chat: Runs across 6 OpenRouter Models ─────────────────────────
  chat_tutor: {
    task: "chat_tutor",
    provider: "openrouter",
    model: OPENROUTER_TUTOR_MODELS.llama_70b,
    fallbackModels: [
      OPENROUTER_TUTOR_MODELS.qwen_72b,
      OPENROUTER_TUTOR_MODELS.nemotron_550b,
      OPENROUTER_TUTOR_MODELS.gemma_31b,
      OPENROUTER_TUTOR_MODELS.mistral_24b,
      OPENROUTER_TUTOR_MODELS.auto_free,
    ],
    maxOutputTokens: 2048,
    preferDirect: false,
  },

  // ── Deep Reasoning (AI Tutor Grammar Assistant) ───────────────────────────
  reasoning: {
    task: "reasoning",
    provider: "openrouter",
    model: OPENROUTER_TUTOR_MODELS.nemotron_550b,
    fallbackModels: [
      OPENROUTER_TUTOR_MODELS.qwen_72b,
      OPENROUTER_TUTOR_MODELS.llama_70b,
      OPENROUTER_TUTOR_MODELS.gemma_31b,
      OPENROUTER_TUTOR_MODELS.auto_free,
    ],
    maxOutputTokens: 4096,
    preferDirect: false,
  },

  // ── Fast Completion (Flashcard hints) ─────────────────────────────────────
  fast_completion: {
    task: "fast_completion",
    provider: "openrouter",
    model: OPENROUTER_TUTOR_MODELS.mistral_24b,
    fallbackModels: [
      OPENROUTER_TUTOR_MODELS.auto_free,
    ],
    maxOutputTokens: 1024,
    preferDirect: false,
  },

  // ── OCR & Vision Processing: Dedicated Google AI Studio Vision Model ────────
  vision_ocr: {
    task: "vision_ocr",
    provider: "google",
    model: GOOGLE_AI_STUDIO_MODELS.vision_smartest,
    fallbackModels: [
      GOOGLE_AI_STUDIO_MODELS.vision_backup,
      OPENROUTER_TUTOR_MODELS.gemma_31b,
      OPENROUTER_TUTOR_MODELS.auto_free,
    ],
    maxOutputTokens: 4096,
    preferDirect: true,
  },

  // ── Semantic Embedding ─────────────────────────────────────────────────────
  embedding: {
    task: "embedding",
    provider: "openrouter",
    model: OPENROUTER_TUTOR_MODELS.auto_free,
    fallbackModels: [],
    maxOutputTokens: 0,
    preferDirect: false,
  },

  // ── Ôn Thi (Exam Generation): Dedicated 2 Strongest Google AI Studio Models ──
  exam_generation: {
    task: "exam_generation",
    provider: "google",
    model: GOOGLE_AI_STUDIO_MODELS.exam_primary,
    fallbackModels: [
      GOOGLE_AI_STUDIO_MODELS.exam_secondary,
      OPENROUTER_TUTOR_MODELS.nemotron_550b,
      OPENROUTER_TUTOR_MODELS.qwen_72b,
    ],
    maxOutputTokens: 4096,
    preferDirect: true,
  },

  // ── Game Engine ────────────────────────────────────────────────────────────
  game_engine: {
    task: "game_engine",
    provider: "openrouter",
    model: OPENROUTER_TUTOR_MODELS.mistral_24b,
    fallbackModels: [
      OPENROUTER_TUTOR_MODELS.auto_free,
    ],
    maxOutputTokens: 2048,
    preferDirect: false,
  },

  // ── Sinh Flashcard Tự Động ─────────────────────────────────────────────────
  flashcard_gen: {
    task: "flashcard_gen",
    provider: "openrouter",
    model: OPENROUTER_TUTOR_MODELS.gemma_31b,
    fallbackModels: [
      OPENROUTER_TUTOR_MODELS.auto_free,
    ],
    maxOutputTokens: 2048,
    preferDirect: false,
  },
};

export const OPENROUTER_CONFIG = {
  baseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  apiKeyEnv: "OPENROUTER_API_KEY",
  siteHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://linguaverse.ai",
    "X-Title": "LinguaVerse AI",
  },
} as const;

/**
 * Call Google AI Studio Direct API with multi-model fallback chain.
 * Tries specified model list or defaults to primary -> secondary -> vision.
 */
export async function callGoogleAIDirect(
  prompt: string,
  options: {
    maxOutputTokens?: number;
    temperature?: number;
    modelsToTry?: string[];
  } = {}
): Promise<{ text: string; model: string } | null> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const models = options.modelsToTry ?? [
    GOOGLE_AI_STUDIO_MODELS.exam_primary,
    GOOGLE_AI_STUDIO_MODELS.exam_secondary,
    GOOGLE_AI_STUDIO_MODELS.vision_smartest,
  ];

  for (const modelId of models) {
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

