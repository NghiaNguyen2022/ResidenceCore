'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DutyPreviewBox from './DutyPreviewBox';
import { formatTime } from '@/lib/format';
import { DAY_OPTIONS, type DayOfWeek } from '@/lib/days';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';
import { TimePickerInput } from '@/components/shared/form/TimePickerInput';

type AssignToType = 'resident' | 'team' | 'room' | 'committee';

type RepeatType = 'once' | 'weekly' | 'monthly';
type MonthlyMode = 'month_boundary' | 'day_of_month' | 'week_day';
type MonthBoundary = 'first_day' | 'last_day';
type MonthWeek = '1' | '2' | '3' | '4' | 'last';

type AssignmentForm = {
      dutyConfigId: string;
      assignedDate: string;
      startTime: string;
      endTime: string;
      assignedToType: AssignToType;
      assignedToId: string;
      assignedToIds: string[];
      assignWholeWeek: boolean;
      repeatType: RepeatType;
      repeatEndDate: string;
      weeklyDays: DayOfWeek[];
      monthlyMode: MonthlyMode;
      monthBoundary: MonthBoundary;
      monthDays: number[];
      monthWeeks: MonthWeek[];
      monthWeekDays: DayOfWeek[];
      notes: string;
      storeShiftType: '' | 'morning' | 'afternoon';
      storeLedgerId: string;
      primaryResidentId: string;
      openingCashPlanned: string;
};

type DutyAssignmentFormProps = {
      form: AssignmentForm;
      onChange: (form: AssignmentForm) => void;

      dutyConfigs: any[];
      selectedDutyConfig?: any | null;
      storeLedgers?: any[];
      assigneeOptions: Array<{
            id: number | string;
            label: string;
            todayCount?: number;
            weekCount?: number;
            monthCount?: number;
            isBusyToday?: boolean;
            isOverloaded?: boolean;
            recommendScore?: number;
            recommendLabel?: string;
      }>;

      previewEnabled: boolean;
      previewLoading?: boolean;
      preview?: {
            canCreateCount: number;
            skippedCount: number;
            items: Array<{
                  date: string;
                  assignedToId?: number;
                  canCreate: boolean;
                  reason?: string;
                  detail?: string;
                  conflictType?: string;
                  currentResidentCount?: number;
                  minPersons?: number | null;
                  maxPersons?: number | null;
            }>;
      } | null;

      isSaving?: boolean;
      onSave: () => void;
      onOpenDutyTemplateDialog: () => void;
      fullScreen?: boolean;
};

const MONTH_WEEK_OPTIONS: Array<{ value: MonthWeek; label: string }> = [
      { value: '1', label: 'Tuần 1' },
      { value: '2', label: 'Tuần 2' },
      { value: '3', label: 'Tuần 3' },
      { value: '4', label: 'Tuần 4' },
      { value: 'last', label: 'Tuần cuối' },
];

const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

const DAY_VALUE_BY_INDEX: DayOfWeek[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
];

function parseDateValue(dateText: string) {
      const [year, month, day] = dateText.split('-').map(Number);
      return new Date(year, month - 1, day);
}

function getDayOfWeekValue(dateText: string): DayOfWeek {
      const date = parseDateValue(dateText);
      return DAY_VALUE_BY_INDEX[date.getDay()] || 'monday';
}

function getWeekEndDate(dateText: string) {
      const date = parseDateValue(dateText);
      const endDate = new Date(date);
      endDate.setDate(date.getDate() + 6);

      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
}

function formatDateValue(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
}

