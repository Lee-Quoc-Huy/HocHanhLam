'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

const langEnum = z.enum(['en', 'kr', 'cn', 'jp']);

const manualSchema = z.object({
  lang: langEnum,
  term: z.string().trim().min(1).max(120),
  pron: z.string().trim().max(120).optional().default(''),
  mean: z.string().trim().min(1).max(300),
  tag: z.string().trim().max(60).optional().default('Chưa phân loại'),
});

export async function addVocabManual(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Chưa đăng nhập');

  const parsed = manualSchema.safeParse({
    lang: formData.get('lang'),
    term: formData.get('term'),
    pron: formData.get('pron'),
    mean: formData.get('mean'),
    tag: formData.get('tag'),
  });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? 'Dữ liệu không hợp lệ');

  const supabase = createClient();
  const { error } = await supabase.from('user_vocab').insert({
    user_id: user.id,
    lang_code: parsed.data.lang,
    term: parsed.data.term,
    pronunciation: parsed.data.pron || null,
    meaning: parsed.data.mean,
    tag: parsed.data.tag,
    source: 'manual',
  });
  if (error) throw new Error(error.message);

  revalidatePath('/vocab');
}

export async function deleteVocab(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Chưa đăng nhập');

  const supabase = createClient();
  // RLS đã chặn user khác xoá dữ liệu người khác, nhưng vẫn lọc user_id
  // tường minh ở đây để rõ ràng và tránh phụ thuộc 100% vào policy.
  const { error } = await supabase.from('user_vocab').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw new Error(error.message);

  revalidatePath('/vocab');
}

const csvRowSchema = z.object({
  lang: langEnum,
  term: z.string().trim().min(1).max(120),
  pron: z.string().trim().max(120).optional().default(''),
  mean: z.string().trim().min(1).max(300),
  tag: z.string().trim().max(60).optional().default('Nhập từ Sheet'),
});

/**
 * Nhập nhanh từ nội dung CSV dán vào (term,pronunciation,meaning,tag).
 * Không cần AI cho bước này — chỉ cần phân tách cột đúng định dạng.
 * Giới hạn 200 dòng/lần để tránh lạm dụng.
 */
export async function importVocabCsv(lang: string, csvText: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Chưa đăng nhập');

  const langParsed = langEnum.safeParse(lang);
  if (!langParsed.success) throw new Error('Ngôn ngữ không hợp lệ');

  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 200);
  const rows: { user_id: string; lang_code: string; term: string; pronunciation: string | null; meaning: string; tag: string; source: string }[] = [];

  for (const line of lines) {
    const cols = line.split(',').map((c) => c.trim());
    const [term, pron, mean, tag] = cols;
    const parsed = csvRowSchema.safeParse({ lang: langParsed.data, term, pron, mean, tag });
    if (!parsed.success) continue; // bỏ qua dòng lỗi, không làm hỏng cả lượt import
    rows.push({
      user_id: user.id,
      lang_code: parsed.data.lang,
      term: parsed.data.term,
      pronunciation: parsed.data.pron || null,
      meaning: parsed.data.mean,
      tag: parsed.data.tag,
      source: 'sheet',
    });
  }

  if (rows.length === 0) throw new Error('Không có dòng hợp lệ nào (định dạng: từ,phiên âm,nghĩa,phân loại)');

  const supabase = createClient();
  const { error } = await supabase.from('user_vocab').insert(rows);
  if (error) throw new Error(error.message);

  revalidatePath('/vocab');
  return rows.length;
}
