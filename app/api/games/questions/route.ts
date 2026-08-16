import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { getFillBlankQuestions, getReadingPassages } from '@/lib/neon/db';

const querySchema = z.object({
  type: z.enum(['fillblank', 'reading']),
  lang: z.enum(['en', 'kr', 'cn', 'jp']),
  count: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    type: searchParams.get('type'),
    lang: searchParams.get('lang'),
    count: searchParams.get('count') ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: 'Tham số không hợp lệ' }, { status: 400 });

  const supabase = createClient();
  const { data: progress } = await supabase
    .from('user_progress')
    .select('level')
    .eq('user_id', user.id)
    .eq('lang_code', parsed.data.lang)
    .single();
  const level = progress?.level ?? 0;

  try {
    if (parsed.data.type === 'fillblank') {
      const questions = await getFillBlankQuestions(parsed.data.lang, level, parsed.data.count);
      return NextResponse.json({ questions });
    }
    const passages = await getReadingPassages(parsed.data.lang, level, Math.min(parsed.data.count, 20));
    return NextResponse.json({ passages });
  } catch (err) {
    return NextResponse.json(
      { error: 'Không tải được nội dung từ DB nội dung (Neon). Kiểm tra NEON_DATABASE_URL.' },
      { status: 502 }
    );
  }
}
