"use client";

import { useEffect } from "react";
import { SRSRating } from "../lib/srs-algorithm";

interface KeyboardShortcutsProps {
  enabled: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (rating: SRSRating) => void;
}

export function useKeyboardShortcuts({
  enabled,
  isFlipped,
  onFlip,
  onRate,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
        case "Enter":
        case "ArrowUp":
        case "ArrowDown": {
          e.preventDefault();
          onFlip();
          break;
        }

        case "Digit1":
        case "Numpad1":
        case "KeyA": {
          if (isFlipped) {
            e.preventDefault();
            onRate("again");
          }
          break;
        }

        case "Digit2":
        case "Numpad2":
        case "KeyH": {
          if (isFlipped) {
            e.preventDefault();
            onRate("hard");
          }
          break;
        }

        case "Digit3":
        case "Numpad3":
        case "KeyG": {
          if (isFlipped) {
            e.preventDefault();
            onRate("good");
          }
          break;
        }

        case "Digit4":
        case "Numpad4":
        case "KeyE": {
          if (isFlipped) {
            e.preventDefault();
            onRate("easy");
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, isFlipped, onFlip, onRate]);
}
