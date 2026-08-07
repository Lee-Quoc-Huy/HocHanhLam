/**
 * Utility for detecting duplicate items (vocabulary, grammar, flashcards)
 * across the application.
 *
 * Performs strict normalization (preserving accents and distinct letter forms)
 * and variant normalization (removing leading/trailing prefix symbols like ~, -, +,
 * and optional part-of-speech tags in brackets).
 *
 * NO Levenshtein character distance fuzzy matching is used, because language learning
 * words/grammars with 1-2 character differences (e.g. "bàn" vs "bán", "cat" vs "car",
 * "있다" vs "없다") are distinct entities, not duplicates.
 */

/**
 * Strict normalization for exact text comparison.
 * - Converts to lowercase.
 * - Normalizes Unicode using NFC to preserve accent marks (bàn != bán != bạn).
 * - Collapses multiple spaces.
 * - Strips leading/trailing outer punctuation (. , ! ? : ;).
 */
export function normalizeStrict(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFC")
    .replace(/^[\s.,!?:;]+|[\s.,!?:;]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Variant normalization for detecting structural/formatting duplicates.
 * Strips leading grammar prefix tokens (e.g. "~", "-", "+", "v+", "n+", "a/v+")
 * and trailing brackets/POS tags (e.g. "(n)", "(v)", "(adj)").
 */
export function normalizeVariant(text: string): string {
  const strict = normalizeStrict(text);
  if (!strict) return "";

  return strict
    // Strip leading prefix markers common in vocabulary/grammar entries
    .replace(/^(?:[~\-+*/]|\b(?:v|a\/v|n|adj|adv)\s*\+\s*|\b(?:v|a\/v|n|adj|adv)\s*\-\s*)+/gi, "")
    // Strip trailing brackets like (n), (v), (adj), (noun), (verb)
    .replace(/\s*\((?:n|v|adj|adv|noun|verb|phrase|idiom|từ loại|danh từ|động từ|tính từ)\.?\)$/gi, "")
    // Strip remaining leading/trailing punctuation
    .replace(/^[\s.,!?:;\-]+|[\s.,!?:;\-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Legacy alias for backward compatibility */
export const normalizeForCompare = normalizeStrict;

export interface DuplicateGroup<T> {
  key: string;
  items: T[];
  matchType: "exact" | "variant";
}

export function findDuplicateGroups<T>(
  items: T[],
  getCompareText: (item: T) => string,
  getLanguage: (item: T) => string
): DuplicateGroup<T>[] {
  if (!items || items.length === 0) return [];

  const processed = items.map((item) => {
    const raw = getCompareText(item) || "";
    const lang = (getLanguage(item) || "en").toLowerCase().trim();
    const strictKey = normalizeStrict(raw);
    const variantKey = normalizeVariant(raw);
    return {
      item,
      raw,
      lang,
      strictKey,
      variantKey,
    };
  });

  // Group 1: Exact matches (same language + same strict key)
  const exactMap = new Map<string, typeof processed>();
  for (const entry of processed) {
    if (!entry.strictKey) continue;
    const groupKey = `${entry.lang}::${entry.strictKey}`;
    if (!exactMap.has(groupKey)) exactMap.set(groupKey, []);
    exactMap.get(groupKey)?.push(entry);
  }

  const groups: DuplicateGroup<T>[] = [];
  const consumed = new Set<T>();

  // Collect exact duplicate groups
  for (const [groupKey, entries] of exactMap) {
    if (entries.length > 1) {
      groups.push({
        key: `exact::${groupKey}`,
        items: entries.map((e) => e.item),
        matchType: "exact",
      });
      entries.forEach((e) => consumed.add(e.item));
    }
  }

  // Group 2: Variant matches among remaining unconsumed items
  const remaining = processed.filter((e) => !consumed.has(e.item) && Boolean(e.variantKey));
  const variantMap = new Map<string, typeof remaining>();
  for (const entry of remaining) {
    const groupKey = `${entry.lang}::${entry.variantKey}`;
    if (!variantMap.has(groupKey)) variantMap.set(groupKey, []);
    variantMap.get(groupKey)?.push(entry);
  }

  for (const [groupKey, entries] of variantMap) {
    if (entries.length > 1) {
      groups.push({
        key: `variant::${groupKey}`,
        items: entries.map((e) => e.item),
        matchType: "variant",
      });
      entries.forEach((e) => consumed.add(e.item));
    }
  }

  return groups;
}

