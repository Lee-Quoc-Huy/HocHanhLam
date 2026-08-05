"use client";

import { useState } from "react";
import {
  LifeBuoy,
  Phone,
  Facebook,
  User,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText("0796643911");
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Section - Cinematic Dark/Glass Aesthetics */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-surface-raised/90 to-surface p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 size-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 size-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>Trung Tâm Hỗ Trợ & Vận Hành</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Trợ Giúp & Thông Tin Liên Hệ
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Học Hành Lắm luôn sẵn sàng hỗ trợ bạn trong hành trình chinh phục ngoại ngữ. Đừng ngần ngại liên hệ trực tiếp với chúng tôi để đóng góp ý kiến hoặc nhận sự trợ giúp nhanh nhất!
          </p>
        </div>
      </div>

      {/* Contact Cards Grid - Cinematic VIP Style */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-emerald-500" />
          <h2 className="font-display text-xl font-bold text-foreground">
            1. Thông Tin Liên Hệ
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Card 1: Direct Contact Person & Phone */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface/90 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
                <User className="size-6" />
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500 border border-emerald-500/20">
                Sáng Lập & Phát Triển
              </span>
            </div>

            <div className="mt-5 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Họ và Tên</p>
              <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                Lê Quốc Huy
              </h3>
            </div>

            <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-emerald-500" />
                <span className="font-mono text-base font-bold text-foreground">0796643911</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPhone}
                  className="h-8 gap-1.5 text-xs rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 border-border"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </Button>

                <a
                  href="tel:0796643911"
                  className="inline-flex h-8 items-center justify-center rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  Gọi Ngay
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Facebook Profile Link */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface/90 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-xs">
                <Facebook className="size-6" />
              </div>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-500 border border-blue-500/20">
                Trang Cá Nhân
              </span>
            </div>

            <div className="mt-5 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Facebook Chính Thức</p>
              <h3 className="font-display text-xl font-bold text-foreground group-hover:text-blue-500 transition-colors truncate">
                https://www.facebook.com/Wuy.lii/
              </h3>
            </div>

            <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Nhắn tin trực tiếp qua Messenger</span>

              <a
                href="https://www.facebook.com/Wuy.lii/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <span>Truy Cập Facebook</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Guide & FAQ */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-amber-500" />
          <h2 className="font-display text-xl font-bold text-foreground">
            Hướng Dẫn & Câu Hỏi Thường Gặp
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-surface/70 p-5 shadow-xs">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3">
              <BookOpen className="size-5" />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">Thẻ Ghi Nhớ (Flashcard)</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Ôn tập với các chế độ Thẻ Lật SRS, Trắc nghiệm Quiz thông minh có gợi ý tiếng Anh, và gõ từ tự động theo từng bộ sưu tập chủ đề.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface/70 p-5 shadow-xs">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-3">
              <Sparkles className="size-5" />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">Trợ Lý AI Center</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Hỏi đáp ngữ pháp, tra cứu từ vựng và tự động trích xuất nội dung vào thẻ ghi nhớ với chế độ Trả lời ngắn tiết kiệm token.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface/70 p-5 shadow-xs">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 mb-3">
              <ShieldCheck className="size-5" />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">Bảo Mật Dữ Liệu</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Tất cả từ vựng, ngữ pháp và tiến độ học tập đều được đồng bộ thời gian thực an toàn với hệ thống cơ sở dữ liệu Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
