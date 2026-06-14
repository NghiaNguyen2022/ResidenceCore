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

/** Format a date string / Date to "DD/MM/YYYY" — không dùng toLocaleDateString để tránh lệ thuộc locale OS. */
export function formatDate(value?: string | Date | null): string {
      if (!value) return '—';
      if (value instanceof Date) {
            if (Number.isNaN(value.getTime())) return '—';
            const dd = String(value.getDate()).padStart(2, '0');
            const mm = String(value.getMonth() + 1).padStart(2, '0');
            return `${dd}/${mm}/${value.getFullYear()}`;
      }
      // "YYYY-MM-DD..." — parse trực tiếp, tránh lỗi timezone khi new Date() đọc UTC midnight
      const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
      // fallback cho các định dạng khác
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}/${d.getFullYear()}`;
}

/**
 * Parse chuỗi "DD/MM/YYYY" (người dùng nhập) → "YYYY-MM-DD" (giá trị HTML input).
 * Trả về '' nếu định dạng không hợp lệ.
 */
export function parseDateInput(ddmmyyyy: string): string {
      const match = ddmmyyyy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!match) return '';
      const [, d, m, y] = match;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
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
