import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-2xl font-semibold">404 — Không tìm thấy trang</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Trang này không tồn tại, hoặc bạn không có quyền truy cập.
      </p>
      <Button asChild>
        <Link href="/vocabulary">Về Từ Vựng</Link>
      </Button>
    </main>
  );
}
