export type DutyVisualState =
      | 'normal'
      | 'past'
      | 'completed'
      | 'overdue'
      | 'skipped'
      | 'cancelled';

export function todayValue() {
      return formatDateValue(new Date());
}

export { formatTime } from '@/lib/format';

export function formatDateValue(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
}

export function getWeekDateValues(dateText: string) {
      const [year, month, day] = dateText.split('-').map(Number);
      const baseDate = new Date(year, month - 1, day);
      const dayOfWeek = baseDate.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() + diffToMonday);

      return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return formatDateValue(date);
      });
}

export function getWeekdayLabel(dateText: string) {
      const [year, month, day] = dateText.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const dayIndex = date.getDay();

      if (dayIndex === 0) return 'CN';
      return `Thứ ${dayIndex + 1}`;
}

export function getShortDateLabel(dateText: string) {
      const [, month, day] = dateText.split('-');

      return `${day}/${month}`;
}

export function getPreviewDateLabel(dateText: string) {
      return `${getWeekdayLabel(dateText)} · ${getShortDateLabel(dateText)}`;
}

export function getDutyStatusLabel(status?: string | null) {
      if (status === 'completed') return 'Hoàn thành';
      if (status === 'in_progress') return 'Đang làm';
      if (status === 'confirmed') return 'Đã nhận';
      if (status === 'skipped') return 'Vắng / Không làm';
      if (status === 'cancelled') return 'Đã hủy';
      return 'Chưa làm';
}

export function getDutyStatusClass(status?: string | null) {
      if (status === 'completed') return 'border-green-100 bg-green-50 text-green-700';
      if (status === 'in_progress') return 'border-blue-100 bg-blue-50 text-blue-700';
      if (status === 'confirmed') return 'border-indigo-100 bg-indigo-50 text-indigo-700';
      if (status === 'skipped') return 'border-amber-100 bg-amber-50 text-amber-700';
      if (status === 'cancelled') return 'border-slate-200 bg-slate-100 text-slate-600';
      return 'border-orange-100 bg-orange-50 text-orange-700';
}

export function getAssigneeTypeLabel(type?: string | null) {
      if (type === 'team') return 'Tổ';
      if (type === 'room') return 'Phòng';
      if (type === 'committee') return 'Ban';
      return 'Học viên';
}

export function getDutyTypeLabel(type?: string | null) {
      if (type === 'weekly') return 'Hằng tuần';
      if (type === 'monthly') return 'Hằng tháng';
      return 'Hằng ngày';
}

export function getTimeValue(dateText: string, timeValue?: string | Date | null) {
      if (!dateText || !timeValue) return null;

      if (timeValue instanceof Date) {
            const hours = String(timeValue.getHours()).padStart(2, '0');
            const minutes = String(timeValue.getMinutes()).padStart(2, '0');
            const seconds = String(timeValue.getSeconds()).padStart(2, '0');

            return new Date(`${dateText}T${hours}:${minutes}:${seconds}`).getTime();
      }

      const text = String(timeValue);
      const timePart = text.includes(' ')
            ? text.split(' ')[1]
            : text.includes('T')
                  ? text.split('T')[1]
                  : text;

      const timeText = timePart.length === 5 ? `${timePart}:00` : timePart.slice(0, 8);
      return new Date(`${dateText}T${timeText}`).getTime();
}

export function isSameDateAsToday(dateText: string) {
      return dateText === todayValue();
}

export function isPastTime(dateText: string, timeValue?: string | Date | null) {
      const value = getTimeValue(dateText, timeValue);

      if (!value) return false;

      return value < Date.now();
}

export function getRoutineVisualState(entry: any, selectedDate: string): DutyVisualState {
      if (!isSameDateAsToday(selectedDate)) return 'normal';

      return isPastTime(selectedDate, entry.endTime || entry.startTime) ? 'past' : 'normal';
}

export function getDutyVisualState(entryOrAssignment: any, selectedDate: string): DutyVisualState {
      const status = entryOrAssignment.status;

      if (status === 'completed') return 'completed';
      if (status === 'skipped') return 'skipped';
      if (status === 'cancelled') return 'cancelled';

      if (!isSameDateAsToday(selectedDate)) return 'normal';

      const endTime =
            entryOrAssignment.endTime ||
            entryOrAssignment.endDateTime ||
            entryOrAssignment.dutyConfig?.endTime ||
            entryOrAssignment.startTime ||
            entryOrAssignment.startDateTime ||
            entryOrAssignment.dutyConfig?.startTime;

      return isPastTime(selectedDate, endTime) ? 'overdue' : 'normal';
}

export function getTimelineCardClass(type: 'routine' | 'duty', state: DutyVisualState) {
      if (type === 'routine' && state === 'past') {
            return 'border-slate-200 bg-slate-100/80 opacity-75';
      }

      if (type === 'duty' && state === 'completed') {
            return 'border-green-200 bg-green-50 ring-1 ring-green-100';
      }

      if (type === 'duty' && state === 'overdue') {
            return 'border-rose-200 bg-rose-50 ring-1 ring-rose-100';
      }

      if (type === 'duty' && state === 'skipped') {
            return 'border-amber-200 bg-amber-50 ring-1 ring-amber-100';
      }

      if (type === 'duty' && state === 'cancelled') {
            return 'border-slate-200 bg-slate-100 opacity-70';
      }

      return 'border-slate-200 bg-slate-50/70';
}

export function getVisualStateLabel(type: 'routine' | 'duty', state: DutyVisualState) {
      if (type === 'routine' && state === 'past') return 'Đã qua giờ';
      if (type === 'duty' && state === 'completed') return 'Đã hoàn thành';
      if (type === 'duty' && state === 'overdue') return 'Đã quá giờ';
      if (type === 'duty' && state === 'skipped') return 'Vắng / Không làm';
      if (type === 'duty' && state === 'cancelled') return 'Đã hủy';

      return '';
}

export function getVisualStateBadgeClass(type: 'routine' | 'duty', state: DutyVisualState) {
      if (type === 'routine' && state === 'past') {
            return 'border-slate-200 bg-white text-slate-500';
      }
      if (type === 'duty' && state === 'completed') {
            return 'border-green-200 bg-white text-green-700';
      }
      if (type === 'duty' && state === 'overdue') {
            return 'border-rose-200 bg-white text-rose-700';
      }
      if (type === 'duty' && state === 'skipped') {
            return 'border-amber-200 bg-white text-amber-700';
      }
      if (type === 'duty' && state === 'cancelled') {
            return 'border-slate-200 bg-white text-slate-500';
      }

      return 'border-slate-100 bg-slate-50 text-slate-600';
}

export function formatDateOnly(value: unknown): string {
      if (!value) return '';
      if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDateValue(value);
      const text = String(value).trim();
      if (!text) return '';
      const m = text.match(/^(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : text.slice(0, 10);
}

export function getAssignmentDate(assignment: any): string {
      return formatDateOnly(assignment.assignedDate || assignment.date);
}
