'use client';

import { useMemo, useState, useTransition } from 'react';
import { LANGS, type LangCode } from '@/lib/nav';
import { addVocabManual, deleteVocab, importVocabCsv } from './actions';

type VocabRow = {
  id: string;
  lang_code: LangCode;
  term: string;
  pronunciation: string | null;
  meaning: string;
  tag: string | null;
  source: string;
};

export default function VocabClient({
  selectedLanguages,
  initialVocab,
}: {
  selectedLanguages: LangCode[];
  initialVocab: VocabRow[];
}) {
  const [vocab, setVocab] = useState(initialVocab);
  const [filter, setFilter] = useState<'all' | LangCode>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<null | 'manual' | 'sheet' | 'photo'>(null);
  const [pending, startTransition] = useTransition();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const langs = selectedLanguages.length > 0 ? selectedLanguages : (Object.keys(LANGS) as LangCode[]);

  const filtered = useMemo(() => {
    return vocab.filter((v) => {
      if (filter !== 'all' && v.lang_code !== filter) return false;
      if (query && !`${v.term} ${v.meaning}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [vocab, filter, query]);

  function notify(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  }

  async function handleDelete(id: string) {
    setVocab((prev) => prev.filter((v) => v.id !== id));
    startTransition(async () => {
      try {
        await deleteVocab(id);
      } catch {
        notify('Xoá thất bại, thử lại nhé');
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h1 className="font-display text-lg font-bold">📚 Từ vựng của tôi</h1>
        <button onClick={() => setModal('manual')} className="btn-primary text-white font-semibold text-[13.5px] rounded-full px-5 py-2.5">
          + Thêm từ vựng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <button onClick={() => setModal('sheet')} className="glass p-4.5 text-center border border-dashed border-white/15 hover:border-purple transition-colors">
          <div className="text-2xl mb-2">📄</div>
          <div className="font-bold text-[13.5px]">Tải file Sheet</div>
          <div className="text-[11.5px] text-inkfaint mt-1">Dán nội dung CSV để nhập nhanh</div>
        </button>
        <button onClick={() => setModal('photo')} className="glass p-4.5 text-center border border-dashed border-white/15 hover:border-purple transition-colors">
          <div className="text-2xl mb-2">📷</div>
          <div className="font-bold text-[13.5px]">Chụp ảnh để AI đọc</div>
          <div className="text-[11.5px] text-inkfaint mt-1">AI tự nhận diện & phân loại</div>
        </button>
        <button onClick={() => setModal('manual')} className="glass p-4.5 text-center border border-dashed border-white/15 hover:border-purple transition-colors">
          <div className="text-2xl mb-2">✍️</div>
          <div className="font-bold text-[13.5px]">Nhập tay</div>
          <div className="text-[11.5px] text-inkfaint mt-1">Tự soạn từng từ</div>
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Tất cả</Chip>
        {langs.map((k) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>
            {LANGS[k].flag} {LANGS[k].name}
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <input className="field flex-1 min-w-[180px]" placeholder="Tìm từ vựng..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="glass-strong rounded-full p-1 border border-white/10 flex">
          <button onClick={() => setView('grid')} className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold ${view === 'grid' ? 'btn-primary text-white' : 'text-inkdim'}`}>⬛ Lưới</button>
          <button onClick={() => setView('list')} className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold ${view === 'list' ? 'btn-primary text-white' : 'text-inkdim'}`}>☰ Dọc</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="text-3xl mb-2.5">🌙</div>
          <h3 className="font-semibold mb-1.5">Chưa có từ vựng nào</h3>
          <p className="text-inkfaint text-[13.5px]">Thêm từ đầu tiên để bắt đầu ôn tập cùng AI.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))' }}>
          {filtered.map((v) => (
            <div key={v.id} className="glass p-4 flex flex-col gap-1.5 group relative">
              <div className="flex justify-between items-start">
                <span className="font-display font-bold text-[16px]">{v.term}</span>
                <span className="glass-strong rounded-full px-2 py-0.5 text-[11px]">{LANGS[v.lang_code].flag}</span>
              </div>
              {v.pronunciation && <span className="text-[12px] text-inkfaint">{v.pronunciation}</span>}
              <span className="text-[13.5px] text-inkdim mt-1">{v.meaning}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="glass-strong rounded-full px-2.5 py-0.5 text-[11px] font-semibold">{v.tag}</span>
                <button onClick={() => handleDelete(v.id)} className="text-inkfaint hover:text-terracotta text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">Xoá</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((v) => (
            <div key={v.id} className="glass flex items-center gap-4 px-4 py-3.5">
              <span className="glass-strong rounded-full px-2 py-0.5 text-[12px]">{LANGS[v.lang_code].flag}</span>
              <span className="font-bold text-[15px] min-w-[100px]">{v.term}</span>
              <span className="flex-1 text-[13.5px] text-inkdim">{v.meaning}</span>
              <span className="glass-strong rounded-full px-2.5 py-0.5 text-[11px] font-semibold">{v.tag}</span>
              <button onClick={() => handleDelete(v.id)} className="text-inkfaint hover:text-terracotta text-[12px]">Xoá</button>
            </div>
          ))}
        </div>
      )}

      {modal === 'manual' && (
        <ManualModal langs={langs} onClose={() => setModal(null)} onSaved={(row) => { setVocab((p) => [row, ...p]); setModal(null); notify('Đã lưu từ vựng mới ✅'); }} />
      )}
      {modal === 'sheet' && (
        <SheetModal langs={langs} onClose={() => setModal(null)} onImported={(n) => { setModal(null); notify(`Đã nhập ${n} từ từ Sheet ✅`); window.location.reload(); }} />
      )}
      {modal === 'photo' && (
        <PhotoModal langs={langs} onClose={() => setModal(null)} onImported={(n) => { setModal(null); notify(`AI đã nhận diện ${n} từ từ ảnh 🤖`); window.location.reload(); }} />
      )}

      {toastMsg && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 glass glass-strong px-5 py-3 text-[13.5px] font-semibold z-50">
          {toastMsg}
        </div>
      )}
      {pending && null}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold border"
      style={active ? { background: 'var(--teal)', color: '#0c1512', borderColor: 'transparent' } : { background: 'var(--glass-strong)', color: 'var(--ink-dim)', borderColor: 'var(--glass-border)' }}
    >
      {children}
    </button>
  );
}

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass glass-strong w-full max-w-[440px] p-6 max-h-[86vh] overflow-y-auto">{children}</div>
    </div>
  );
}

function LangSelect({ langs, value, onChange }: { langs: LangCode[]; value: LangCode; onChange: (v: LangCode) => void }) {
  return (
    <select className="field" value={value} onChange={(e) => onChange(e.target.value as LangCode)}>
      {langs.map((k) => (
        <option key={k} value={k}>{LANGS[k].flag} {LANGS[k].name}</option>
      ))}
    </select>
  );
}

function ManualModal({ langs, onClose, onSaved }: { langs: LangCode[]; onClose: () => void; onSaved: (row: VocabRow) => void }) {
  const [lang, setLang] = useState<LangCode>(langs[0]);
  const [term, setTerm] = useState('');
  const [pron, setPron] = useState('');
  const [mean, setMean] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!term.trim() || !mean.trim()) { setError('Điền đủ từ vựng và nghĩa nhé'); return; }
    setSaving(true);
    setError(null);
    const fd = new FormData();
    fd.set('lang', lang); fd.set('term', term); fd.set('pron', pron); fd.set('mean', mean); fd.set('tag', tag);
    try {
      await addVocabManual(fd);
      onSaved({ id: crypto.randomUUID(), lang_code: lang, term, pronunciation: pron || null, meaning: mean, tag: tag || 'Chưa phân loại', source: 'manual' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <h3 className="font-bold text-[17px] mb-4">✍️ Thêm từ vựng</h3>
      <div className="flex flex-col gap-3.5">
        <LangSelect langs={langs} value={lang} onChange={setLang} />
        <div className="grid grid-cols-2 gap-2.5">
          <input className="field" placeholder="Từ vựng" value={term} onChange={(e) => setTerm(e.target.value)} />
          <input className="field" placeholder="Phiên âm" value={pron} onChange={(e) => setPron(e.target.value)} />
        </div>
        <input className="field" placeholder="Nghĩa tiếng Việt" value={mean} onChange={(e) => setMean(e.target.value)} />
        <input className="field" placeholder="Phân loại (VD: Động từ)" value={tag} onChange={(e) => setTag(e.target.value)} />
        {error && <p className="text-[13px] text-terracotta">{error}</p>}
        <div className="flex justify-end gap-2.5 mt-1">
          <button onClick={onClose} className="glass-strong rounded-full px-4 py-2 text-[13px] font-semibold">Huỷ</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-white rounded-full px-4 py-2 text-[13px] font-semibold disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu từ'}</button>
        </div>
      </div>
    </ModalShell>
  );
}

function SheetModal({ langs, onClose, onImported }: { langs: LangCode[]; onClose: () => void; onImported: (n: number) => void }) {
  const [lang, setLang] = useState<LangCode>(langs[0]);
  const [csv, setCsv] = useState('dedicate,/ˈdɛdɪkeɪt/,cống hiến,Động từ\ncollaborate,/kəˈlæbəreɪt/,hợp tác,Động từ');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleImport() {
    setSaving(true); setError(null);
    try {
      const n = await importVocabCsv(lang, csv);
      onImported(n);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nhập thất bại');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <h3 className="font-bold text-[17px] mb-2">📄 Tải file Sheet</h3>
      <p className="text-[12.5px] text-inkfaint mb-3">
        Dán nội dung CSV, mỗi dòng: <code>từ,phiên âm,nghĩa,phân loại</code>. (Bản đầy đủ hỗ trợ tải file .csv/.xlsx trực tiếp qua Cloudflare — hiện dán nội dung để nhập nhanh.)
      </p>
      <div className="flex flex-col gap-3">
        <LangSelect langs={langs} value={lang} onChange={setLang} />
        <textarea className="field font-mono text-[12.5px]" rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} />
        {error && <p className="text-[13px] text-terracotta">{error}</p>}
        <div className="flex justify-end gap-2.5">
          <button onClick={onClose} className="glass-strong rounded-full px-4 py-2 text-[13px] font-semibold">Huỷ</button>
          <button onClick={handleImport} disabled={saving} className="btn-primary text-white rounded-full px-4 py-2 text-[13px] font-semibold disabled:opacity-60">{saving ? 'Đang nhập...' : 'Nhập dữ liệu'}</button>
        </div>
      </div>
    </ModalShell>
  );
}

function PhotoModal({ langs, onClose, onImported }: { langs: LangCode[]; onClose: () => void; onImported: (n: number) => void }) {
  const [lang, setLang] = useState<LangCode>(langs[0]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!file) { setError('Chọn một ảnh trước đã'); return; }
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.set('lang', lang); fd.set('image', file);
      const res = await fetch('/api/vocab/import-photo', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI đọc ảnh thất bại');
      onImported(data.imported);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <h3 className="font-bold text-[17px] mb-2">📷 Chụp ảnh để AI đọc</h3>
      <p className="text-[12.5px] text-inkfaint mb-3">
        AI (Gemini 2.5 Flash-Lite) sẽ đọc chữ trong ảnh và tự tách từ vựng + phân loại. Cần cấu hình GOOGLE_AI_STUDIO_API_KEY trên server để tính năng này hoạt động.
      </p>
      <div className="flex flex-col gap-3">
        <LangSelect langs={langs} value={lang} onChange={setLang} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-[13px]" />
        {error && <p className="text-[13px] text-terracotta">{error}</p>}
        <div className="flex justify-end gap-2.5">
          <button onClick={onClose} className="glass-strong rounded-full px-4 py-2 text-[13px] font-semibold">Huỷ</button>
          <button onClick={handleImport} disabled={loading} className="btn-primary text-white rounded-full px-4 py-2 text-[13px] font-semibold disabled:opacity-60">{loading ? 'AI đang đọc ảnh...' : 'Nhập bằng AI'}</button>
        </div>
      </div>
    </ModalShell>
  );
}
