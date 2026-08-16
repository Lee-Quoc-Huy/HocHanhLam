import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * DB PHỤ (Neon) — chỉ chứa nội dung tĩnh dùng chung cho mọi người dùng:
 * danh sách ngôn ngữ/cấp độ, ngân hàng câu hỏi trò chơi, từ điển mẫu.
 * Không có dữ liệu cá nhân ở đây, nên không cần RLS — nhưng mọi câu lệnh
 * vẫn dùng tagged template (tự động parameterize) để tránh SQL injection
 * nếu sau này có tham số do người dùng nhập (vd tìm kiếm topic).
 *
 * QUAN TRỌNG: kết nối được khởi tạo LƯỜI (lazy) — chỉ tạo khi có request
 * thực sự gọi tới, không phải lúc Next.js build/thu thập thông tin route.
 * Nếu tạo ngay ở top-level module, build trên Vercel sẽ SẬP nếu thiếu biến
 * môi trường NEON_DATABASE_URL (dù route đó chưa hề được gọi).
 */
let sqlClient: NeonQueryFunction<false, false> | null = null;
function getSql() {
  if (!sqlClient) {
    const url = process.env.NEON_DATABASE_URL;
    if (!url) throw new Error('Thiếu biến môi trường NEON_DATABASE_URL');
    sqlClient = neon(url);
  }
  return sqlClient;
}

export type LanguageMeta = {
  code: 'en' | 'kr' | 'cn' | 'jp';
  name: string;
  track: string;
  flag: string;
  levels: string[];
};

export async function getLanguages(): Promise<LanguageMeta[]> {
  const sql = getSql();
  const rows = await sql`select code, name, track, flag, levels from languages`;
  return rows as LanguageMeta[];
}

export async function getFillBlankQuestions(langCode: string, level: number, limit = 10) {
  const sql = getSql();
  return sql`
    select id, question, options, answer_index
    from fillblank_questions
    where lang_code = ${langCode} and level <= ${level}
    order by random()
    limit ${limit}
  `;
}

export async function getReadingPassages(langCode: string, level: number, limit = 5) {
  const sql = getSql();
  return sql`
    select id, passage, question, options, answer_index
    from reading_passages
    where lang_code = ${langCode} and level <= ${level}
    order by random()
    limit ${limit}
  `;
}

export async function getTopics(langCode: string) {
  const sql = getSql();
  return sql`select id, name, level from topics where lang_code = ${langCode} order by level asc`;
}

export async function translateSeed(phraseVi: string, targetLang: 'en' | 'kr' | 'cn' | 'jp') {
  const sql = getSql();
  // Tên cột phải lấy từ allowlist cố định (không nội suy chuỗi do người dùng
  // nhập vào tên cột SQL, kể cả khi type đã ràng buộc) để tránh injection.
  const rows = await sql`
    select en, kr, cn, jp
    from dictionary_seed
    where lower(phrase_vi) = lower(${phraseVi})
    limit 1
  `;
  const row = rows[0] as Record<string, string> | undefined;
  if (!row) return undefined;
  const allowlist = { en: row.en, kr: row.kr, cn: row.cn, jp: row.jp } as const;
  return allowlist[targetLang];
}
