import { calculateSM2, getSRSPreview } from "../srs-algorithm";

export function runSRSAlgorithmTests() {
  const test1 = calculateSM2("good", 0, 1, 2.5);
  console.assert(test1.repetition === 1, "Repetition should be 1");
  console.assert(test1.interval === 1, "Interval should be 1");

  const test2 = calculateSM2("good", 1, 1, 2.5);
  console.assert(test2.interval === 6, "Interval should be 6");

  const test3 = calculateSM2("again", 3, 15, 2.4);
  console.assert(test3.repetition === 0, "Repetition should reset to 0");
  console.assert(test3.interval === 1, "Interval should reset to 1");

  const preview = getSRSPreview(0, 1, 2.5);
  console.assert(Boolean(preview.good && preview.easy), "Preview calculation success");
}
