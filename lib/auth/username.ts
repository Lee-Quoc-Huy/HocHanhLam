/**
 * Supabase Auth (gói email/password) bắt buộc phải có 1 địa chỉ email hợp lệ
 * về mặt cú pháp, dù bạn chỉ muốn người dùng đăng nhập bằng "tên đăng nhập".
 * Giải pháp: quy đổi tên đăng nhập thành 1 email "giả" duy nhất theo tên đó
 * (không cần hộp thư thật vì đã tắt xác nhận email trong Supabase Dashboard).
 *
 * QUAN TRỌNG: bạn phải vào Supabase Dashboard → Authentication → Providers →
 * Email → tắt "Confirm email", nếu không người dùng sẽ bị kẹt ở bước xác
 * nhận vì hộp thư giả này không có thật để nhận mail.
 */
const USERNAME_DOMAIN = 'users.hochanhlam.local';

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

export function validateUsername(username: string): string | null {
  const u = username.trim();
  if (!u) return 'Nhập tên đăng nhập nhé.';
  if (!USERNAME_REGEX.test(u)) {
    return 'Tên đăng nhập chỉ gồm chữ cái, số, dấu gạch dưới (_), dài 3-20 ký tự, không dấu.';
  }
  return null;
}
