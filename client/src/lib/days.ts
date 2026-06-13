/**
 * Day-of-week constants and helpers — single source of truth.
 */

export type DayOfWeek =
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';

export const DAY_OPTIONS: { value: DayOfWeek; label: string; shortLabel: string; order: number }[] = [
      { value: 'monday',    label: 'Thứ Hai',   shortLabel: 'T2', order: 1 },
      { value: 'tuesday',   label: 'Thứ Ba',    shortLabel: 'T3', order: 2 },
      { value: 'wednesday', label: 'Thứ Tư',    shortLabel: 'T4', order: 3 },
      { value: 'thursday',  label: 'Thứ Năm',   shortLabel: 'T5', order: 4 },
      { value: 'friday',    label: 'Thứ Sáu',   shortLabel: 'T6', order: 5 },
      { value: 'saturday',  label: 'Thứ Bảy',   shortLabel: 'T7', order: 6 },
      { value: 'sunday',    label: 'Chủ Nhật',  shortLabel: 'CN', order: 0 },
];

/** Map from DayOfWeek string to Vietnamese label. */
export const DAY_LABELS: Record<DayOfWeek, string> = Object.fromEntries(
      DAY_OPTIONS.map((d) => [d.value, d.label])
) as Record<DayOfWeek, string>;

/** Sort order for each day (Sunday = 0, Monday = 1 … Saturday = 6). */
export const DAY_ORDER: Record<DayOfWeek, number> = Object.fromEntries(
      DAY_OPTIONS.map((d) => [d.value, d.order])
) as Record<DayOfWeek, number>;

export function getDayLabel(day: string): string {
      return DAY_LABELS[day as DayOfWeek] ?? day;
}

export function getDayOrder(day: string): number {
      return DAY_ORDER[day as DayOfWeek] ?? 9;
}

/** FormSelect-compatible options array. */
export const DAY_SELECT_OPTIONS = DAY_OPTIONS.map((d) => ({
      value: d.value,
      label: d.label,
}));
