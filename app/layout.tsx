import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Học Hành Lắm — Học ngôn ngữ cùng AI',
  description: 'Học và ôn tập Anh · Hàn · Trung · Nhật cùng AI cá nhân hoá lộ trình.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-body">
        <div className="nebula">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
          <div className="blob b4" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
