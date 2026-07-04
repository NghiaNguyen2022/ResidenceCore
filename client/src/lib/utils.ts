import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
}

export const cx = cn;

/** Normalize Vietnamese text for search/matching while keeping spaces. */
export function normalizeText(value?: unknown): string {
      return String(value ?? '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'd')
            .replace(/\s+/g, ' ');
}

/** Normalize text to an uppercase code key: "Tổ 1" -> "TO_1". */
export function normalizeCode(value?: unknown): string {
      return String(value ?? '')
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'D')
            .replace(/Đ/g, 'D')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

/** Date value for HTML date input, avoiding timezone shifts for existing YYYY-MM-DD strings. */
export function toInputDateValue(value?: string | Date | null): string {
      if (!value) return '';
      if (value instanceof Date) {
            if (Number.isNaN(value.getTime())) return '';
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const day = String(value.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
      }

      const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}`;

      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return '';
      return toInputDateValue(parsed);
}

