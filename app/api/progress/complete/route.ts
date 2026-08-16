import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

const bodySchema = z.object({
  lang: z.enum(['en', 'kr', 'cn', 'jp']),
  gameType: z.enum(['flashcard', 'fillblank', 'reading']),
  total: z.number().int().min(1).max(100),
  correct: z.number().int().min(0).max(100),
});

const XP_PER_CORRECT: Record<string, number> = { flashcard: 1.5, fillblank: 2, reading: 3 };

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  const { lang, gameType, total, correct } = parsed.data;
  if (correct > total) return NextResponse.json({ error: 'Số câu đúng không được lớn hơn tổng số câu' }, { status: 400 });

  const supabase = createClient();

  const xpEarned = Math.min(100, Math.round(correct * (XP_PER_CORRECT[gameType] ?? 1)));

  const { data: current, error: readErr } = await supabase
    .from('user_progress')
    .select('level, xp, streak, last_active_date')
    .eq('user_id', user.id)
    .eq('lang_code', lang)
    .single();
  if (readErr || !current) {
    return NextResponse.json({ error: 'Chưa có tiến độ cho ngôn ngữ này — hãy chọn ngôn ngữ trong hồ sơ trước.' }, { status: 400 });
  }

  let newXp = current.xp + xpEarned;
  let newLevel = current.level;
  if (newXp >= 100 && newLevel < 4) {
    newLevel += 1;
    newXp = newXp - 100;
  }
  newXp = Math.max(0, Math.min(100, newXp));

  const today = new Date().toISOString().slice(0, 10);
  const newStreak = current.last_active_date === today ? current.streak : current.streak + 1;

  const { error: updateErr } = await supabase
    .from('user_progress')
    .update({ level: newLevel, xp: newXp, streak: newStreak, last_active_date: today, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('lang_code', lang);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  const { error: attemptErr } = await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    lang_code: lang,
    game_type: gameType,
    total_questions: total,
    correct_answers: correct,
    xp_earned: xpEarned,
  });
  if (attemptErr) console.error('[progress/complete] Không ghi được quiz_attempts:', attemptErr.message);

  return NextResponse.json({ xpEarned, newLevel, newXp, newStreak, leveledUp: newLevel !== current.level });
}
