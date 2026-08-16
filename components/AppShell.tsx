'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV_ITEMS } from '@/lib/nav';
import { createClient } from '@/lib/supabase/client';

function fmtDate(d: Date) {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export default function AppShell({
  displayName,
  greetTitle,
  children,
}: {
  displayName: string;
  greetTitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const navList = (extraClass: string) => (
    <>
      {NAV_ITEMS.map((n) => {
        const active = pathname?.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] font-semibold transition-all ${extraClass} ${
              active ? 'glass-strong text-white border border-white/10' : 'text-inkdim hover:bg-white/5 hover:text-ink'
            }`}
          >
            <span className="w-5 text-center text-base">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile top bar */}
      <div className="md:hidden glass fixed top-2.5 left-3 right-3 z-20 flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center text-[15px]">🍎</div>
          <span className="font-display text-[13px] font-bold whitespace-nowrap">
            Học Hành <span className="text-pink">Lắm</span>
          </span>
        </div>
        <div className="glass-strong rounded-full px-3 py-1.5 font-mono text-[12px]">
          {now ? fmtTime(now).slice(0, 5) : '--:--'}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[242px] shrink-0 glass sticky top-0 h-screen flex-col gap-6 p-[18px]">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-[38px] h-[38px] rounded-xl btn-primary flex items-center justify-center text-lg">🍎</div>
          <span className="font-display text-[15px] font-bold whitespace-nowrap">
            Học Hành <span className="text-pink">Lắm</span>
          </span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">{navList('')}</nav>
        <div className="glass-strong rounded-2xl p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px]" style={{ background: 'linear-gradient(135deg,#70C2B4,#956AD6)' }}>
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold truncate">{displayName}</div>
          </div>
          <button onClick={handleLogout} title="Đăng xuất" className="ml-auto text-inkfaint text-[15px]">
            ⏻
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-4 md:px-8 pt-20 md:pt-6 pb-28 md:pb-10">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div>
            <div className="font-display text-lg md:text-[22px] font-semibold">{greetTitle}</div>
            <div className="text-inkdim text-[13.5px] mt-1">{now ? fmtDate(now) : ''} · Giờ Việt Nam (UTC+7)</div>
          </div>
          <div className="hidden md:block glass-strong rounded-full px-3.5 py-2 font-mono text-[12.5px]">
            {now ? fmtTime(now) : '--:--:--'}
          </div>
        </div>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden glass fixed bottom-3.5 left-3.5 right-3.5 z-30 flex justify-between gap-1 p-1.5">
        {NAV_ITEMS.map((n) => {
          const active = pathname?.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[9.5px] font-semibold ${
                active ? 'glass-strong text-white' : 'text-inkfaint'
              }`}
            >
              <span className="text-[17px]">{n.icon}</span>
              <span className="truncate w-full text-center">{n.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
