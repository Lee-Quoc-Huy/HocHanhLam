'use client';

import { useMemo, useState } from 'react';
import { LANGS, type LangCode } from '@/lib/nav';
import { addGrammarManual, deleteGrammar } from './actions';

type GrammarRow = { id: string; lang_code: LangCode; title: string; explanation: string; tag: string | null };

export default function GrammarClient({ selectedLanguages, initialGrammar }: { selectedLanguages: LangCode[]; initialGrammar: GrammarRow[] }) {
  const [rows, setRows] = useState(initialGrammar);
  const [filter, setFilter] = useState<'all' | LangCode>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const langs = selectedLanguages.length > 0 ? selectedLanguages : (Object.keys(LANGS) as LangCode[]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (filter !== 'all' && r.lang_code !== filter) return false;
    if (query && !`${r.title} ${r.explanation}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [rows, filter, query]);

  function notify(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2600); }

  async function handleDelete(id: string) {
    setRows((p) => p.filter((r) => r.id !== id));
    try { await deleteGrammar(id); } catch { notify('Xoá thất bại'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h1 className="font-display text-lg font-bold">🧩 Ngữ pháp của tôi</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-white font-semibold text-[13.5px] rounded-full px-5 py-2.5">+ Thêm ngữ pháp</button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Tất cả</Chip>
        {langs.map((k) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>{LANGS[k].flag} {LANGS[k].name}</Chip>
        ))}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <input className="field flex-1 min-w-[180px]" placeholder="Tìm ngữ pháp..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="glass-strong rounded-full p-1 border border-white/10 flex">
          <button onClick={() => setView('grid')} className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold ${view === 'grid' ? 'btn-primary text-white' : 'text-inkdim'}`}>⬛ Lưới</button>
          <button onClick={() => setView('list')} className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold ${view === 'list' ? 'btn-primary text-white' : 'text-inkdim'}`}>☰ Dọc</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="text-3xl mb-2.5">🌙</div>
          <h3 className="font-semibold mb-1.5">Chưa có ngữ pháp nào</h3>
          <p className="text-inkfaint text-[13.5px]">Thêm cấu trúc đầu tiên để AI đưa vào bài luyện tập.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))' }}>
          {filtered.map((r) => (
            <div key={r.id} className="glass p-4 flex flex-col gap-1.5 group">
              <div className="flex justify-between items-start">
                <span className="font-display font-bold text-[15px]">{r.title}</span>
                <span className="glass-strong rounded-full px-2 py-0.5 text-[11px]">{LANGS[r.lang_code].flag}</span>
              </div>
              <span className="text-[13.5px] text-inkdim mt-1">{r.explanation}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="glass-strong rounded-full px-2.5 py-0.5 text-[11px] font-semibold">{r.tag}</span>
                <button onClick={() => handleDelete(r.id)} className="text-inkfaint hover:text-terracotta text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">Xoá</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((r) => (
            <div key={r.id} className="glass flex items-center gap-4 px-4 py-3.5">
              <span className="glass-strong rounded-full px-2 py-0.5 text-[12px]">{LANGS[r.lang_code].flag}</span>
              <span className="font-bold text-[15px] min-w-[140px]">{r.title}</span>
              <span className="flex-1 text-[13.5px] text-inkdim">{r.explanation}</span>
              <button onClick={() => handleDelete(r.id)} className="text-inkfaint hover:text-terracotta text-[12px]">Xoá</button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddModal
          langs={langs}
          onClose={() => setModalOpen(false)}
          onSaved={(row) => { setRows((p) => [row, ...p]); setModalOpen(false); notify('Đã lưu ngữ pháp mới ✅'); }}
        />
      )}
      {toastMsg && <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 glass glass-strong px-5 py-3 text-[13.5px] font-semibold z-50">{toastMsg}</div>}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold border"
      style={active ? { background: 'var(--pink)', color: '#2a0f1c', borderColor: 'transparent' } : { background: 'var(--glass-strong)', color: 'var(--ink-dim)', borderColor: 'var(--glass-border)' }}>
      {children}
    </button>
  );
}

function AddModal({ langs, onClose, onSaved }: { langs: LangCode[]; onClose: () => void; onSaved: (row: GrammarRow) => void }) {
  const [lang, setLang] = useState<LangCode>(langs[0]);
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim() || !explanation.trim()) { setError('Điền đủ cấu trúc và giải thích nhé'); return; }
    setSaving(true); setError(null);
    const fd = new FormData();
    fd.set('lang', lang); fd.set('title', title); fd.set('explanation', explanation); fd.set('tag', tag);
    try {
      await addGrammarManual(fd);
      onSaved({ id: crypto.randomUUID(), lang_code: lang, title, explanation, tag: tag || 'Chưa phân loại' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass glass-strong w-full max-w-[440px] p-6">
        <h3 className="font-bold text-[17px] mb-4">✍️ Thêm ngữ pháp</h3>
        <div className="flex flex-col gap-3.5">
          <select className="field" value={lang} onChange={(e) => setLang(e.target.value as LangCode)}>
            {langs.map((k) => <option key={k} value={k}>{LANGS[k].flag} {LANGS[k].name}</option>)}
          </select>
          <input className="field" placeholder="Cấu trúc (VD: used to + V)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="field" rows={3} placeholder="Giải thích cách dùng..." value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          <input className="field" placeholder="Phân loại (VD: Thì)" value={tag} onChange={(e) => setTag(e.target.value)} />
          {error && <p className="text-[13px] text-terracotta">{error}</p>}
          <div className="flex justify-end gap-2.5 mt-1">
            <button onClick={onClose} className="glass-strong rounded-full px-4 py-2 text-[13px] font-semibold">Huỷ</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-white rounded-full px-4 py-2 text-[13px] font-semibold disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu ngữ pháp'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
