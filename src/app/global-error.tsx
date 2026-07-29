"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 font-sans text-foreground">
        <div className="flex max-w-md flex-col items-center justify-center text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4 border border-rose-500/20">
            <AlertTriangle className="size-8" />
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground">
            Lỗi Hệ Thống Học Hành Lắm 🍃
          </h1>

          <p className="mt-2 text-xs text-muted-foreground font-mono leading-relaxed bg-surface p-4 rounded-2xl border border-border">
            {error.message || "Đã xảy ra lỗi nghiêm trọng."}
          </p>

          <Button
            onClick={() => reset()}
            className="mt-6 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-md"
          >
            <RotateCcw className="size-4" /> Khôi Phục Trang Web
          </Button>
        </div>
      </body>
    </html>
  );
}
