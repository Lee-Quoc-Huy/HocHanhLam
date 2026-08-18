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

export async function saveOnboarding(
  formData: FormData
): Promise<{ error: string } | undefined> {
  // QUAN TRỌNG: hàm này KHÔNG throw lỗi ra ngoài (trừ redirect(), vốn hoạt
  // động bằng cách throw 1 lỗi đặc biệt của Next.js — bắt buộc phải vậy).
  // Nếu throw Error thường ở đây, Next.js sẽ hiện màn "Application error"
  // chung chung thay vì lỗi thật, rất khó debug. Nên mọi lỗi thật đều trả
  // về dưới dạng { error: "..." } để trang onboarding hiển thị trực tiếp.
  try {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const raw = formData.getAll('languages');
    const parsed = schema.safeParse({ languages: raw });
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Dữ liệu không hợp lệ' };
    }

    const supabase = createClient();

    // 1) Lưu ngôn ngữ đã chọn + đánh dấu đã onboarding — DB CHÍNH (Supabase)
    const { error: profileErr, data: profileData } = await supabase
      .from('profiles')
      .update({ selected_languages: parsed.data.languages, onboarded: true, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select();

    if (profileErr) {
      console.error('[onboarding] Lỗi update profiles:', profileErr);
      return { error: `Lỗi lưu hồ sơ: ${profileErr.message}` };
    }
    if (!profileData || profileData.length === 0) {
      // Update chạy thành công nhưng KHÔNG có dòng nào khớp — thường do RLS
      // chặn (auth.uid() không khớp id) hoặc chưa tồn tại profile cho user
      // này (trigger tạo profile lúc đăng ký chưa chạy / bị lỗi).
      return {
        error:
          'Không tìm thấy hồ sơ để cập nhật (có thể do RLS chặn, hoặc dòng profiles chưa được tạo cho tài khoản này). Kiểm tra bảng profiles có dòng ứng với user_id này không.',
      };
    }

    // 2) Khởi tạo dòng tiến độ (level/xp/streak = 0) cho từng ngôn ngữ đã chọn
    //    Dùng upsert để bấm lại onboarding không tạo trùng dòng.
    const rows = parsed.data.languages.map((lang) => ({
      user_id: user.id,
      lang_code: lang,
      level: 0,
      xp: 0,
      streak: 0,
    }));
    const { error: progressErr } = await supabase
      .from('user_progress')
      .upsert(rows, { onConflict: 'user_id,lang_code', ignoreDuplicates: true });

    if (progressErr) {
      console.error('[onboarding] Lỗi upsert user_progress:', progressErr);
      return { error: `Lỗi lưu tiến độ: ${progressErr.message}` };
    }
  } catch (err) {
    // Next.js dùng exception để triển khai redirect() — phải re-throw đúng
    // loại lỗi đó, không được nuốt mất, nếu không redirect sẽ không hoạt động.
    if (err && typeof err === 'object' && 'digest' in err && typeof (err as { digest?: unknown }).digest === 'string' && (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('[onboarding] Lỗi không lường trước:', err);
    return { error: `Lỗi hệ thống: ${err instanceof Error ? err.message : String(err)}` };
  }

  redirect('/dashboard');
}
