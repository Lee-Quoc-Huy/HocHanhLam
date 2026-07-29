"use client";

import { useRef, useState } from "react";
import { ShieldCheck, Download, Upload, Database, Lock, Key, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserSettings } from "../types";

interface BackupSecuritySettingsProps {
  settings: UserSettings;
  onExport: () => void;
  onImport: (jsonText: string) => Promise<boolean>;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  saveMessage: string | null;
}

export function BackupSecuritySettings({
  settings,
  onExport,
  onImport,
  onSave,
  saveMessage,
}: BackupSecuritySettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [twoFactor, setTwoFactor] = useState(settings.two_factor_enabled);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await onImport(text);
      if (success) {
        setImportStatus("Đã khôi phục dữ liệu sao lưu JSON thành công!");
      } else {
        setImportStatus("Tệp sao lưu không hợp lệ. Vui lòng kiểm tra lại cấu trúc JSON.");
      }
    } catch {
      setImportStatus("Lỗi đọc tệp sao lưu.");
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    setTwoFactor(enabled);
    await onSave({ two_factor_enabled: enabled });
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        className="hidden"
      />

      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" /> {saveMessage}
        </div>
      )}

      {importStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" /> {importStatus}
        </div>
      )}

      {/* Backup, Export & Import */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Database className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Sao Lưu & Khôi Phục Dữ Liệu Hệ Thống</span>
        </h3>

        <p className="text-xs text-muted-foreground">
          Tạo bản sao lưu JSON toàn bộ kho từ vựng, ngữ pháp, thẻ flashcards, tài liệu và cài đặt cá nhân để lưu trữ ngoại tuyến an toàn.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={onExport} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl">
            <Download className="size-4" /> Xuất Bản Sao Lưu JSON (Export Backup)
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="gap-2 text-xs h-10 rounded-xl"
          >
            <Upload className="size-4 text-emerald-600" /> Nhập Bản Sao Lưu (Import Backup)
          </Button>
        </div>
      </div>

      {/* Security & 2FA */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Bảo Mật Tài Khoản & Quyền Truy Cập</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-background cursor-pointer">
            <div>
              <p className="font-bold text-foreground">Xác Thực 2 Lớp (Two-Factor Authentication - 2FA)</p>
              <p className="text-[11px] text-muted-foreground">Yêu cầu mã xác thực ứng dụng Authenticator khi đăng nhập.</p>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => handleToggle2FA(e.target.checked)}
              className="size-4 accent-emerald-600"
            />
          </label>

          <div className="p-4 rounded-xl border border-border bg-background space-y-2">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <Lock className="size-4 text-amber-500" /> Đổi Mật Khẩu Đăng Nhập
            </p>
            <p className="text-[11px] text-muted-foreground">
              Mật khẩu đăng nhập cá nhân của bạn được mã hóa an toàn trên hệ thống Supabase Auth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
