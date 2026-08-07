/**
 * Utility for detecting duplicate items (vocabulary, grammar, flashcards)
 * across the application.
 *
 * Normalizes text (lowercased, stripped of accents/special characters,
 * trimmed) and supports both EXACT matching and FUZZY (Levenshtein distance)
 * matching for typo tolerance.
 */

export function normalizeForCompare(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^\w\s\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g, "") // keep alpha, spaces, CJK, Hangul
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) {
    const row = dp[i];
    if (row) row[0] = i;
  }
  for (let j = 0; j <= n; j++) {
    const row = dp[0];
    if (row) row[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const prevRow = dp[i - 1];
      const currRow = dp[i];
      if (prevRow && currRow) {
        currRow[j] =
          a[i - 1] === b[j - 1]
            ? (prevRow[j - 1] ?? 0)
            : 1 + Math.min(prevRow[j - 1] ?? 0, prevRow[j] ?? 0, currRow[j - 1] ?? 0);
      }
    }
  }

  const lastRow = dp[m];
  return lastRow ? (lastRow[n] ?? 0) : 0;
}

function isFuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen < 4) return false;
  const distance = levenshtein(a, b);
  const threshold = Math.min(2, Math.floor(maxLen / 6) + 1);
  return distance <= threshold;
}

export interface DuplicateGroup<T> {
  key: string;
  items: T[];
  matchType: "exact" | "fuzzy";
}

export function findDuplicateGroups<T>(
  items: T[],
  getCompareText: (item: T) => string,
  getLanguage: (item: T) => string
): DuplicateGroup<T>[] {
  const normalized = items.map((item) => ({
    item,
    key: normalizeForCompare(getCompareText(item)),
    lang: getLanguage(item),
  }));

  const exactMap = new Map<string, typeof normalized>();
  for (const entry of normalized) {
    const groupKey = `${entry.lang}::${entry.key}`;
    if (!exactMap.has(groupKey)) exactMap.set(groupKey, []);
    exactMap.get(groupKey)?.push(entry);
  }

  const groups: DuplicateGroup<T>[] = [];
  const consumed = new Set<T>();

  for (const [groupKey, entries] of exactMap) {
    if (entries.length > 1) {
      groups.push({ key: groupKey, items: entries.map((e) => e.item), matchType: "exact" });
      entries.forEach((e) => consumed.add(e.item));
    }
  }

  const remaining = normalized.filter((e) => !consumed.has(e.item));
  for (let i = 0; i < remaining.length; i++) {
    const a = remaining[i];
    if (!a || consumed.has(a.item)) continue;
    const cluster = [a];
    for (let j = i + 1; j < remaining.length; j++) {
      const b = remaining[j];
      if (!b || consumed.has(b.item)) continue;
      if (a.lang === b.lang && isFuzzyMatch(a.key, b.key)) {
        cluster.push(b);
      }
    }
    if (cluster.length > 1) {
      cluster.forEach((e) => consumed.add(e.item));
      groups.push({
        key: `fuzzy::${a.lang}::${a.key}`,
        items: cluster.map((e) => e.item),
        matchType: "fuzzy",
      });
    }
  }

  return groups;
}
