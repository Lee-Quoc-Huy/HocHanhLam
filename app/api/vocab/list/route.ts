import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

const querySchema = z.object({ lang: z.enum(['en', 'kr', 'cn', 'jp']) });

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ lang: searchParams.get('lang') });
  if (!parsed.success) return NextResponse.json({ error: 'Ngôn ngữ không hợp lệ' }, { status: 400 });

  const supabase = createClient();
  // RLS tự lọc theo auth.uid(), thêm .eq('user_id', ...) tường minh để rõ ràng.
  const { data, error } = await supabase
    .from('user_vocab')
    .select('id, term, pronunciation, meaning, tag')
    .eq('user_id', user.id)
    .eq('lang_code', parsed.data.lang);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vocab: data });
}
