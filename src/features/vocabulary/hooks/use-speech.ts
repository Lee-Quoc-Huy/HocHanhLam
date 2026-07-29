"use client";

import { useCallback, useState } from "react";
import { VocabularyLanguage } from "../types";

export function useSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback((text: string, language: VocabularyLanguage, customAudioUrl?: string) => {
    if (!text && !customAudioUrl) return;

    // Custom audio URL takes priority if available
    if (customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        setIsPlaying(true);
        audio.play().catch(() => {
          // Fallback to Web Speech API on custom audio error
          speakTTS(text, language, setIsPlaying);
        });
        audio.onended = () => setIsPlaying(false);
        return;
      } catch {
        // Fallback
      }
    }

    speakTTS(text, language, setIsPlaying);
  }, []);

  return { speak, isPlaying };
}

function speakTTS(
  text: string,
  language: VocabularyLanguage,
  setIsPlaying: (playing: boolean) => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Web Speech API is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any active speech

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set BCP-47 language tag
  switch (language) {
    case "en":
      utterance.lang = "en-US";
      break;
    case "ko":
      utterance.lang = "ko-KR";
      break;
    case "zh":
      utterance.lang = "zh-CN";
      break;
  }

  utterance.rate = 0.9; // Slightly slower for clear pronunciation
  utterance.pitch = 1.0;

  utterance.onstart = () => setIsPlaying(true);
  utterance.onend = () => setIsPlaying(false);
  utterance.onerror = () => setIsPlaying(false);

  window.speechSynthesis.speak(utterance);
}
