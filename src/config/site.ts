/**
 * Global site configuration — single source of truth for app metadata,
 * navigation, and PWA manifest values. Feature modules must not hardcode
 * these values; import from here instead.
 */

export const siteConfig = {
  name: "Học Hành Lắm",
  shortName: "Học Hành Lắm",
  description:
    "Hệ thống quản lý học tập ngôn ngữ thông minh tích hợp AI cho Tiếng Anh, Tiếng Hàn và Tiếng Trung.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  authors: [{ name: "Học Hành Lắm Team" }],
  links: {
    github: "https://github.com/linguaverse-ai",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export const navConfig = {
  primary: [
    { title: "Tổng Quan", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Từ Vựng", href: "/vocabulary", icon: "BookOpenText" },
    { title: "Ngữ Pháp", href: "/grammar", icon: "BookMarked" },
    { title: "Thẻ Ghi Nhớ", href: "/flashcards", icon: "Layers" },
    { title: "Kế Hoạch Học Tập", href: "/study-plan", icon: "CalendarDays" },
    { title: "Tài Liệu", href: "/documents", icon: "FolderKanban" },
    { title: "Trợ Lý AI Center", href: "/ai-tutor", icon: "Sparkles" },
    { title: "Tiến Độ", href: "/progress", icon: "TrendingUp" },
  ],
  secondary: [
    { title: "Cài Đặt", href: "/settings", icon: "Settings" },
    { title: "Trợ Giúp", href: "/help", icon: "LifeBuoy" },
  ],
} as const;
