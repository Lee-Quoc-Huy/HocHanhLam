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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const usernameError = validateUsername(username);
    if (usernameError) { setError(usernameError); return; }
    if (password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự.'); return; }
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }

    setLoading(true);
    const cleanUsername = username.trim();

    try {
      // 1) Tạo tài khoản qua API server (dùng quyền admin) — không gửi email nào cả.
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail ? `${data.error} (Chi tiết: ${data.detail})` : data.error);
        return;
      }

      // 2) Tài khoản đã tạo xong, giờ đăng nhập luôn để lấy session.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(cleanUsername),
        password,
      });
      if (signInError) {
        setError('Tạo tài khoản thành công nhưng đăng nhập tự động thất bại — thử đăng nhập thủ công nhé.');
        return;
      }

      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      setError(`Không kết nối được máy chủ. (Chi tiết: ${err instanceof Error ? err.message : String(err)})`);
    } finally {
      setLoading(false);
    }
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
          <div>
            <label className="text-[12.5px] font-semibold text-inkdim block mb-1.5">Xác nhận mật khẩu</label>
            <input className="field" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" autoComplete="new-password" />
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
