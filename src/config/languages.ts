/**
 * Supported target languages the platform manages study for.
 * This is the CONTENT language config (EN/KR/ZH), independent from the
 * UI locale (interface language), which is handled separately if/when
 * UI i18n is introduced.
 */

export type LanguageCode = "en" | "ko" | "zh";

export interface LanguageDefinition {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flagEmoji: string;
  /** Tailwind CSS variable token, see globals.css --lang-* */
  accentToken: "lang-en" | "lang-kr" | "lang-zh";
  writingSystem: "latin" | "hangul" | "hanzi";
}

export const LANGUAGES: Record<LanguageCode, LanguageDefinition> = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    flagEmoji: "🇬🇧",
    accentToken: "lang-en",
    writingSystem: "latin",
  },
  ko: {
    code: "ko",
    label: "Korean",
    nativeLabel: "한국어",
    flagEmoji: "🇰🇷",
    accentToken: "lang-kr",
    writingSystem: "hangul",
  },
  zh: {
    code: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    flagEmoji: "🇨🇳",
    accentToken: "lang-zh",
    writingSystem: "hanzi",
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
