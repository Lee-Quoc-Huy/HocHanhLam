'use client';

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'ai'; content: string };

const QUICK_ASKS = ['Giải thích thì hiện tại hoàn thành', 'Lộ trình học TOPIK I', 'Mẹo nhớ từ vựng HSK1'];

export default function TutorClient({ initialMessages }: { initialMessages: { role: string; content: string }[] }) {
  const [messages, setMessages] = useState<Msg[]>(
    initialMessages.length > 0
      ? (initialMessages as Msg[])
      : [{ role: 'ai', content: 'Chào bạn! Mình là giảng viên AI của Học Hành Lắm 👋 Bạn đang thắc mắc điều gì hôm nay?' }]
  );
  const [mode, setMode] = useState<'short' | 'explain' | 'web'>('short');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setMessages((m) => [...m, { role: 'user', content }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, mode }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'ai', content: res.ok ? data.reply : `Có lỗi xảy ra: ${data.error}` }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', content: 'Không kết nối được máy chủ, thử lại nhé.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4.5 h-[calc(100vh-190px)] min-h-[480px]">
      <div className="md:w-[230px] shrink-0 glass p-4.5 flex md:flex-col gap-2.5 overflow-x-auto">
        <div className="w-full">
          <h4 className="text-[12px] uppercase tracking-wider text-inkfaint mb-1.5 font-bold hidden md:block">Chế độ trả lời</h4>
          <div className="flex md:flex-col gap-2">
            <ModeBtn active={mode === 'short'} onClick={() => setMode('short')}>⚡ Trả lời ngắn</ModeBtn>
            <ModeBtn active={mode === 'explain'} onClick={() => setMode('explain')}>📘 Giải thích chi tiết</ModeBtn>
            <ModeBtn active={mode === 'web'} onClick={() => setMode('web')}>🌐 Tra cứu trên web</ModeBtn>
          </div>
        </div>
        <div className="w-full hidden md:block">
          <h4 className="text-[12px] uppercase tracking-wider text-inkfaint mb-1.5 font-bold mt-2">Gợi ý câu hỏi</h4>
          <div className="flex flex-col gap-2">
            {QUICK_ASKS.map((q) => (
              <button key={q} onClick={() => send(q)} className="text-left px-3 py-2.5 rounded-xl text-[13px] font-semibold text-inkdim hover:bg-white/5">{q}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 glass flex flex-col overflow-hidden">
        <div ref={logRef} className="flex-1 overflow-y-auto p-5.5 flex flex-col gap-3.5">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[74%] px-4 py-3 rounded-[18px] text-[14px] leading-relaxed ${
              m.role === 'ai' ? 'self-start glass-strong border border-white/10 rounded-bl-[4px]' : 'self-end text-white rounded-br-[4px] btn-primary'
            }`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="self-start glass-strong border border-white/10 rounded-[18px] rounded-bl-[4px] px-4 py-3.5 flex gap-1">
              <Dot delay="0s" /><Dot delay=".2s" /><Dot delay=".4s" />
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/10 flex gap-2.5">
          <input
            className="field flex-1"
            placeholder="Nhập câu hỏi của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button onClick={() => send()} disabled={loading} className="btn-primary text-white font-semibold rounded-full px-5 disabled:opacity-60">Gửi</button>
        </div>
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`whitespace-nowrap text-left px-3 py-2.5 rounded-xl text-[13px] font-semibold border ${active ? 'glass-strong border-white/10 text-white' : 'border-transparent text-inkdim hover:bg-white/5'}`}>
      {children}
    </button>
  );
}
function Dot({ delay }: { delay: string }) {
  return <span className="w-1.5 h-1.5 rounded-full bg-inkfaint inline-block animate-pulse" style={{ animationDelay: delay }} />;
}
