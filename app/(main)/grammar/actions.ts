'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

const langEnum = z.enum(['en', 'kr', 'cn', 'jp']);

const manualSchema = z.object({
  lang: langEnum,
  title: z.string().trim().min(1).max(120),
  explanation: z.string().trim().min(1).max(600),
  tag: z.string().trim().max(60).optional().default('Chưa phân loại'),
});

export async function addGrammarManual(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Chưa đăng nhập');

  const parsed = manualSchema.safeParse({
    lang: formData.get('lang'),
    title: formData.get('title'),
    explanation: formData.get('explanation'),
    tag: formData.get('tag'),
  });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Dữ liệu không hợp lệ');

  const supabase = createClient();
  const { error } = await supabase.from('user_grammar').insert({
    user_id: user.id,
    lang_code: parsed.data.lang,
    title: parsed.data.title,
    explanation: parsed.data.explanation,
    tag: parsed.data.tag,
    source: 'manual',
  });
  if (error) throw new Error(error.message);
  revalidatePath('/grammar');
}

export async function deleteGrammar(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Chưa đăng nhập');

  const supabase = createClient();
  const { error } = await supabase.from('user_grammar').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/grammar');
}
