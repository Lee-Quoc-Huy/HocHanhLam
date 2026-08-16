import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/supabase/server';
import { translateSeed } from '@/lib/neon/db';
import { runAI } from '@/lib/ai/router';

const bodySchema = z.object({
  text: z.string().trim().min(1).max(1000),
  targetLang: z.enum(['en', 'kr', 'cn', 'jp']),
});

const LANG_NAMES: Record<string, string> = { en: 'tiếng Anh', kr: 'tiếng Hàn', cn: 'tiếng Trung', jp: 'tiếng Nhật' };

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });

  const { text, targetLang } = parsed.data;

  // 1) Thử tra nhanh trong từ điển mẫu (DB phụ - Neon) trước, đỡ tốn quota AI
  try {
    const seed = await translateSeed(text, targetLang);
    if (seed) return NextResponse.json({ translation: seed, source: 'dictionary' });
  } catch {
    // Neon chưa cấu hình hoặc lỗi mạng — bỏ qua, rơi xuống AI
  }

  // 2) Gọi AI dịch thật (Groq Qwen -> Gemini Flash-Lite -> OpenRouter, xem lib/ai/router.ts)
  const system =
    `Bạn là công cụ dịch thuật. Dịch câu tiếng Việt sang ${LANG_NAMES[targetLang]} một cách tự nhiên, ` +
    `đúng ngữ pháp. Chỉ trả về câu dịch, không thêm giải thích hay chú thích.`;
  const { text: translation, providerUsed } = await runAI('translate', system, text);

  return NextResponse.json({ translation, source: providerUsed });
}
