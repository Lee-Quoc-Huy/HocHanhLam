/**
 * Direct client for Google AI Studio's Generative Language API.
 *
 * Model IDs come from the central routing config (@/config/ai-models) so
 * they are always in sync with the rest of the app.
 *
 * Auto-retry: tries PRIMARY (Gemini 2.0 Flash) first, falls back to
 * SECONDARY (Gemini 2.0 Flash Lite) then TERTIARY (Gemini 1.5 Flash 002).
 *
 * Requires GOOGLE_AI_STUDIO_API_KEY in the environment.
 * Get a free key at https://aistudio.google.com/apikey
 */

import { GOOGLE_AI_STUDIO_MODELS } from "@/config/ai-models";

const GOOGLE_AI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const MODELS_TO_TRY = [
  GOOGLE_AI_STUDIO_MODELS.primary,    // gemini-2.0-flash
  GOOGLE_AI_STUDIO_MODELS.secondary,  // gemini-2.0-flash-lite
  GOOGLE_AI_STUDIO_MODELS.tertiary,   // gemini-1.5-flash-002
] as const;

export interface GoogleAiImagePart {
  mimeType: string;
  base64Data: string; // raw base64, no "data:image/...;base64," prefix
}

/**
 * Call Google AI Studio with optional image attachment.
 * Tries PRIMARY → SECONDARY → TERTIARY models on any error.
 */
export async function generateFromImage(params: {
  systemInstruction: string;
  userText: string;
  image?: GoogleAiImagePart;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Thiếu GOOGLE_AI_STUDIO_API_KEY. Lấy key miễn phí tại https://aistudio.google.com/apikey"
    );
  }

  const parts: Record<string, unknown>[] = [{ text: params.userText }];
  if (params.image) {
    parts.push({
      inline_data: {
        mime_type: params.image.mimeType,
        data: params.image.base64Data,
      },
    });
  }

  const body = JSON.stringify({
    contents: [{ role: "user", parts }],
    systemInstruction: { parts: [{ text: params.systemInstruction }] },
    generationConfig: {
      temperature: params.temperature ?? 0.4,
      maxOutputTokens: 4096,
    },
  });

  // Try each model in order: PRIMARY → SECONDARY → TERTIARY
  const errors: string[] = [];
  for (const model of MODELS_TO_TRY) {
    try {
      const response = await fetch(
        `${GOOGLE_AI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }
      );

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        const reason = `HTTP ${response.status}${errBody ? `: ${errBody.slice(0, 200)}` : ""}`;
        console.warn(`[google-ai-client] ${model} → ${reason}, trying next...`);
        errors.push(`${model}: ${reason}`);
        continue;
      }

      const data = await response.json();
      const text: string =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "";

      if (!text) {
        console.warn(`[google-ai-client] ${model} → empty content, trying next...`);
        errors.push(`${model}: empty response`);
        continue;
      }

      if (model !== MODELS_TO_TRY[0]) {
        console.info(`[google-ai-client] Used fallback model: ${model}`);
      }
      return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[google-ai-client] ${model} → threw error:`, msg);
      errors.push(`${model}: ${msg}`);
    }
  }

  throw new Error(
    `Google AI Studio: không có model nào phản hồi thành công.\n` +
    `Chi tiết:\n${errors.map((e, i) => `  ${i + 1}. ${e}`).join("\n")}\n\n` +
    `Vui lòng kiểm tra API key tại https://aistudio.google.com/apikey`
  );
}

/**
 * Text-only shortcut — wraps generateFromImage without an image part.
 * Used by generate-game and other text-only generation routes.
 */
export async function generateFromPrompt(params: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}): Promise<string> {
  return generateFromImage({
    systemInstruction:
      params.systemInstruction ?? "You are an AI language learning tutor.",
    userText: params.prompt,
    temperature: params.temperature ?? 0.4,
  });
}

/** Splits a "data:image/jpeg;base64,AAAA..." URL into mime type + raw base64. */
export function parseImageDataUrl(dataUrl: string): GoogleAiImagePart {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !match[1] || !match[2]) {
    throw new Error("Định dạng ảnh không hợp lệ.");
  }
  return { mimeType: match[1], base64Data: match[2] };
}
