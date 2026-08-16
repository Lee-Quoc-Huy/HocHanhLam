export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Trang chính', icon: '🏠' },
  { href: '/vocab', label: 'Từ vựng', icon: '📚' },
  { href: '/grammar', label: 'Ngữ pháp', icon: '🧩' },
  { href: '/translate', label: 'Dịch', icon: '🌐' },
  { href: '/games', label: 'Ôn tập & Trò chơi', icon: '🎮' },
  { href: '/tutor', label: 'Giảng viên AI', icon: '🤖' },
] as const;

export const LANGS = {
  en: { name: 'Tiếng Anh', flag: '🇬🇧', color: '#70C2B4', track: 'TOEIC', levels: ['Mới bắt đầu', 'Sơ cấp', 'Trung cấp', 'Nâng cao', 'Thành thạo'] },
  kr: { name: 'Tiếng Hàn', flag: '🇰🇷', color: '#F179B8', track: 'TOPIK', levels: ['TOPIK I - Sơ cấp', 'TOPIK I', 'TOPIK II', 'TOPIK II Cao cấp', 'Thành thạo'] },
  cn: { name: 'Tiếng Trung', flag: '🇨🇳', color: '#B85B56', track: 'HSK', levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5+'] },
  jp: { name: 'Tiếng Nhật', flag: '🇯🇵', color: '#F0BD74', track: 'JLPT', levels: ['N5', 'N4', 'N3', 'N2', 'N1'] },
} as const;

export type LangCode = keyof typeof LANGS;
