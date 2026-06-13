/**
 * Shared formatting utilities — single source of truth for the entire client.
 */

// ─── Time ────────────────────────────────────────────────────────────────────

/** Extract HH:MM from a time string, Date, or "YYYY-MM-DD HH:MM:SS" / ISO datetime. */
export function formatTime(value?: string | Date | null): string {
      if (!value) return '--:--';
      if (value instanceof Date) {
            return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
      }
      const text = String(value);
      if (text.includes(' ')) return text.split(' ')[1]?.slice(0, 5) || '--:--';
      if (text.includes('T')) return text.split('T')[1]?.slice(0, 5) || '--:--';
      return text.slice(0, 5);
}

/** "HH:MM – HH:MM" range, or just start if end missing. */
export function formatTimeRange(start?: string | null, end?: string | null): string {
      const s = formatTime(start);
      const e = formatTime(end);
      if (s === '--:--') return '—';
      if (e === '--:--') return s;
      return `${s} – ${e}`;
}

/** Convert "HH:MM" or "HH:MM:SS" to total minutes. */
export function timeToMinutes(value: string): number {
      const parts = value.split(':');
      return Number(parts[0] ?? 0) * 60 + Number(parts[1] ?? 0);
}

// ─── Date ────────────────────────────────────────────────────────────────────

/** Format a date string / Date to Vietnamese locale "DD/MM/YYYY". */
export function formatDate(value?: string | Date | null): string {
      if (!value) return '—';
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString('vi-VN');
}

/** "DD/MM/YYYY – DD/MM/YYYY", collapses same-day ranges. */
export function formatDateRange(start?: string | null, end?: string | null): string {
      if (!start && !end) return '—';
      if (!end || start === end) return formatDate(start);
      return `${formatDate(start)} – ${formatDate(end)}`;
}

/** Extract "YYYY-MM-DD" from a Date or string (strips time portion). */
export function toDateString(value: Date | string): string {
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      return String(value).slice(0, 10);
}

// ─── Currency ────────────────────────────────────────────────────────────────

/** Short VND: 1.5M, 500K, 1.200 đ */
export function formatVND(amount?: number | string | null): string {
      const n = Number(amount ?? 0);
      if (isNaN(n)) return '0';
      if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
      return String(n);
}

/** Full VND with currency symbol via Intl: "1.500.000 ₫" */
export function formatVNDFull(amount?: number | string | null): string {
      const n = Number(amount ?? 0);
      if (isNaN(n)) return '0 đ';
      return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
      }).format(n);
}
