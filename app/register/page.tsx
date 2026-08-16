'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Điền đủ tên, email và mật khẩu tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name.trim() } },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message === 'User already registered' ? 'Email này đã có tài khoản.' : 'Không tạo được tài khoản, thử lại sau.');
      return;
    }

    // Nếu project Supabase bật xác nhận email, session sẽ chưa có ngay.
    if (!data.session) {
      setInfo('Tạo tài khoản thành công! Kiểm tra email để xác nhận rồi quay lại đăng nhập.');
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
            <label className="text-[12.5px] font-semibold text-inkdim block mb-1.5">Tên hiển thị</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="text-[12.5px] font-semibold text-inkdim block mb-1.5">Email</label>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" autoComplete="email" />
          </div>
          <div>
            <label className="text-[12.5px] font-semibold text-inkdim block mb-1.5">Mật khẩu</label>
            <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" autoComplete="new-password" />
          </div>

          {error && <p className="text-[13px] text-terracotta">{error}</p>}
          {info && <p className="text-[13px] text-sage">{info}</p>}

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
