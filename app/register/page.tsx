'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { usernameToEmail, validateUsername } from '@/lib/auth/username';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const usernameError = validateUsername(username);
    if (usernameError) { setError(usernameError); return; }
    if (password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự.'); return; }

    setLoading(true);
    const cleanUsername = username.trim();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: usernameToEmail(cleanUsername),
      password,
      options: { data: { username: cleanUsername, display_name: cleanUsername } },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes('already registered')
          ? 'Tên đăng nhập này đã có người dùng, thử tên khác nhé.'
          : 'Không tạo được tài khoản, thử lại sau.'
      );
      return;
    }

    if (!data.session) {
      // Xảy ra khi Supabase project vẫn đang bật "Confirm email".
      setError('Tài khoản đã tạo nhưng chưa đăng nhập được — hãy tắt "Confirm email" trong Supabase Dashboard (Authentication → Providers → Email) rồi thử đăng nhập lại.');
      return;
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass glass-strong w-full max-w-[410px] p-8">
        <div className="flex justify-center mb-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl btn-primary">🍎</div>
        </div>
        <h1 className="font-display text-center text-lg font-semibold mb-1">Tạo tài khoản</h1>
        <p className="text-center text-[13px] text-inkdim mb-7">
          Bắt đầu hành trình học Anh · Hàn · Trung · Nhật cùng AI
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12.5px] font-semibold text-inkdim block mb-1.5">Tên đăng nhập</label>
            <input
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="vd: quochuy2025"
              autoComplete="username"
            />
            <p className="text-[11px] text-inkfaint mt-1.5">Chữ cái, số, dấu gạch dưới — không dấu, 3-20 ký tự.</p>
          </div>
          <div>
            <label className="text-[12.5px] font-semibold text-inkdim block mb-1.5">Mật khẩu</label>
            <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" autoComplete="new-password" />
          </div>

          {error && <p className="text-[13px] text-terracotta">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary text-white font-semibold text-[14.5px] rounded-full py-3 mt-1 disabled:opacity-60">
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="text-center text-[12.5px] text-inkfaint mt-6">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-pink font-semibold">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
