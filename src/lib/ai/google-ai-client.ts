/**
 * Direct client for Google AI Studio's Generative Language API — used only
 * for the image-reading (vocabulary/grammar extraction) feature, kept
 * separate from the OpenRouter-routed chat models in `openrouter-client.ts`.
 *
 * Requires GOOGLE_AI_STUDIO_API_KEY in the environment. Get a free key at
 * https://aistudio.google.com/apikey
 */

const GOOGLE_AI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

// Configurable via env so the exact model string can be updated without a
// code change if Google renames/replaces it.
const IMAGE_READER_MODEL = process.env.GOOGLE_AI_IMAGE_MODEL || "gemini-3.5-flash-late";

export interface GoogleAiImagePart {
  mimeType: string;
  base64Data: string; // raw base64, no "data:image/...;base64," prefix
}

export async function generateFromImage(params: {
  systemInstruction: string;
  userText: string;
  image?: GoogleAiImagePart;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Thiếu GOOGLE_AI_STUDIO_API_KEY trong biến môi trường. Lấy key miễn phí tại https://aistudio.google.com/apikey"
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

  const response = await fetch(
    `${GOOGLE_AI_BASE_URL}/models/${IMAGE_READER_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        systemInstruction: { parts: [{ text: params.systemInstruction }] },
        generationConfig: { temperature: params.temperature ?? 0.3 },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Google AI Studio (${IMAGE_READER_MODEL}) lỗi ${response.status}: ${errBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "";

  if (!text) {
    throw new Error("Google AI Studio không trả về nội dung. Vui lòng thử lại.");
  }

  return text;
}

/** Splits a "data:image/jpeg;base64,AAAA..." URL into mime type + raw base64. */
export function parseImageDataUrl(dataUrl: string): GoogleAiImagePart {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Định dạng ảnh không hợp lệ.");
  }
  return { mimeType: match[1], base64Data: match[2] };
}
