"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js App Route Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 text-center bg-background">
      <div className="flex size-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4 border border-rose-500/20">
        <AlertTriangle className="size-8" />
      </div>

      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        Hệ Thống Đang Gặp Sự Cố Không Mong Muốn 🍃
      </h1>

      <p className="mt-2 max-w-md text-xs text-muted-foreground font-mono leading-relaxed bg-surface p-4 rounded-2xl border border-border">
        {error.message || "Đã xảy ra sự cố khi tải dữ liệu trang. Vui lòng thử lại."}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={() => reset()}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-md"
        >
          <RotateCcw className="size-4" /> Thử Tải Lại Trang
        </Button>
      </div>
    </div>
  );
}
