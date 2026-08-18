'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="nebula">
        <div className="blob b1" />
        <div className="blob b2" />
      </div>
      <div className="glass glass-strong relative z-10 w-full max-w-[460px] p-8 text-center">
        <div className="text-3xl mb-3">🍎💥</div>
        <h1 className="font-display text-lg font-semibold mb-2">Đã có lỗi xảy ra</h1>
        <p className="text-[13.5px] text-inkdim mb-4 leading-relaxed">{error.message || 'Lỗi không xác định.'}</p>
        {error.digest && (
          <p className="text-[11px] text-inkfaint mb-5 font-mono">
            Mã lỗi: {error.digest} — tìm mã này trong Vercel → Deployments → Logs để xem chi tiết đầy đủ.
          </p>
        )}
        <button onClick={() => reset()} className="btn-primary text-white font-semibold text-[13.5px] rounded-full px-6 py-2.5">
          Thử lại
        </button>
      </div>
    </div>
  );
}
