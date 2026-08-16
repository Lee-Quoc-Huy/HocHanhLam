'use client';

import { useState } from 'react';
import { saveOnboarding } from './actions';

const LANGS = [
  { code: 'en', flag: '🇬🇧', name: 'Tiếng Anh', track: 'TOEIC', color: '#70C2B4' },
  { code: 'kr', flag: '🇰🇷', name: 'Tiếng Hàn', track: 'TOPIK', color: '#F179B8' },
  { code: 'cn', flag: '🇨🇳', name: 'Tiếng Trung', track: 'HSK', color: '#B85B56' },
  { code: 'jp', flag: '🇯🇵', name: 'Tiếng Nhật', track: 'JLPT', color: '#F0BD74' },
] as const;

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  function toggle(code: string) {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass glass-strong w-full max-w-[560px] p-9">
        <div className="text-center mb-2 text-3xl">🍎</div>
        <h1 className="font-display text-center text-xl font-semibold mb-2">Bạn muốn học ngôn ngữ nào?</h1>
        <p className="text-center text-[13.5px] text-inkdim mb-8">
          Chọn một hoặc nhiều ngôn ngữ — AI sẽ theo dõi tiến độ và cá nhân hoá lộ trình riêng cho từng ngôn ngữ bạn chọn.
          Bạn có thể thêm ngôn ngữ khác sau này trong phần hồ sơ.
        </p>

        <form
          action={async (formData) => {
            setPending(true);
            await saveOnboarding(formData);
          }}
        >
          <div className="grid grid-cols-2 gap-4 mb-8">
            {LANGS.map((l) => {
              const active = selected.includes(l.code);
              return (
                <label
                  key={l.code}
                  className="glass p-5 flex flex-col items-center gap-2 cursor-pointer transition-transform"
                  style={{
                    border: active ? `1px solid ${l.color}` : undefined,
                    boxShadow: active ? `0 0 0 3px ${l.color}33` : undefined,
                    transform: active ? 'translateY(-2px)' : undefined,
                  }}
                >
                  <input
                    type="checkbox"
                    name="languages"
                    value={l.code}
                    checked={active}
                    onChange={() => toggle(l.code)}
                    className="sr-only"
                  />
                  <span className="text-3xl">{l.flag}</span>
                  <span className="font-semibold text-[14.5px]">{l.name}</span>
                  <span className="text-[11.5px] text-inkfaint uppercase tracking-wide">{l.track}</span>
                  {active && <span className="text-[11px] font-bold" style={{ color: l.color }}>✓ Đã chọn</span>}
                </label>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={selected.length === 0 || pending}
            className="btn-primary text-white font-semibold text-[14.5px] rounded-full py-3.5 w-full disabled:opacity-50"
          >
            {pending ? 'Đang lưu...' : `Bắt đầu học${selected.length ? ` (${selected.length} ngôn ngữ)` : ''}`}
          </button>
        </form>
      </div>
    </div>
  );
}
