import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { runAI, type AITask } from '@/lib/ai/router';

const bodySchema = z.object({
  message: z.string().trim().min(1).max(1500),
  mode: z.enum(['short', 'explain', 'web']).default('short'),
});

const BASE_SYSTEM =
  'Bạn là giảng viên AI kỳ cựu của Học Hành Lắm, chuyên dạy tiếng Anh, Hàn, Trung, Nhật cho người Việt. ' +
  'Luôn trả lời bằng tiếng Việt, thân thiện, chính xác, có ví dụ cụ thể khi hữu ích.';

const MODE_INSTRUCTION: Record<string, { task: AITask; extra: string }> = {
  short: { task: 'tutor-fast', extra: 'Trả lời NGẮN GỌN trong 1-2 câu.' },
  explain: { task: 'tutor-explain', extra: 'Giải thích CHI TIẾT, có ví dụ minh hoạ rõ ràng.' },
  web: { task: 'tutor-explain', extra: 'Trả lời chi tiết. (Lưu ý: tra cứu web trực tiếp chưa được nối trong bản demo này.)' },
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const { message, mode } = parsed.data;

  const supabase = createClient();

  // Lưu tin nhắn của người dùng trước
  await supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: message, mode });

  const { task, extra } = MODE_INSTRUCTION[mode];
  const { text, providerUsed } = await runAI(task, `${BASE_SYSTEM} ${extra}`, message);

  await supabase.from('chat_messages').insert({ user_id: user.id, role: 'ai', content: text, mode });

  return NextResponse.json({ reply: text, providerUsed });
}
