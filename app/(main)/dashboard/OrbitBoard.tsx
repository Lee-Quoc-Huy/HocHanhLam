'use client';

import { useState } from 'react';
import Link from 'next/link';

type LangBoard = {
  code: string;
  flag: string;
  color: string;
  track: string;
  levelLabel: string;
  level: number;
  xp: number;
  streak: number;
  vocabCount: number;
};

function Ring({ color, pct, size = 112, stroke = 6 }: { color: string; pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

export default function OrbitBoard({ languages }: { languages: LangBoard[] }) {
  const [activeCode, setActiveCode] = useState(languages[0]?.code ?? '');
  const active = languages.find((l) => l.code === activeCode) ?? languages[0];

  return (
    <>
      <div className="glass p-7 md:p-8 mb-5">
        <div className="text-[12.5px] uppercase tracking-[0.12em] text-inkfaint font-bold mb-4">
          Hành trình ngôn ngữ của bạn
        </div>
        <div className="flex items-center justify-center gap-5 md:gap-7 flex-wrap py-2">
          {languages.map((l) => {
            const pct = Math.min(100, Math.round((l.xp / 100) * 100));
            return (
              <button
                key={l.code}
                onClick={() => setActiveCode(l.code)}
                className="relative flex flex-col items-center justify-center gap-0.5 w-[92px] h-[92px] md:w-[112px] md:h-[112px] transition-transform hover:-translate-y-1"
              >
                <Ring color={l.color} pct={pct} size={92} />
                <div className="hidden md:block absolute inset-0">
                  <Ring color={l.color} pct={pct} size={112} />
                </div>
                <span className="text-2xl md:text-[26px]">{l.flag}</span>
                <span className="text-[10px] md:text-[11px] font-bold text-inkdim">{l.levelLabel}</span>
                <span className="text-[9px] md:text-[10.5px] text-inkfaint uppercase tracking-wide">{l.track}</span>
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <StatCard icon={active.flag} value={active.levelLabel} label={`Cấp độ hiện tại`} />
            <StatCard icon="⚡" value={`${active.xp}`} suffix="/100 XP" label="Tiến độ lên cấp" />
            <StatCard icon="🔥" value={`${active.streak}`} label="Ngày học liên tiếp" />
            <StatCard icon="📖" value={`${active.vocabCount}`} label="Từ vựng đã lưu" />
          </div>

          <div className="glass p-6 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[16px]">Tiến độ lên cấp</h3>
              <span className="glass-strong rounded-full px-3 py-1 text-[12px] font-semibold">{active.xp}/100 XP</span>
            </div>
            <div className="progressbar">
              <div style={{ width: `${active.xp}%`, background: active.color }} />
            </div>
            <p className="text-[12.5px] text-inkfaint mt-2.5">
              Hoàn thành đủ bài luyện tập mỗi ngày để tích XP. Khi đầy 100 XP, bạn sẽ được lên cấp tiếp theo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass p-6">
              <h3 className="font-bold text-[16px] mb-3">Ôn tập hôm nay</h3>
              <p className="text-[13px] text-inkdim mb-4">
                Làm Flashcard, Hoàn thành câu và Đọc hiểu cho {active.flag} để tích thêm XP hôm nay.
              </p>
              <Link href="/games" className="btn-primary inline-block text-white font-semibold text-[13.5px] rounded-full px-5 py-2.5">
                Làm ngay →
              </Link>
            </div>
            <div className="glass p-6">
              <h3 className="font-bold text-[16px] mb-3">Giảng viên AI</h3>
              <p className="text-[13px] text-inkdim mb-4">
                Có thắc mắc về ngữ pháp hay từ vựng? Hỏi ngay giảng viên AI của bạn.
              </p>
              <Link href="/tutor" className="glass-strong inline-block font-semibold text-[13.5px] rounded-full px-5 py-2.5 border border-white/10">
                Trò chuyện với AI →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function StatCard({ icon, value, suffix, label }: { icon: string; value: string; suffix?: string; label: string }) {
  return (
    <div className="glass p-5">
      <div className="w-9 h-9 rounded-xl glass-strong flex items-center justify-center text-[18px] mb-2.5">{icon}</div>
      <div className="font-display text-[22px] font-bold">
        {value}
        {suffix && <span className="text-[13px] text-inkfaint font-body font-normal">{suffix}</span>}
      </div>
      <div className="text-[12.5px] text-inkdim">{label}</div>
    </div>
  );
}
