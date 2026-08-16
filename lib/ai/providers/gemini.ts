/**
 * Google AI Studio (Gemini) — gọi thẳng REST API, không cần SDK để giữ
 * bundle nhẹ. Free tier của Google AI Studio đủ dùng cho vài người test.
 *
 * LƯU Ý: tên model (vd "gemini-2.5-flash") có thể đổi theo thời gian.
 * Kiểm tra danh sách model khả dụng tại https://ai.google.dev/models trước
 * khi deploy thật, và cập nhật trong .env nếu cần.
 */
export async function callGemini(model: string, systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) throw new Error('Thiếu GOOGLE_AI_STUDIO_API_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
    }),
    // Không cache — nội dung mỗi lần gọi là duy nhất theo câu hỏi người dùng.
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API lỗi (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ?? '';
  if (!text) throw new Error('Gemini trả về nội dung rỗng');
  return text as string;
}

/** Gửi kèm ảnh (base64) — dùng cho tính năng "chụp ảnh để AI đọc". */
export async function callGeminiVision(model: string, systemPrompt: string, imageBase64: string, mimeType: string, instruction: string) {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) throw new Error('Thiếu GOOGLE_AI_STUDIO_API_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: instruction }, { inlineData: { mimeType, data: imageBase64 } }],
        },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini Vision API lỗi (${res.status}): ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ?? '';
  if (!text) throw new Error('Gemini Vision trả về nội dung rỗng');
  return text as string;
}
