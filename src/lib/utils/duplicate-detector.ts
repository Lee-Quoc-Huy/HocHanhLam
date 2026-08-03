/**
 * Smart duplicate detection — groups items that are effectively the same
 * even if typed slightly differently (extra spaces, different
 * capitalization, trailing punctuation). Two matching strategies are
 * combined so it catches more than a naive exact-string comparison:
 *
 * 1. Exact key match (normalized): same language + same word/title →
 *    almost certainly a true duplicate.
 * 2. Fuzzy key match: same language + very similar normalized string
 *    (Levenshtein distance within a small threshold relative to length) →
 *    likely a duplicate with a typo (e.g. "necessary" vs "neccessary").
 */

export function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents/diacritics for looser matching
    .replace(/[^\p{L}\p{N}\s]/gu, "") // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function isFuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen < 4) return false; // too short to fuzzy-match reliably
  const distance = levenshtein(a, b);
  // Allow ~1 edit per 6 characters, capped at 2 edits — catches typos
  // without merging genuinely different short words.
  const threshold = Math.min(2, Math.floor(maxLen / 6) + 1);
  return distance <= threshold;
}

export interface DuplicateGroup<T> {
  key: string;
  items: T[];
  matchType: "exact" | "fuzzy";
}

/**
 * Finds duplicate groups within `items` based on a normalized comparison
 * key extracted per item (e.g. `${language}:${word}`). Items are grouped by
 * exact normalized key first; then remaining singleton groups are checked
 * pairwise for fuzzy (near-typo) matches within the same language.
 */
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

  // Pass 1: exact normalized-key groups (within the same language)
  const exactMap = new Map<string, typeof normalized>();
  for (const entry of normalized) {
    const groupKey = `${entry.lang}::${entry.key}`;
    if (!exactMap.has(groupKey)) exactMap.set(groupKey, []);
    exactMap.get(groupKey)!.push(entry);
  }

  const groups: DuplicateGroup<T>[] = [];
  const consumed = new Set<T>();

  for (const [groupKey, entries] of exactMap) {
    if (entries.length > 1) {
      groups.push({ key: groupKey, items: entries.map((e) => e.item), matchType: "exact" });
      entries.forEach((e) => consumed.add(e.item));
    }
  }

  // Pass 2: fuzzy matches among items not already grouped, same language only
  const remaining = normalized.filter((e) => !consumed.has(e.item));
  for (let i = 0; i < remaining.length; i++) {
    const a = remaining[i];
    if (consumed.has(a.item)) continue;
    const cluster = [a];
    for (let j = i + 1; j < remaining.length; j++) {
      const b = remaining[j];
      if (consumed.has(b.item)) continue;
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
