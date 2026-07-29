import { calculateSM2, getSRSPreview } from "../srs-algorithm";

export function runSRSAlgorithmTests(): boolean {
  const test1 = calculateSM2("good", 0, 1, 2.5);
  const test2 = calculateSM2("good", 1, 1, 2.5);
  const test3 = calculateSM2("again", 3, 15, 2.4);
  const preview = getSRSPreview(0, 1, 2.5);

  return (
    test1.repetition === 1 &&
    test1.interval === 1 &&
    test2.interval === 6 &&
    test3.repetition === 0 &&
    test3.interval === 1 &&
    Boolean(preview.good && preview.easy)
  );
}

