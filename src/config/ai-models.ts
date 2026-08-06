/**
 * AI model routing config. All AI calls go through OpenRouter, which lets us
 * swap providers (Gemini / DeepSeek / Qwen) per task without touching
 * feature code. Keep provider-specific model IDs isolated here.
 */

export type AiTaskType =
  | "chat_tutor"       // conversational practice, general Q&A
  | "reasoning"        // grammar explanation, exam-answer reasoning
  | "fast_completion"  // flashcard hints, quick lookups
  | "vision_ocr"       // Gemini Vision document/text extraction
  | "embedding"        // pgvector semantic search / SRS similarity
  | "exam_generation"; // generate TOPIK/TOEIC/HSK practice questions

export interface AiModelRoute {
  task: AiTaskType;
  provider: "google" | "deepseek" | "qwen" | "openai" | "nvidia" | "mistral";
  model: string;
  /** Ordered list of fallback model IDs tried in sequence on failure */
  fallbackModels?: string[];
  /** @deprecated use fallbackModels instead */
  fallbackModel?: string;
  maxOutputTokens: number;
}

export const AI_MODEL_ROUTES: Record<AiTaskType, AiModelRoute> = {
  chat_tutor: {
    task: "chat_tutor",
    provider: "google",
    model: process.env.AI_MODEL_CHAT_DEFAULT ?? "google/gemini-2.5-flash",
    fallbackModel: "qwen/qwen-2.5-7b-instruct",
    maxOutputTokens: 2048,
  },
  reasoning: {
    task: "reasoning",
    provider: "deepseek",
    model: process.env.AI_MODEL_CHAT_REASONING ?? "deepseek/deepseek-r1",
    fallbackModel: "google/gemini-2.5-flash",
    maxOutputTokens: 4096,
  },
  fast_completion: {
    task: "fast_completion",
    provider: "qwen",
    model: process.env.AI_MODEL_CHAT_FAST ?? "qwen/qwen-2.5-7b-instruct",
    fallbackModel: "google/gemini-2.5-flash",
    maxOutputTokens: 512,
  },
  vision_ocr: {
    task: "vision_ocr",
    provider: "google",
    model: process.env.AI_MODEL_VISION_OCR ?? "google/gemini-2.5-pro",
    maxOutputTokens: 4096,
  },
  embedding: {
    task: "embedding",
    provider: "openai",
    model: process.env.AI_MODEL_EMBEDDING ?? "text-embedding-3-large",
    maxOutputTokens: 0,
  },

  // ── Exam question generation: tries 5 free models in order ──────────────
  exam_generation: {
    task: "exam_generation",
    provider: "google",
    // Primary: Gemini 2.5 Flash via OpenRouter (fastest, best JSON)
    model: "google/gemini-2.5-flash",
    // Fallback chain: DeepSeek R1 → Qwen 72B → Nemotron 550B → Llama 3.3 70B → Gemma 26B
    fallbackModels: [
      "deepseek/deepseek-r1-distill-qwen-32b:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemma-4-26b-a4b-it:free",
    ],
    maxOutputTokens: 4096,
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
