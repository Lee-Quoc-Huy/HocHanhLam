"use client";

import { useCallback, useState } from "react";
import { VocabularyLanguage } from "../types";

export function useSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback((text: string, language: VocabularyLanguage, customAudioUrl?: string) => {
    const cleanText = text?.trim();
    if (!cleanText && !customAudioUrl) return;

    // 1. Custom audio URL if provided
    if (customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => playTtsApi(cleanText, language, setIsPlaying);
        audio.play().catch(() => playTtsApi(cleanText, language, setIsPlaying));
        return;
      } catch {
        // Fallback
      }
    }

    // 2. Play via Server-side Audio Streaming API (/api/tts)
    playTtsApi(cleanText, language, setIsPlaying);
  }, []);

  return { speak, isPlaying };
}

function playTtsApi(
  text: string,
  language: VocabularyLanguage,
  setIsPlaying: (playing: boolean) => void
) {
  if (!text) return;

  const apiUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${language}`;

  try {
    const audio = new Audio(apiUrl);
    setIsPlaying(true);

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      playWebSpeechFallback(text, language, setIsPlaying);
    };

    audio.play().catch(() => {
      playWebSpeechFallback(text, language, setIsPlaying);
    });
  } catch {
    playWebSpeechFallback(text, language, setIsPlaying);
  }
}

function playWebSpeechFallback(
  text: string,
  language: VocabularyLanguage,
  setIsPlaying: (playing: boolean) => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    setIsPlaying(false);
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langTagMap: Record<VocabularyLanguage, string> = {
    en: "en-US",
    ko: "ko-KR",
    zh: "zh-CN",
  };
  const targetTag = langTagMap[language] || "en-US";
  utterance.lang = targetTag;
  utterance.rate = 0.85;

  const loadAndSetVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      return (
        vLang.includes(language.toLowerCase()) ||
        vLang.includes(targetTag.toLowerCase()) ||
        (language === "ko" && (vLang.includes("kor") || vLang.includes("ko"))) ||
        (language === "zh" && (vLang.includes("cmn") || vLang.includes("chi") || vLang.includes("zh")))
      );
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  };

  loadAndSetVoice();

  utterance.onstart = () => setIsPlaying(true);
  utterance.onend = () => setIsPlaying(false);
  utterance.onerror = () => setIsPlaying(false);

  window.speechSynthesis.speak(utterance);
}
