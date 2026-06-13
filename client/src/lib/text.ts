/**
 * Text search utilities — single source of truth.
 */

/**
 * Normalize a string for accent-insensitive Vietnamese search:
 * trim → lowercase → strip diacritics → collapse whitespace.
 */
export function normalizeText(value?: string | null): string {
      return (value ?? '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, ' ');
}

/** Return true when haystack contains needle (both normalized). */
export function matchesSearch(haystack: string | null | undefined, needle: string): boolean {
      if (!needle.trim()) return true;
      return normalizeText(haystack).includes(normalizeText(needle));
}
