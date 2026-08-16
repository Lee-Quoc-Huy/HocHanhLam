import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { getLanguages } from '@/lib/neon/db';
import { LANGS, type LangCode } from '@/lib/nav';
import OrbitBoard from './OrbitBoard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const supabase = createClient();

  const [{ data: profile }, { data: progressRows }, neonLangs] = await Promise.all([
    supabase.from('profiles').select('selected_languages').eq('id', user!.id).single(),
    supabase.from('user_progress').select('lang_code, level, xp, streak').eq('user_id', user!.id),
    getLanguages().catch(() => []), // DB phụ (Neon) — nếu chưa cấu hình NEON_DATABASE_URL, vẫn không sập trang
  ]);

  const selected = (profile?.selected_languages ?? []) as LangCode[];
  const progress = new Map((progressRows ?? []).map((r) => [r.lang_code as LangCode, r]));
  const neonMeta = new Map(neonLangs.map((l) => [l.code, l]));

  const { data: vocabCounts } = await supabase.from('user_vocab').select('lang_code');
  const vocabCountByLang = (vocabCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.lang_code] = (acc[r.lang_code] ?? 0) + 1;
    return acc;
  }, {});

  if (selected.length === 0) {
    return (
      <div className="glass p-12 text-center">
        <div className="text-3xl mb-3">🌙</div>
        <h3 className="font-semibold mb-1.5">Bạn chưa chọn ngôn ngữ nào để học</h3>
        <p className="text-inkfaint text-[13.5px]">Vào phần hồ sơ để chọn lại ngôn ngữ bạn muốn theo dõi.</p>
      </div>
    );
  }

  const boardData = selected.map((code) => {
    const p = progress.get(code) ?? { level: 0, xp: 0, streak: 0 };
    const meta = neonMeta.get(code); // tên cấp độ ưu tiên lấy từ Neon (nội dung tĩnh), fallback dữ liệu local
    return {
      code,
      flag: LANGS[code].flag,
      color: LANGS[code].color,
      track: meta?.track ?? LANGS[code].track,
      levelLabel: (meta?.levels as string[] | undefined)?.[p.level] ?? LANGS[code].levels[p.level],
      level: p.level,
      xp: p.xp,
      streak: p.streak,
      vocabCount: vocabCountByLang[code] ?? 0,
    };
  });

  return <OrbitBoard languages={boardData} />;
}
