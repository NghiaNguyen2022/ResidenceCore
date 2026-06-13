/**
 * Server-side utility functions — single source of truth.
 */

/** Trim and lowercase a string for case-insensitive comparisons. */
export function normalizeText(value?: string | null): string {
      return (value ?? '').trim().toLowerCase();
}

/** Convert "YYYY-MM-DD" string or Date to a Date-only string. */
export function toDateOnly(value: string | Date): string {
      if (value instanceof Date) return value.toISOString().split('T')[0];
      return String(value).split('T')[0];
}
