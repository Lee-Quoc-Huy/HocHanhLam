'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

const schema = z.object({
  languages: z
    .array(z.enum(['en', 'kr', 'cn', 'jp']))
    .min(1, 'Chọn ít nhất 1 ngôn ngữ')
    .max(4),
});

export async function saveOnboarding(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const raw = formData.getAll('languages');
  const parsed = schema.safeParse({ languages: raw });
  if (!parsed.success) {
    // Trong bản thật nên trả lỗi về client qua useFormState; giữ đơn giản ở demo này.
    throw new Error(parsed.error.errors[0]?.message ?? 'Dữ liệu không hợp lệ');
  }

  const supabase = createClient();

  // 1) Lưu ngôn ngữ đã chọn + đánh dấu đã onboarding — DB CHÍNH (Supabase)
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ selected_languages: parsed.data.languages, onboarded: true, updated_at: new Date().toISOString() })
    .eq('id', user!.id);
  if (profileErr) throw new Error(profileErr.message);

  // 2) Khởi tạo dòng tiến độ (level/xp/streak = 0) cho từng ngôn ngữ đã chọn
  //    Dùng upsert để bấm lại onboarding không tạo trùng dòng.
  const rows = parsed.data.languages.map((lang) => ({
    user_id: user!.id,
    lang_code: lang,
    level: 0,
    xp: 0,
    streak: 0,
  }));
  const { error: progressErr } = await supabase
    .from('user_progress')
    .upsert(rows, { onConflict: 'user_id,lang_code', ignoreDuplicates: true });
  if (progressErr) throw new Error(progressErr.message);

  redirect('/dashboard');
}
