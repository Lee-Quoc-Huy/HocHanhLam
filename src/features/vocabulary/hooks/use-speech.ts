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
        audio.onerror = () => {
          playGoogleTTS(cleanText, language, setIsPlaying);
        };
        audio.play().catch(() => {
          playGoogleTTS(cleanText, language, setIsPlaying);
        });
        return;
      } catch {
        // Fallback
      }
    }

    // 2. Play via Google TTS / Web Speech API
    playGoogleTTS(cleanText, language, setIsPlaying);
  }, []);

  return { speak, isPlaying };
}

function playGoogleTTS(
  text: string,
  language: VocabularyLanguage,
  setIsPlaying: (playing: boolean) => void
) {
  if (!text) return;

  const langMap: Record<VocabularyLanguage, string> = {
    en: "en",
    ko: "ko",
    zh: "zh-CN",
  };
  const targetLang = langMap[language] || "en";

  // Google Translate TTS URL
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    text
  )}&tl=${targetLang}&client=tw-ob`;

  try {
    const audio = new Audio(ttsUrl);
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      // Fallback to Web Speech API
      playWebSpeech(text, language, setIsPlaying);
    };
    audio.play().catch(() => {
      playWebSpeech(text, language, setIsPlaying);
    });
  } catch {
    playWebSpeech(text, language, setIsPlaying);
  }
}

function playWebSpeech(
  text: string,
  language: VocabularyLanguage,
  setIsPlaying: (playing: boolean) => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    setIsPlaying(false);
    return;
  }

  window.speechSynthesis.cancel(); // Stop active speech

  const utterance = new SpeechSynthesisUtterance(text);
  const langTagMap: Record<VocabularyLanguage, string> = {
    en: "en-US",
    ko: "ko-KR",
    zh: "zh-CN",
  };
  const targetTag = langTagMap[language] || "en-US";
  utterance.lang = targetTag;
  utterance.rate = 0.85;
  utterance.pitch = 1.0;

  // Search for explicit voice matching target language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => {
    const vLang = v.lang.toLowerCase();
    return vLang.includes(language.toLowerCase()) || vLang.includes(targetTag.toLowerCase());
  });

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => setIsPlaying(true);
  utterance.onend = () => setIsPlaying(false);
  utterance.onerror = () => setIsPlaying(false);

  window.speechSynthesis.speak(utterance);
}
