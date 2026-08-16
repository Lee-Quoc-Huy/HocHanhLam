/**
 * Groq — API tương thích chuẩn OpenAI chat completions, free tier có rate
 * limit theo phút khá thoải mái cho vài người dùng test.
 *
 * LƯU Ý: tên model (vd "llama-4-scout", "llama-3.1-8b-instant", "qwen...")
 * đổi theo danh mục model Groq đang phục vụ. Kiểm tra tại
 * https://console.groq.com/docs/models trước khi deploy và cập nhật .env.
 */
export async function callGroq(model: string, systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Thiếu GROQ_API_KEY');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Groq API lỗi (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Groq trả về nội dung rỗng');
  return text as string;
}
