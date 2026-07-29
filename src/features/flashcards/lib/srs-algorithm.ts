export type SRSRating = "again" | "hard" | "good" | "easy";

export interface SRSState {
  repetition: number;
  interval: number; // in days
  easeFactor: number; // EF
  status: "new" | "learning" | "mastered";
  dueDate: string;
}

export interface SRSResult extends SRSState {
  rating: SRSRating;
  formattedInterval: string;
}

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm Implementation.
 * Calculates next interval, ease factor, repetition count, and due date based on user rating.
 */
export function calculateSM2(
  rating: SRSRating,
  currentRepetition = 0,
  currentInterval = 0,
  currentEaseFactor = 2.5
): SRSResult {
  let repetition = currentRepetition;
  let interval = currentInterval;
  let easeFactor = currentEaseFactor;

  switch (rating) {
    case "again": {
      repetition = 0;
      interval = 1; // repeat tomorrow or in next queue cycle
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;
    }

    case "hard": {
      repetition += 1;
      interval = Math.max(1, Math.round((currentInterval || 1) * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;
    }

    case "good": {
      repetition += 1;
      if (currentRepetition === 0) {
        interval = 1;
      } else if (currentRepetition === 1) {
        interval = 6;
      } else {
        interval = Math.round((currentInterval || 1) * easeFactor);
      }
      break;
    }

    case "easy": {
      repetition += 1;
      if (currentRepetition === 0) {
        interval = 4;
      } else {
        interval = Math.round((currentInterval || 1) * easeFactor * 1.3);
      }
      easeFactor = easeFactor + 0.15;
      break;
    }
  }

  // Determine status: Mastered when interval >= 21 days
  const status: "new" | "learning" | "mastered" =
    interval >= 21 ? "mastered" : "learning";

  // Calculate next due date
  const now = new Date();
  const dueDate = new Date(now.getTime() + interval * 86400000).toISOString();

  return {
    rating,
    repetition,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    status,
    dueDate,
    formattedInterval: formatInterval(interval, rating),
  };
}

export function formatInterval(interval: number, rating: SRSRating): string {
  if (rating === "again") return "< 10m";
  if (interval === 1) return "1 day";
  if (interval < 30) return `${interval} days`;
  if (interval < 365) return `${Math.round(interval / 30)} mo`;
  return `${(interval / 365).toFixed(1)} yr`;
}

/**
 * Returns formatted interval preview for all 4 buttons on a card
 */
export function getSRSPreview(
  currentRepetition = 0,
  currentInterval = 0,
  currentEaseFactor = 2.5
) {
  return {
    again: calculateSM2("again", currentRepetition, currentInterval, currentEaseFactor),
    hard: calculateSM2("hard", currentRepetition, currentInterval, currentEaseFactor),
    good: calculateSM2("good", currentRepetition, currentInterval, currentEaseFactor),
    easy: calculateSM2("easy", currentRepetition, currentInterval, currentEaseFactor),
  };
}
