/*
 * Search across chat histories, forgiving the way people actually type Arabic:
 * أ/إ/آ match ا, ى matches ي, ة matches ه, Arabic-Indic digits match Western
 * ones, and diacritics or tatweel in the text never break a match.
 * Phase 3 moves search to Postgres; this keeps the same behaviour for the sample.
 */

const DIACRITICS = "[\\u064B-\\u0652\\u0640]*";

const variants: Record<string, string> = {
  "ا": "[اأإآ]",
  "أ": "[اأإآ]",
  "إ": "[اأإآ]",
  "آ": "[اأإآ]",
  "ي": "[يى]",
  "ى": "[يى]",
  "ه": "[هة]",
  "ة": "[هة]",
};

const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

function charPattern(ch: string): string {
  if (variants[ch]) return variants[ch];
  const western = arabicDigits.indexOf(ch);
  if (western >= 0) return `[${western}${ch}]`;
  if (/[0-9]/.test(ch)) return `[${ch}${arabicDigits[Number(ch)]}]`;
  return ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A case-insensitive pattern for the query, or null when there is nothing to search. */
export function searchPattern(query: string): RegExp | null {
  const q = query.trim().replace(/[ً-ْـ]/g, "").replace(/\s+/g, " ");
  if (!q) return null;
  const body = Array.from(q)
    .map((ch) => (ch === " " ? "\\s+" : charPattern(ch)))
    .join(DIACRITICS);
  return new RegExp(body, "giu");
}

export function matches(text: string, pattern: RegExp): boolean {
  pattern.lastIndex = 0;
  return pattern.test(text);
}

/** Text split into plain and matching parts, for highlighting. */
export function splitMatches(text: string, pattern: RegExp | null): Array<{ text: string; hit: boolean }> {
  if (!pattern) return [{ text, hit: false }];
  const parts: Array<{ text: string; hit: boolean }> = [];
  let last = 0;
  for (const m of text.matchAll(new RegExp(pattern.source, "giu"))) {
    if (m.index === undefined || m[0].length === 0) continue;
    if (m.index > last) parts.push({ text: text.slice(last, m.index), hit: false });
    parts.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });
  return parts;
}

/** A short window of text around the first match. */
export function snippet(text: string, pattern: RegExp, radius = 34): string | null {
  const m = new RegExp(pattern.source, "iu").exec(text);
  if (!m) return null;
  const start = Math.max(0, m.index - radius);
  const end = Math.min(text.length, m.index + m[0].length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}