function getEndOfCurrentMonth(dateText: string) {
      const date = parseDateValue(dateText);
      return formatDateValue(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function getEndAfterMonths(dateText: string, monthCount: number) {
      const date = parseDateValue(dateText);
      return formatDateValue(new Date(date.getFullYear(), date.getMonth() + monthCount, 0));
}

function normalizeJsonArray<T extends string | number>(value: unknown): T[] {
      if (Array.isArray(value)) return value as T[];

      if (typeof value === 'string' && value.trim()) {
            try {
                  const parsed = JSON.parse(value);
                  return Array.isArray(parsed) ? (parsed as T[]) : [];
            } catch {
                  return [];
            }
      }

      return [];
}

function getDutyConfigType(dutyConfig?: any | null) {
      return dutyConfig?.dutyType || dutyConfig?.frequency || 'daily';
}

function getConfigWeeklyDays(dutyConfig?: any | null): DayOfWeek[] {
      const configured = normalizeJsonArray<DayOfWeek>(dutyConfig?.weeklyDaysJson);

      if (configured.length > 0) return configured;

      if (Number.isInteger(dutyConfig?.dayOfWeek)) {
            return [DAY_VALUE_BY_INDEX[Number(dutyConfig.dayOfWeek)] || 'monday'];
      }

      return [];
}

function getConfigMonthWeeks(dutyConfig?: any | null): MonthWeek[] {
      const configured = normalizeJsonArray<MonthWeek>(dutyConfig?.monthWeeksJson);
      return configured.length > 0 ? configured : ['last'];
}

function getConfigMonthWeekDays(dutyConfig?: any | null): DayOfWeek[] {
      const configured = normalizeJsonArray<DayOfWeek>(dutyConfig?.monthWeekDaysJson);
      return configured.length > 0 ? configured : ['saturday'];
}

function getConfigMonthDays(dutyConfig?: any | null): number[] {
      return normalizeJsonArray<number>(dutyConfig?.monthDaysJson);
}

function getDutyTypeLabel(dutyConfig?: any | null) {
      const type = getDutyConfigType(dutyConfig);

      if (type === 'weekly') return 'Theo tuần';
      if (type === 'monthly') return 'Theo tháng';
      if (type === 'event') return 'Sự kiện / bất thường';

      return 'Theo ngày';
}

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function isStoreDutyConfig(dutyConfig?: any | null) {
      const code = normalizeCode(String(dutyConfig?.dutyCode || ''));
      const name = normalizeCode(String(dutyConfig?.dutyName || ''));

      return (
            code === 'STORE_SHIFT' ||
            code === 'TRUC_CUA_HANG' ||
            code.includes('CUA_HANG') ||
            name.includes('TRUC_CUA_HANG')
      );
}

function getScheduleSummary(dutyConfig?: any | null) {
      const type = getDutyConfigType(dutyConfig);

      if (type === 'weekly') {
            const days = getConfigWeeklyDays(dutyConfig)
                  .map((value) => DAY_OPTIONS.find((day) => day.value === value)?.label || value)
                  .join(', ');

            return days ? `Chỉ tạo vào: ${days}` : 'Chưa có thứ thực hiện trong mẫu.';
      }

      if (type === 'monthly') {
            const monthDays = getConfigMonthDays(dutyConfig);

            if (monthDays.length > 0) {
                  return `Chỉ tạo ngày ${monthDays.join(', ')} hằng tháng`;
            }

            const weeks = getConfigMonthWeeks(dutyConfig)
                  .map((week) => MONTH_WEEK_OPTIONS.find((item) => item.value === week)?.label || week)
                  .join(', ');
            const days = getConfigMonthWeekDays(dutyConfig)
                  .map((value) => DAY_OPTIONS.find((day) => day.value === value)?.label || value)
                  .join(', ');

            return `Chỉ tạo vào ${weeks}; ${days}`;
      }

      if (type === 'event') {
            return 'Tạo theo ngày hoặc chu kỳ sự kiện được chọn.';
      }

      return 'Tạo theo ngày hoặc chu kỳ từ ngày tới ngày.';
}

function buildPatchFromDutyConfig(duty: any, currentForm: AssignmentForm): Partial<AssignmentForm> {
      const type = getDutyConfigType(duty);

      if (type === 'weekly') {
            return {
                  dutyConfigId: String(duty?.id || ''),
                  startTime: formatTime(duty?.startTime),
                  endTime: formatTime(duty?.endTime),
                  assignWholeWeek: false,
                  repeatType: 'weekly',
                  repeatEndDate: currentForm.repeatEndDate || getWeekEndDate(currentForm.assignedDate),
                  weeklyDays: getConfigWeeklyDays(duty),
            };
      }

      if (type === 'monthly') {
            const monthDays = getConfigMonthDays(duty);

            return {
                  dutyConfigId: String(duty?.id || ''),
                  startTime: formatTime(duty?.startTime),
                  endTime: formatTime(duty?.endTime),
                  assignWholeWeek: false,
                  repeatType: 'monthly',
                  repeatEndDate: currentForm.repeatEndDate || currentForm.assignedDate,
                  monthlyMode: monthDays.length > 0 ? 'day_of_month' : 'week_day',
                  monthDays: monthDays.length > 0 ? monthDays : currentForm.monthDays,
                  monthWeeks: getConfigMonthWeeks(duty),
                  monthWeekDays: getConfigMonthWeekDays(duty),
            };
      }

      return {
            dutyConfigId: String(duty?.id || ''),
            startTime: formatTime(duty?.startTime),
            endTime: formatTime(duty?.endTime),
            assignWholeWeek: false,
            repeatType: 'once',
            repeatEndDate: currentForm.assignedDate,
            weeklyDays: [getDayOfWeekValue(currentForm.assignedDate)],
      };
}

function toggleValue<T extends string | number>(list: T[], value: T) {
      return list.includes(value)
            ? list.filter((item) => item !== value)
            : [...list, value];
}

function toggleAssigneeId(list: string[], value: string) {
      return list.includes(value)
            ? list.filter((item) => item !== value)
            : [...list, value];
}

function SelectionPill({
      active,
      children,
      onClick,
}: {
      active: boolean;
      children: ReactNode;
      onClick: () => void;
}) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className={[
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                        active
                              ? 'border-amber-100 bg-amber-100 text-amber-900 shadow-[0_4px_12px_rgba(120,53,15,0.035)]'
                              : 'border-amber-100 bg-white/88 text-slate-600 hover:bg-amber-50 hover:text-slate-900',
                  ].join(' ')}
            >
                  {children}
            </button>
      );
}

