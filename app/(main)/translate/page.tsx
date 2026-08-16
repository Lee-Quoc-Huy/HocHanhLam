'use client';

import { useState } from 'react';
import { LANGS, type LangCode } from '@/lib/nav';

export default function TranslatePage() {
  const [input, setInput] = useState('Xin chào');
  const [target, setTarget] = useState<LangCode>('en');
  const [output, setOutput] = useState('');
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTranslate() {
    if (!input.trim()) return;
    setLoading(true); setError(null); setOutput('');
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, targetLang: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Dịch thất bại');
      setOutput(data.translation);
      setSource(data.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-lg font-bold">🌐 Dịch thuật</h1>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3.5 items-stretch">
        <div className="glass p-5 flex flex-col gap-3 min-h-[200px]">
          <div className="font-bold text-[13.5px]">🇻🇳 Tiếng Việt</div>
          <textarea className="flex-1 bg-transparent outline-none text-[15px] resize-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập nội dung cần dịch..." />
        </div>
        <button onClick={handleTranslate} className="glass-strong self-center w-11 h-11 rounded-full text-[16px] md:rotate-0 rotate-90" title="Dịch">⇄</button>
        <div className="glass p-5 flex flex-col gap-3 min-h-[200px]">
          <div className="font-bold text-[13.5px]">{LANGS[target].flag} {LANGS[target].name}</div>
          <div className="flex-1 text-[15px] text-inkdim">
            {loading ? 'Đang dịch...' : output || <span className="text-inkfaint">Kết quả dịch sẽ hiện ở đây...</span>}
          </div>
          {source && !loading && <div className="text-[11px] text-inkfaint">Nguồn: {source === 'dictionary' ? 'từ điển mẫu' : `AI (${source})`}</div>}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mt-4">
        {(Object.keys(LANGS) as LangCode[]).map((k) => (
          <button
            key={k}
            onClick={() => setTarget(k)}
            className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold border"
            style={target === k ? { background: LANGS[k].color, color: '#101014', borderColor: 'transparent' } : { background: 'var(--glass-strong)', color: 'var(--ink-dim)', borderColor: 'var(--glass-border)' }}
          >
            {LANGS[k].flag} {LANGS[k].name}
          </button>
        ))}
      </div>

      {error && <p className="text-[13px] text-terracotta mt-3">{error}</p>}

      <button onClick={handleTranslate} disabled={loading} className="btn-primary text-white font-semibold text-[14px] rounded-full px-6 py-3 mt-5 disabled:opacity-60">
        {loading ? 'Đang dịch...' : 'Dịch ngay'}
      </button>

      <div className="glass p-5 mt-6">
        <p className="text-[12.5px] text-inkfaint leading-relaxed">
          💡 Bản dịch ưu tiên tra nhanh trong từ điển mẫu (Neon). Nếu không có sẵn, hệ thống gọi AI dịch thật theo thứ tự
          Groq Qwen → Gemini Flash-Lite → OpenRouter (xem <code>lib/ai/router.ts</code>). Nếu chưa cấu hình API key nào,
          bạn sẽ nhận được thông báo hướng dẫn thay vì lỗi trắng trang.
        </p>
      </div>
    </div>
  );
}
