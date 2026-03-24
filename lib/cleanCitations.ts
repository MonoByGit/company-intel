/**
 * Strips Claude citation tags from text while preserving inner content.
 * Handles both raw HTML tags and HTML-entity-encoded variants.
 */
export function cleanCitations(text: string | null | undefined): string {
  if (!text) return "";
  const cleaned = text
    .replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, "$1")
    .replace(/&lt;cite[^&]*&gt;([\s\S]*?)&lt;\/cite&gt;/g, "$1")
    .trim();

  // Safety check: if the result still contains a raw "<" or the word "cite", return empty string
  if (cleaned.includes("<") || /\bcite\b/i.test(cleaned)) {
    return "";
  }
  return cleaned;
}

/** Clean an entire object's string fields recursively. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanObject<T>(obj: T): T {
  if (typeof obj === "string") return cleanCitations(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(cleanObject) as unknown as T;
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[k] = cleanObject(v);
    }
    return result as T;
  }
  return obj;
}
