'use client';

import { useEffect, useState } from 'react';
import { LANGS, type LangCode } from '@/lib/nav';

type Vocab = { id: string; term: string; pronunciation: string | null; meaning: string; tag: string | null };
type FillQ = { id: number; question: string; options: string[]; answer_index: number };
type ReadQ = { id: number; passage: string; question: string; options: string[]; answer_index: number };

export default function GamesClient({ selectedLanguages }: { selectedLanguages: LangCode[] }) {
  const langs = selectedLanguages.length > 0 ? selectedLanguages : (Object.keys(LANGS) as LangCode[]);
  const [lang, setLang] = useState<LangCode>(langs[0]);
  const [mode, setMode] = useState<null | 'flash' | 'fill' | 'read'>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h1 className="font-display text-lg font-bold">🎮 Ôn tập & Trò chơi</h1>
        <span className="glass-strong rounded-full px-3 py-1.5 text-[12.5px] font-semibold">{LANGS[lang].flag} {LANGS[lang].name}</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {langs.map((k) => (
          <button key={k} onClick={() => { setLang(k); setMode(null); }} className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold border"
            style={lang === k ? { background: LANGS[k].color, color: '#101014', borderColor: 'transparent' } : { background: 'var(--glass-strong)', color: 'var(--ink-dim)', borderColor: 'var(--glass-border)' }}>
            {LANGS[k].flag} {LANGS[k].name}
          </button>
        ))}
      </div>

      {!mode && (
        <div className="grid md:grid-cols-3 gap-4">
          <Tile icon="🃏" bg="rgba(149,106,214,.2)" title="Flashcard" desc="Ôn từ vựng bạn đã lưu, lật thẻ ghi nhớ." onClick={() => setMode('flash')} />
          <Tile icon="✏️" bg="rgba(112,194,180,.2)" title="Hoàn thành câu" desc="AI tạo câu thiếu từ theo cấp độ, chọn 1/4 đáp án." onClick={() => setMode('fill')} />
          <Tile icon="📖" bg="rgba(240,189,116,.2)" title="Đọc hiểu" desc="Đọc đoạn văn ngắn và trả lời câu hỏi." onClick={() => setMode('read')} />
        </div>
      )}

      {mode === 'flash' && <FlashcardGame lang={lang} onExit={() => setMode(null)} />}
      {mode === 'fill' && <QuizGame lang={lang} type="fillblank" onExit={() => setMode(null)} />}
      {mode === 'read' && <QuizGame lang={lang} type="reading" onExit={() => setMode(null)} />}
    </div>
  );
}

function Tile({ icon, bg, title, desc, onClick }: { icon: string; bg: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass p-5.5 text-left hover:-translate-y-1 transition-transform">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] mb-3.5" style={{ background: bg }}>{icon}</div>
      <h4 className="font-bold text-[15.5px] mb-1">{title}</h4>
      <p className="text-[12.5px] text-inkfaint leading-relaxed">{desc}</p>
    </button>
  );
}

async function reportCompletion(lang: LangCode, gameType: string, total: number, correct: number) {
  try {
    const res = await fetch('/api/progress/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, gameType, total, correct }),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function FlashcardGame({ lang, onExit }: { lang: LangCode; onExit: () => void }) {
  const [pool, setPool] = useState<Vocab[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/vocab/list?lang=${lang}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.vocab || d.vocab.length === 0) { setError('Chưa có từ vựng cho ngôn ngữ này — hãy thêm từ ở mục Từ vựng trước nhé.'); return; }
        setPool([...d.vocab].sort(() => Math.random() - 0.5));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  if (error) return <ErrorBox msg={error} onExit={onExit} />;
  if (!pool) return <LoadingBox />;

  const item = pool[idx % pool.length];

  async function finish() {
    setDone(true);
    await reportCompletion(lang, 'flashcard', pool!.length, pool!.length);
  }

  if (done) return <DoneBox onExit={onExit} text={`Đã ôn xong ${pool.length} thẻ! +XP đã được cộng.`} />;

  return (
    <div className="glass p-7">
      <GameHud left={`Thẻ ${(idx % pool.length) + 1}/${pool.length}`} onExit={onExit} />
      <div
        className="mx-auto max-w-[420px] h-[250px] cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="relative w-full h-full transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
          <div className="absolute inset-0 rounded-[22px] flex flex-col items-center justify-center gap-2.5 text-center p-5 border border-white/10" style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, rgba(149,106,214,.35), rgba(241,121,184,.28))' }}>
            <span className="font-display text-[26px] font-bold">{item.term}</span>
            <span className="text-[13px] text-inkdim">{item.pronunciation}</span>
          </div>
          <div className="absolute inset-0 rounded-[22px] flex flex-col items-center justify-center gap-2.5 text-center p-5 border border-white/10" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, rgba(112,194,180,.32), rgba(240,189,116,.26))' }}>
            <span className="font-display text-[20px] font-bold">{item.meaning}</span>
            <span className="text-[13px] text-inkdim">{item.tag}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-6">
        <button onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); }} className="glass-strong rounded-full px-5 py-2.5 text-[13.5px] font-semibold">← Trước</button>
        {idx < pool.length - 1 ? (
          <button onClick={() => { setIdx((i) => i + 1); setFlipped(false); }} className="btn-primary text-white rounded-full px-5 py-2.5 text-[13.5px] font-semibold">Tiếp theo →</button>
        ) : (
          <button onClick={finish} className="btn-primary text-white rounded-full px-5 py-2.5 text-[13.5px] font-semibold">Hoàn thành ✓</button>
        )}
      </div>
    </div>
  );
}

