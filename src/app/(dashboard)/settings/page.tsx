"use client";

import { useSettings } from "@/features/settings/hooks/use-settings";
import { SettingsNavTabs } from "@/features/settings/components/settings-nav-tabs";
import { ProfileSettings } from "@/features/settings/components/profile-settings";
import { ThemeNotificationsSettings } from "@/features/settings/components/theme-notifications-settings";
import { AiKeySettings } from "@/features/settings/components/ai-key-settings";
import { BackupSecuritySettings } from "@/features/settings/components/backup-security-settings";
import { AchievementsGrid } from "@/features/settings/components/achievements-grid";
import { AnalyticsDashboard } from "@/features/settings/components/analytics-dashboard";

export default function SettingsPage() {
  const {
    settings,
    activeTab,
    achievements,
    analytics,
    isTestingKey,
    isApiKeyValid,
    saveMessage,
    updateSettings,
    testApiKey,
    exportBackup,
    importBackup,
    setActiveTab,
  } = useSettings();

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Trung Tâm Cài Đặt & Điều Khiển AI 🍃
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Quản lý Hồ sơ · Mục tiêu học tập · Giao diện · Thông báo · Kết nối AI & API Key · Sao lưu & Bảo mật · Huy chương · Thống kê
        </p>
      </div>

      {/* Navigation Tabs */}
      <SettingsNavTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Tab 1: Profile & Learning Goal */}
      {activeTab === "profile" && (
        <ProfileSettings
          settings={settings}
          onSave={updateSettings}
          saveMessage={saveMessage}
        />
      )}

      {/* Tab 2: Theme & Notifications */}
      {activeTab === "theme_notifications" && (
        <ThemeNotificationsSettings
          settings={settings}
          onSave={updateSettings}
          saveMessage={saveMessage}
        />
      )}

      {/* Tab 3: Connected AI & API Keys */}
      {activeTab === "ai_key" && (
        <AiKeySettings
          settings={settings}
          onSave={updateSettings}
          onTestKey={testApiKey}
          isTestingKey={isTestingKey}
          isApiKeyValid={isApiKeyValid}
          saveMessage={saveMessage}
        />
      )}

      {/* Tab 4: Backup, Import/Export & Security */}
      {activeTab === "backup_security" && (
        <BackupSecuritySettings
          settings={settings}
          onExport={exportBackup}
          onImport={importBackup}
          onSave={updateSettings}
          saveMessage={saveMessage}
        />
      )}

      {/* Tab 5: Achievements & Badges */}
      {activeTab === "achievements" && (
        <AchievementsGrid achievements={achievements} />
      )}

      {/* Tab 6: Analytics Dashboard */}
      {activeTab === "analytics" && (
        <AnalyticsDashboard analytics={analytics} />
      )}
    </div>
  );
}