export function DutyAssignmentForm({
      form,
      onChange,
      dutyConfigs,
      selectedDutyConfig,
      storeLedgers = [],
      assigneeOptions,
      previewEnabled,
      previewLoading,
      preview,
      isSaving,
      onSave,
      onOpenDutyTemplateDialog,
      fullScreen = false,
}: DutyAssignmentFormProps) {
      const [showRepeatOptions, setShowRepeatOptions] = useState(form.repeatType !== 'once');
      const isStoreDuty = isStoreDutyConfig(selectedDutyConfig);

      const updateForm = (patch: Partial<AssignmentForm>) => {
            const nextForm = {
                  ...form,
                  ...patch,
            };

            if (patch.assignedDate) {
                  const selectedDay = getDayOfWeekValue(patch.assignedDate);

                  if (nextForm.repeatType === 'once') {
                        nextForm.repeatEndDate = patch.assignedDate;
                        nextForm.weeklyDays = [selectedDay];
                  }
            }

            onChange(nextForm);
      };

      const saveText = isSaving
            ? 'Đang lưu...'
            : preview?.canCreateCount
                  ? `Lưu ${preview.canCreateCount} phân công`
                  : 'Lưu phân công';

      return (
            <div
                  className={[
                        'rounded-xl border border-amber-100 bg-white/88 p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)]',
                        fullScreen ? 'border-0 bg-transparent p-0 shadow-none' : '',
                  ].join(' ')}
            >
                  <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                              <h2 className="text-xl font-bold text-slate-900">
                                    Phân công công tác
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                    Simple Mode: chọn ngày, giờ, công tác, nơi làm/ghi chú và đối tượng được phân công.
                              </p>
                        </div>

                        <button
                              type="button"
                              onClick={onOpenDutyTemplateDialog}
                              className="shrink-0 rounded-xl border border-amber-100 bg-white/88 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50"
                        >
                              Mẫu công tác
                        </button>
                  </div>

                  <div className="space-y-4">
                        {fullScreen && (
                              <div className="grid gap-3 md:grid-cols-3">
                                    <div className="rounded-xl border border-amber-100 bg-amber-50/55 px-3 py-2">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Gợi ý</p>
                                          <p className="mt-1 text-sm font-semibold text-slate-800">Ưu tiên người ít việc hơn trong ngày/tuần/tháng.</p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Lịch học</p>
                                          <p className="mt-1 text-sm font-semibold text-slate-800">Backend vẫn skip học viên trùng lịch học khi preview/lưu.</p>
                                    </div>
                                    <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Trùng công tác</p>
                                          <p className="mt-1 text-sm font-semibold text-slate-800">Cùng công tác/ngày/đối tượng sẽ được skip.</p>
                                    </div>
                              </div>
                        )}

                        <label className="space-y-1.5">
                              <Label>Công tác</Label>
                              <select
                                    value={form.dutyConfigId}
                                    onChange={(event) => {
                                          const duty = dutyConfigs.find(
                                                (item: any) =>
                                                      String(item.id) === event.target.value
                                          );

                                          const patch = buildPatchFromDutyConfig(duty, form);
                                          const storeDuty = isStoreDutyConfig(duty);

                                          updateForm({
                                                ...patch,
                                                assignedToType: storeDuty ? 'resident' : form.assignedToType,
                                                assignedToId: '',
                                                assignedToIds: [],
                                                storeShiftType: storeDuty ? form.storeShiftType || 'morning' : '',
                                                storeLedgerId:
                                                      storeDuty
                                                            ? form.storeLedgerId ||
                                                              String(storeLedgers[0]?.id || '')
                                                            : '',
                                                primaryResidentId: '',
                                                openingCashPlanned: storeDuty
                                                      ? form.openingCashPlanned || '0'
                                                      : '0',
                                                startTime: storeDuty
                                                      ? form.storeShiftType === 'afternoon'
                                                            ? '13:00'
                                                            : '07:00'
                                                      : patch.startTime || '',
                                                endTime: storeDuty
                                                      ? form.storeShiftType === 'afternoon'
                                                            ? '19:00'
                                                            : '14:00'
                                                      : patch.endTime || '',
                                          });
                                    }}
                                    className="h-10 w-full rounded-xl border border-amber-100 bg-white/88 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-100/80"
                              >
                                    <option value="">Chọn công tác</option>
                                    {dutyConfigs.map((duty: any) => (
                                          <option key={duty.id} value={duty.id}>
                                                {duty.dutyName}
                                          </option>
                                    ))}
                              </select>
                        </label>

                        {selectedDutyConfig?.description && (
                              <div className="rounded-xl bg-slate-50 px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-100">
                                    {selectedDutyConfig.description}
                              </div>
                        )}

                        {selectedDutyConfig && (
                              <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs leading-5 text-amber-800">
                                    <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded-full border border-amber-100 bg-white/80 px-2.5 py-1 font-bold text-amber-900">
                                                {getDutyTypeLabel(selectedDutyConfig)}
                                          </span>
                                          <span className="font-semibold text-amber-900">
                                                {getScheduleSummary(selectedDutyConfig)}
                                          </span>
                                    </div>
                                    <p className="mt-1 text-amber-700">
                                          Khi phân công, hệ thống chỉ tạo đúng ngày theo lịch đã chọn trong mẫu công tác.
                                    </p>
                              </div>
                        )}

                        <div className="grid gap-3 md:grid-cols-3">
                              <label className="space-y-1.5 md:col-span-1">
                                    <Label>Ngày</Label>
                                    <DatePickerInput
                                          value={form.assignedDate}
                                          onChange={(event) =>
                                                updateForm({
                                                      assignedDate: event.target.value,
                                                      repeatEndDate:
                                                            form.repeatEndDate || event.target.value,
                                                })
                                          }
                                          className="rounded-xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Giờ bắt đầu</Label>
                                    <TimePickerInput
                                          value={form.startTime}
                                          onChange={(event) =>
                                                updateForm({ startTime: event.target.value })
                                          }
                                          className="rounded-xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Giờ kết thúc</Label>
                                    <TimePickerInput
                                          value={form.endTime}
                                          onChange={(event) =>
                                                updateForm({ endTime: event.target.value })
                                          }
                                          className="rounded-xl"
                                    />
                              </label>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                              <label className="space-y-1.5">
                                    <Label>Giao cho</Label>
                                    <select
                                          value={form.assignedToType}
                                          onChange={(event) =>
                                                updateForm({
                                                      assignedToType: event.target.value as AssignToType,
                                                      assignedToId: '',
                                                      assignedToIds: [],
                                                })
                                          }
                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/88 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-100/80"
                                    >
                                          <option value="resident">Học viên</option>
                                          {!isStoreDuty && <option value="team">Tổ</option>}
                                          {!isStoreDuty && <option value="room">Phòng</option>}
                                          {!isStoreDuty && <option value="committee">Ban</option>}
                                    </select>
                              </label>

                              <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                          <Label>Đối tượng</Label>
                                          <span className="text-xs font-semibold text-amber-800">
                                                Đã chọn {(form.assignedToIds || []).length}
                                          </span>
                                    </div>

                                    <div className="max-h-72 overflow-y-auto rounded-xl border border-amber-100 bg-white/78 p-2">
                                          {assigneeOptions.map((option) => {
                                                const value = String(option.id);
                                                const active = (form.assignedToIds || []).includes(value);

                                                return (
                                                      <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => {
                                                                  const nextIds = toggleAssigneeId(
                                                                        form.assignedToIds || [],
                                                                        value
                                                                  );

                                                                  updateForm({
                                                                        assignedToIds: nextIds,
                                                                        assignedToId: nextIds[0] || '',
                                                                        primaryResidentId:
                                                                              isStoreDuty &&
                                                                              !nextIds.includes(form.primaryResidentId)
                                                                                    ? nextIds[0] || ''
                                                                                    : form.primaryResidentId,
                                                                  });
                                                            }}
                                                            className={[
                                                                  'mb-2 flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm transition last:mb-0',
                                                                  active
                                                                        ? 'border-amber-200 bg-amber-50 text-amber-900'
                                                                        : 'border-amber-100 bg-white/90 text-slate-600 hover:bg-amber-50',
                                                            ].join(' ')}
                                                      >
                                                            <span className="min-w-0">
                                                                  <span className="line-clamp-1 font-semibold">
                                                                        {option.label}
                                                                  </span>
                                                                  <span className="mt-1 flex flex-wrap gap-1 text-[11px] font-semibold">
                                                                        <span className="rounded-full border border-amber-100 bg-white/80 px-2 py-0.5 text-amber-800">
                                                                              Hôm nay {option.todayCount || 0}
                                                                        </span>
                                                                        <span className="rounded-full border border-slate-100 bg-white/80 px-2 py-0.5 text-slate-600">
                                                                              Tuần {option.weekCount || 0}
                                                                        </span>
                                                                        <span className="rounded-full border border-slate-100 bg-white/80 px-2 py-0.5 text-slate-600">
                                                                              Tháng {option.monthCount || 0}
                                                                        </span>
                                                                        {option.isOverloaded ? (
                                                                              <span className="rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-rose-700">
                                                                                    Nhiều việc
                                                                              </span>
                                                                        ) : (
                                                                              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                                                                    Gợi ý
                                                                              </span>
                                                                        )}
                                                                  </span>
                                                            </span>
                                                            <span
                                                                  className={[
                                                                        'h-4 w-4 shrink-0 rounded-full border',
                                                                        active
                                                                              ? 'border-amber-500 bg-amber-400'
                                                                              : 'border-slate-300 bg-white',
                                                                  ].join(' ')}
                                                            />
                                                      </button>
                                                );
                                          })}
                                    </div>

                                    <p className="text-xs leading-5 text-slate-500">
                                          Có thể chọn nhiều học viên/Tổ/Ban. Hệ thống vẫn kiểm tra trùng lịch học và trùng công tác cho từng đối tượng trước khi lưu.
                                    </p>
                              </div>
                        </div>

                        {isStoreDuty && (
                              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                                    <div className="mb-3">
                                          <p className="text-sm font-bold text-amber-950">
                                                Thiết lập ca trực cửa hàng
                                          </p>
                                          <p className="mt-1 text-xs leading-5 text-amber-800">
                                                Ca sáng được truy cập từ 07:00–14:00; ca chiều từ 13:00–19:00.
                                                Mã truy cập sẽ được triển khai ở bước 16L3.
                                          </p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                          <label className="space-y-1.5">
                                                <Label>Ca trực</Label>
                                                <select
                                                      value={form.storeShiftType}
                                                      onChange={(event) => {
                                                            const shiftType = event.target.value as
                                                                  | 'morning'
                                                                  | 'afternoon';

                                                            updateForm({
                                                                  storeShiftType: shiftType,
                                                                  startTime:
                                                                        shiftType === 'afternoon'
                                                                              ? '13:00'
                                                                              : '07:00',
                                                                  endTime:
                                                                        shiftType === 'afternoon'
                                                                              ? '19:00'
                                                                              : '14:00',
                                                            });
                                                      }}
                                                      className="h-10 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-amber-100"
                                                >
                                                      <option value="">Chọn ca</option>
                                                      <option value="morning">Ca sáng · 07:00–14:00</option>
                                                      <option value="afternoon">Ca chiều · 13:00–19:00</option>
                                                </select>
                                          </label>

                                          <label className="space-y-1.5">
                                                <Label>Cửa hàng</Label>
                                                <select
                                                      value={form.storeLedgerId}
                                                      onChange={(event) =>
                                                            updateForm({
                                                                  storeLedgerId: event.target.value,
                                                            })
                                                      }
                                                      className="h-10 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-amber-100"
                                                >
                                                      <option value="">Chọn cửa hàng</option>
                                                      {storeLedgers.map((ledger: any) => (
                                                            <option key={ledger.id} value={ledger.id}>
                                                                  {ledger.ledgerName || ledger.ledgerCode}
                                                            </option>
                                                      ))}
                                                </select>
                                          </label>

                                          <label className="space-y-1.5">
                                                <Label>Học viên trực chính</Label>
                                                <select
                                                      value={form.primaryResidentId}
                                                      onChange={(event) =>
                                                            updateForm({
                                                                  primaryResidentId: event.target.value,
                                                            })
                                                      }
                                                      className="h-10 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-amber-100"
                                                >
                                                      <option value="">Chọn người trực chính</option>
                                                      {assigneeOptions
                                                            .filter((option) =>
                                                                  (form.assignedToIds || []).includes(
                                                                        String(option.id)
                                                                  )
                                                            )
                                                            .map((option) => (
                                                                  <option key={option.id} value={option.id}>
                                                                        {option.label}
                                                                  </option>
                                                            ))}
                                                </select>
                                          </label>

                                          <label className="space-y-1.5">
                                                <Label>Tiền đầu ca dự kiến</Label>
                                                <Input
                                                      type="number"
                                                      min="0"
                                                      step="1000"
                                                      value={form.openingCashPlanned}
                                                      onChange={(event) =>
                                                            updateForm({
                                                                  openingCashPlanned: event.target.value,
                                                            })
                                                      }
                                                      className="rounded-xl border-amber-200 bg-white"
                                                />
                                          </label>
                                    </div>
                              </div>
                        )}

                        <label className="space-y-1.5">
                              <Label>Nơi làm / ghi chú ngắn</Label>
                              <Textarea
                                    value={form.notes}
                                    onChange={(event) =>
                                          updateForm({ notes: event.target.value })
                                    }
                                    placeholder="Ví dụ: Sảnh chính, nhà ăn, khu sân. Nội dung này sẽ hiện ở cột Nơi làm."
                                    className="min-h-[80px] rounded-xl"
                              />
                        </label>

                        <div className="rounded-xl border border-amber-100 bg-amber-50/45 p-3">
                              <button
                                    type="button"
                                    onClick={() => setShowRepeatOptions((current) => !current)}
                                    className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-slate-700"
                              >
                                    <span>Phạm vi phân công</span>
                                    {showRepeatOptions ? (
                                          <ChevronUp className="h-4 w-4" />
                                    ) : (
                                          <ChevronDown className="h-4 w-4" />
                                    )}
                              </button>

                              {!showRepeatOptions && (
                                    <p className="mt-1 text-xs text-slate-500">
                                          Mặc định tạo theo đúng lịch của mẫu công tác trên ngày đang chọn.
                                    </p>
                              )}

                              {showRepeatOptions && (
                                    <div className="mt-3 space-y-4">
                                          <div className="grid gap-2 sm:grid-cols-3">
                                                {[
                                                      {
                                                            value: 'once',
                                                            label: 'Một ngày',
                                                            description: 'Chỉ tạo nếu ngày đang chọn phù hợp với lịch mẫu.',
                                                      },
                                                      {
                                                            value: 'weekly',
                                                            label: 'Chu kỳ từ ngày tới ngày',
                                                            description: 'Tạo các ngày hợp lệ theo mẫu trong khoảng đã chọn.',
                                                      },
                                                      {
                                                            value: 'monthly',
                                                            label: 'Theo tháng',
                                                            description: 'Tạo các ngày hợp lệ theo mẫu tháng trong khoảng đã chọn.',
                                                      },
                                                ].map((item) => (
                                                      <button
                                                            key={item.value}
                                                            type="button"
                                                            onClick={() => {
                                                                  updateForm({
                                                                        repeatType: item.value as RepeatType,
                                                                        assignWholeWeek: false,
                                                                        repeatEndDate:
                                                                              item.value === 'once'
                                                                                    ? form.assignedDate
                                                                                    : form.repeatEndDate || form.assignedDate,
                                                                  });
                                                            }}
                                                            className={[
                                                                  'rounded-xl border p-3 text-left transition',
                                                                  form.repeatType === item.value
                                                                        ? 'border-amber-200 bg-amber-50 text-amber-900 shadow-[0_4px_12px_rgba(120,53,15,0.035)]'
                                                                        : 'border-amber-100 bg-white/88 text-slate-600 hover:bg-amber-50',
                                                            ].join(' ')}
                                                      >
                                                            <p className="text-sm font-semibold">{item.label}</p>
                                                            <p className="mt-1 text-xs leading-5 opacity-80">
                                                                  {item.description}
                                                            </p>
                                                      </button>
                                                ))}
                                          </div>

                                          {form.repeatType !== 'once' && (
                                                <label className="block space-y-1.5">
                                                      <Label>Đến ngày</Label>
                                                      <DatePickerInput
                                                            value={form.repeatEndDate || form.assignedDate}
                                                            min={form.assignedDate || undefined}
                                                            onChange={(event) =>
                                                                  updateForm({ repeatEndDate: event.target.value })
                                                            }
                                                            className="rounded-xl bg-white"
                                                      />
                                                </label>
                                          )}

                                          {form.repeatType === 'monthly' && (
                                                <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2">
                                                      <p className="mb-2 text-xs font-semibold text-slate-800">
                                                            Phạm vi tháng
                                                      </p>
                                                      <div className="flex flex-wrap gap-2">
                                                            {[
                                                                  {
                                                                        label: 'Tháng hiện tại',
                                                                        value: getEndOfCurrentMonth(form.assignedDate),
                                                                        helper: 'Từ ngày phân công đến cuối tháng',
                                                                  },
                                                                  {
                                                                        label: '1 tháng',
                                                                        value: getEndAfterMonths(form.assignedDate, 1),
                                                                  },
                                                                  {
                                                                        label: '2 tháng',
                                                                        value: getEndAfterMonths(form.assignedDate, 2),
                                                                  },
                                                                  {
                                                                        label: '3 tháng',
                                                                        value: getEndAfterMonths(form.assignedDate, 3),
                                                                  },
                                                            ].map((item) => (
                                                                  <button
                                                                        key={item.label}
                                                                        type="button"
                                                                        onClick={() =>
                                                                              updateForm({
                                                                                    repeatType: 'monthly',
                                                                                    repeatEndDate: item.value,
                                                                              })
                                                                        }
                                                                        className={[
                                                                              'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                                                                              form.repeatEndDate === item.value
                                                                                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                                                                                    : 'border-amber-100 bg-white/88 text-slate-600 hover:bg-amber-50',
                                                                        ].join(' ')}
                                                                  >
                                                                        {item.label}
                                                                  </button>
                                                            ))}
                                                      </div>
                                                </div>
                                          )}

                                          {selectedDutyConfig && (
                                                <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2 text-xs leading-5 text-slate-600">
                                                      <p className="font-semibold text-slate-800">Lịch áp dụng từ mẫu</p>
                                                      <p className="mt-1">{getScheduleSummary(selectedDutyConfig)}</p>
                                                </div>
                                          )}
                                    </div>
                              )}
                        </div>

                        <DutyPreviewBox
                              isEnabled={previewEnabled}
                              isLoading={previewLoading}
                              preview={preview}
                        />

                        <button
                              type="button"
                              onClick={onSave}
                              disabled={
                                    isSaving ||
                                    previewLoading ||
                                    (previewEnabled && preview?.canCreateCount === 0)
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-100 px-3 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                              <Users className="h-4 w-4" />
                              {saveText}
                        </button>
                  </div>
            </div>
      );
}

export default DutyAssignmentForm;
