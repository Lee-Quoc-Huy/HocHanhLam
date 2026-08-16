'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Nhập đủ email và mật khẩu nhé.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError('Email hoặc mật khẩu không đúng. Thử lại nhé.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass glass-strong w-full max-w-[410px] p-8">
        <div className="flex justify-center mb-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl btn-primary">🍎</div>
        </div>
        <h1 className="font-display text-center text-lg font-semibold mb-1">Học Hành Lắm</h1>
        <p className="text-center text-[13px] text-inkdim mb-7">
          Đăng nhập để tiếp tục hành trình ngôn ngữ của bạn
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12.5px] font-semibold text-inkdim block mb-1.5">Email</label>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@email.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-[12.5px] font-semibold text-inkdim block mb-1.5">Mật khẩu</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-[13px] text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-white font-semibold text-[14.5px] rounded-full py-3 mt-1 disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-[12.5px] text-inkfaint mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-pink font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
