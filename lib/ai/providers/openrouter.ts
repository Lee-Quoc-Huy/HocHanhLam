/**
 * OpenRouter — API tương thích chuẩn OpenAI chat completions, tổng hợp
 * nhiều model từ nhiều hãng, trong đó có một số model gắn hậu tố ":free"
 * dùng miễn phí (có rate-limit theo phút/ngày, đủ cho vài người test).
 *
 * Khác với Ollama, đây là dịch vụ cloud nên chạy bình thường trên Vercel —
 * không cần tự host server riêng.
 *
 * LƯU Ý: danh sách model free đổi theo thời gian. Kiểm tra tại
 * https://openrouter.ai/models?max_price=0 trước khi deploy và cập nhật .env.
 */
export async function callOpenRouter(model: string, systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Thiếu OPENROUTER_API_KEY');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      // OpenRouter khuyến nghị gửi 2 header này để định danh app khi dùng free tier
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://hochanhlam.app',
      'X-Title': 'Học Hành Lắm',
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
    throw new Error(`OpenRouter API lỗi (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('OpenRouter trả về nội dung rỗng');
  return text as string;
}
