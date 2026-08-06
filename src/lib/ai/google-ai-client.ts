/**
 * Direct client for Google AI Studio's Generative Language API.
 *
 * Model IDs come from the central routing config (@/config/ai-models) so
 * they are always in sync with the rest of the app.
 *
 * Auto-retry: tries PRIMARY (Gemini 2.5 Flash) first, falls back to
 * SECONDARY (Gemini 2.0 Flash) on any error / empty response.
 *
 * Requires GOOGLE_AI_STUDIO_API_KEY in the environment.
 * Get a free key at https://aistudio.google.com/apikey
 */

import { GOOGLE_AI_STUDIO_MODELS } from "@/config/ai-models";

const GOOGLE_AI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const MODELS_TO_TRY = [
  GOOGLE_AI_STUDIO_MODELS.primary,   // gemini-2.5-flash
  GOOGLE_AI_STUDIO_MODELS.secondary, // gemini-2.5-flash-lite
] as const;

export interface GoogleAiImagePart {
  mimeType: string;
  base64Data: string; // raw base64, no "data:image/...;base64," prefix
}

/**
 * Call Google AI Studio with optional image attachment.
 * Tries PRIMARY model first; falls back to SECONDARY on any error.
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

  // Try each model in order: PRIMARY → SECONDARY
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
        console.warn(`[google-ai-client] ${model} → HTTP ${response.status}, trying next...`);
        continue;
      }

      const data = await response.json();
      const text: string =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "";

      if (!text) {
        console.warn(`[google-ai-client] ${model} → empty content, trying next...`);
        continue;
      }

      if (model !== MODELS_TO_TRY[0]) {
        console.info(`[google-ai-client] Used fallback model: ${model}`);
      }
      return text;
    } catch (err) {
      console.warn(`[google-ai-client] ${model} → threw error:`, err);
    }
  }

  throw new Error(
    `Google AI Studio: cả ${MODELS_TO_TRY.join(" và ")} đều không phản hồi. Kiểm tra API key hoặc thử lại sau.`
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
  if (!match) {
    throw new Error("Định dạng ảnh không hợp lệ.");
  }
  return { mimeType: match[1], base64Data: match[2] };
}