function QuizGame({ lang, type, onExit }: { lang: LangCode; type: 'fillblank' | 'reading'; onExit: () => void }) {
  const [items, setItems] = useState<(FillQ | ReadQ)[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/games/questions?type=${type}&lang=${lang}&count=8`)
      .then((r) => r.json())
      .then((d) => {
        const list = type === 'fillblank' ? d.questions : d.passages;
        if (!list || list.length === 0) { setError('Chưa có dữ liệu câu hỏi cho ngôn ngữ này trong DB nội dung.'); return; }
        setItems(list);
      })
      .catch(() => setError('Không tải được câu hỏi. Kiểm tra kết nối NEON_DATABASE_URL.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, type]);

  if (error) return <ErrorBox msg={error} onExit={onExit} />;
  if (!items) return <LoadingBox />;

  const item = items[idx];
  const isRead = 'passage' in item;

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === item.answer_index) setScore((s) => s + 1);
    setTimeout(async () => {
      if (idx < items!.length - 1) {
        setIdx((n) => n + 1);
        setPicked(null);
      } else {
        setDone(true);
        await reportCompletion(lang, type, items!.length, score + (i === item.answer_index ? 1 : 0));
      }
    }, 850);
  }

  if (done) return <DoneBox onExit={onExit} text={`Kết quả: ${score}/${items.length} câu đúng! +XP đã được cộng.`} />;

  return (
    <div className="glass p-7">
      <GameHud left={`Câu ${idx + 1}/${items.length}`} right={`✅ ${score} đúng`} onExit={onExit} />
      {isRead && (
        <div className="glass-strong rounded-2xl p-4 mb-4.5 text-[14px] leading-relaxed text-inkdim">{(item as ReadQ).passage}</div>
      )}
      <div className="text-[16.5px] font-semibold mb-5 leading-relaxed">{item.question}</div>
      <div className="grid md:grid-cols-2 gap-3">
        {item.options.map((o, i) => {
          let cls = 'bg-white/[.09] border-white/10';
          if (picked !== null) {
            if (i === item.answer_index) cls = 'bg-sage/35 border-sage';
            else if (i === picked) cls = 'bg-terracotta/35 border-terracotta';
          }
          return (
            <button key={i} onClick={() => choose(i)} className={`rounded-2xl p-4 text-left text-[14px] font-semibold border transition-colors ${cls}`}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GameHud({ left, right, onExit }: { left: string; right?: string; onExit: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-2.5">
      <span className="glass-strong rounded-full px-3 py-1.5 text-[12.5px] font-semibold">{left}</span>
      {right && <span className="glass-strong rounded-full px-3 py-1.5 text-[12.5px] font-semibold">{right}</span>}
      <button onClick={onExit} className="glass-strong rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ml-auto">✕ Thoát</button>
    </div>
  );
}
function LoadingBox() {
  return <div className="glass p-12 text-center text-inkfaint text-[13.5px]">Đang tải nội dung...</div>;
}
function ErrorBox({ msg, onExit }: { msg: string; onExit: () => void }) {
  return (
    <div className="glass p-10 text-center">
      <div className="text-2xl mb-3">⚠️</div>
      <p className="text-[13.5px] text-inkdim mb-4">{msg}</p>
      <button onClick={onExit} className="glass-strong rounded-full px-5 py-2.5 text-[13px] font-semibold">Quay lại</button>
    </div>
  );
}
function DoneBox({ text, onExit }: { text: string; onExit: () => void }) {
  return (
    <div className="glass p-12 text-center">
      <div className="text-3xl mb-3">🎉</div>
      <p className="text-[14.5px] font-semibold mb-5">{text}</p>
      <button onClick={onExit} className="btn-primary text-white rounded-full px-6 py-2.5 text-[13.5px] font-semibold">Quay lại danh sách trò chơi</button>
    </div>
  );
}
