import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { usernameToEmail, validateUsername } from '@/lib/auth/username';

const bodySchema = z.object({
  username: z.string(),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });

  const usernameErr = validateUsername(parsed.data.username);
  if (usernameErr) return NextResponse.json({ error: usernameErr }, { status: 400 });

  const username = parsed.data.username.trim();

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: 'Server chưa cấu hình SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    );
  }

  const { error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password: parsed.data.password,
    email_confirm: true, // tạo thẳng ở trạng thái đã xác nhận — không gửi email nào
    user_metadata: { username, display_name: username },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
      return NextResponse.json({ error: 'Tên đăng nhập này đã có người dùng, thử tên khác nhé.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Không tạo được tài khoản, thử lại sau.', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
