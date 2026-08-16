import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client dùng ở phía server (Server Components, Server Actions,
 * Route Handlers). Luôn dùng client này khi cần xác thực người dùng thật —
 * KHÔNG bao giờ tin dữ liệu user_id gửi từ client, luôn lấy từ session.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Được gọi từ Server Component (không được set cookie) — bỏ qua,
            // middleware sẽ đảm nhiệm việc refresh session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // như trên
          }
        },
      },
    }
  );
}

/** Lấy user hiện tại từ session server-side. Trả về null nếu chưa đăng nhập. */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
