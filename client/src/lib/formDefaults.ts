/**
 * Shared default values for all forms — single source of truth.
 * Import từ đây thay vì hardcode giá trị mặc định trong từng form.
 */

/** Giới tính mặc định cho học viên mới */
export const DEFAULT_GENDER = 'female' as const;

/** Ngày sinh mặc định: 01/01/2000 (YYYY-MM-DD — giá trị cho HTML date input) */
export const DEFAULT_DOB = '2000-01-01';

/** Giá trị mặc định cho ô giờ (HH:MM) */
export const DEFAULT_TIME = '00:00';

/** Ngày nhập học mặc định: hôm nay */
export function defaultAdmissionDate(): string {
      return new Date().toISOString().split('T')[0];
}
