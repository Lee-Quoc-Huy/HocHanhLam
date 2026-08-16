import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client dùng ở phía trình duyệt (Client Components).
 * Đây là DB CHÍNH: auth + tiến độ học tập của người dùng.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
