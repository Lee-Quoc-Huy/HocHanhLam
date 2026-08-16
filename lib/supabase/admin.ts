import { createClient } from '@supabase/supabase-js';

/**
 * Client "admin" — CHỈ được import trong Route Handler chạy trên server
 * (không bao giờ trong Client Component). Dùng service_role key có toàn
 * quyền, bỏ qua RLS.
 *
 * Lý do cần client riêng này: `supabase.auth.signUp()` phía client luôn cố
 * gửi 1 email (xác nhận hoặc thông báo) dù bạn có tắt "Confirm email" hay
 * không, và dịch vụ email miễn phí mặc định của Supabase rất dễ bị giới hạn
 * (rate limit) khi test nhiều lần liên tiếp.
 * `admin.createUser({ email_confirm: true })` tạo thẳng tài khoản đã ở
 * trạng thái "đã xác nhận", không gửi bất kỳ email nào — đúng nhu cầu
 * "chỉ cần tên đăng nhập + mật khẩu".
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
