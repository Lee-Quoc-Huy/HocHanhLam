import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { callGeminiVision } from '@/lib/ai/providers/gemini';

export const runtime = 'nodejs';

const langEnum = z.enum(['en', 'kr', 'cn', 'jp']);

const VISION_SYSTEM_PROMPT =
  'Bạn là trợ lý trích xuất từ vựng từ ảnh chụp sách/vở tiếng nước ngoài. ' +
  'Chỉ trả về JSON hợp lệ, không thêm giải thích, không dùng markdown code fence.';

const itemSchema = z.object({
  term: z.string().min(1).max(120),
  pron: z.string().max(120).optional().default(''),
  mean: z.string().min(1).max(300),
  tag: z.string().max(60).optional().default('AI phân loại từ ảnh'),
});
const responseSchema = z.array(itemSchema).max(50);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const form = await req.formData();
  const lang = langEnum.safeParse(form.get('lang'));
  const file = form.get('image');

  if (!lang.success) return NextResponse.json({ error: 'Ngôn ngữ không hợp lệ' }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: 'Thiếu file ảnh' }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return NextResponse.json({ error: 'Ảnh vượt quá 6MB' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'File phải là ảnh' }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString('base64');

  const instruction =
    `Đọc chữ trong ảnh (ngôn ngữ đích: ${lang.data}) và trích ra tối đa 20 từ vựng. ` +
    `Trả về JSON dạng mảng, mỗi phần tử có các trường: term (từ gốc), pron (phiên âm nếu có, có thể để rỗng), ` +
    `mean (nghĩa tiếng Việt), tag (phân loại ngắn, ví dụ loại từ hoặc chủ đề).`;

  let text: string;
  try {
    text = await callGeminiVision(
      process.env.GEMINI_MODEL_FLASH_LITE || 'gemini-2.5-flash-lite',
      VISION_SYSTEM_PROMPT,
      base64,
      file.type,
      instruction
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI đọc ảnh thất bại. Kiểm tra GOOGLE_AI_STUDIO_API_KEY.' },
      { status: 502 }
    );
  }

  let items: z.infer<typeof responseSchema>;
  try {
    const cleaned = text.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
    items = responseSchema.parse(JSON.parse(cleaned));
  } catch {
    return NextResponse.json({ error: 'AI trả về định dạng không đọc được, thử lại với ảnh rõ hơn.' }, { status: 502 });
  }

  if (items.length === 0) return NextResponse.json({ error: 'Không nhận diện được từ vựng nào trong ảnh' }, { status: 422 });

  const supabase = createClient();
  const { error } = await supabase.from('user_vocab').insert(
    items.map((it) => ({
      user_id: user.id,
      lang_code: lang.data,
      term: it.term,
      pronunciation: it.pron || null,
      meaning: it.mean,
      tag: it.tag,
      source: 'photo',
    }))
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ imported: items.length });
}
