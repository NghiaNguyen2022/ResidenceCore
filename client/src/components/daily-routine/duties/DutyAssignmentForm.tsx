'use client';

import type { ReactNode } from 'react';
import { Users } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DutyPreviewBox from './DutyPreviewBox';

type AssignToType = 'resident' | 'team' | 'room' | 'committee';

type DayOfWeek =
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';

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
};

type DutyAssignmentFormProps = {
      form: AssignmentForm;
      onChange: (form: AssignmentForm) => void;

      dutyConfigs: any[];
      selectedDutyConfig?: any | null;
      assigneeOptions: Array<{ id: number | string; label: string }>;

      previewEnabled: boolean;
      previewLoading?: boolean;
      preview?: {
            canCreateCount: number;
            skippedCount: number;
            items: Array<{
                  date: string;
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
};

const DAY_OPTIONS: Array<{ value: DayOfWeek; label: string }> = [
      { value: 'monday', label: 'Thứ 2' },
      { value: 'tuesday', label: 'Thứ 3' },
      { value: 'wednesday', label: 'Thứ 4' },
      { value: 'thursday', label: 'Thứ 5' },
      { value: 'friday', label: 'Thứ 6' },
      { value: 'saturday', label: 'Thứ 7' },
      { value: 'sunday', label: 'Chúa nhật' },
];

const MONTH_WEEK_OPTIONS: Array<{ value: MonthWeek; label: string }> = [
      { value: '1', label: 'Tuần 1' },
      { value: '2', label: 'Tuần 2' },
      { value: '3', label: 'Tuần 3' },
      { value: '4', label: 'Tuần 4' },
      { value: 'last', label: 'Tuần cuối' },
];

const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

function formatTime(value?: string | Date | null) {
      if (!value) return '';

      if (value instanceof Date) {
            return `${String(value.getUTCHours()).padStart(2, '0')}:${String(
                  value.getUTCMinutes()
            ).padStart(2, '0')}`;
      }

      const text = String(value).trim();

      if (/^\d{2}:\d{2}/.test(text)) return text.slice(0, 5);

      if (text.includes('T')) {
            const date = new Date(text);

            if (!Number.isNaN(date.getTime())) {
                  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(
                        date.getUTCMinutes()
                  ).padStart(2, '0')}`;
            }

            return text.split('T')[1]?.slice(0, 5) || '';
      }

      if (text.includes(' ')) return text.split(' ')[1]?.slice(0, 5) || '';

      return text.slice(0, 5);
}

function toggleValue<T extends string | number>(list: T[], value: T) {
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
                        'rounded-2xl border px-3 py-2 text-xs font-semibold transition',
                        active
                              ? 'border-blue-200 bg-blue-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
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
      assigneeOptions,
      previewEnabled,
      previewLoading,
      preview,
      isSaving,
      onSave,
      onOpenDutyTemplateDialog,
}: DutyAssignmentFormProps) {
      const updateForm = (patch: Partial<AssignmentForm>) => {
            onChange({
                  ...form,
                  ...patch,
            });
      };

      const isRepeatAssignment = form.repeatType !== 'once';

      const saveText = isSaving
            ? 'Đang lưu...'
            : preview?.canCreateCount
                  ? `Lưu ${preview.canCreateCount} ngày`
                  : 'Lưu phân công';

      return (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                              <h2 className="text-xl font-bold text-slate-950">
                                    Tạo phân công
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                    Giao công tác nhanh cho học viên, Tổ, phòng ngủ hoặc Ban.
                              </p>
                        </div>

                        <button
                              type="button"
                              onClick={onOpenDutyTemplateDialog}
                              className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                              Mẫu công tác
                        </button>
                  </div>

                  <div className="space-y-4">
                        <label className="space-y-1.5">
                              <Label>Ngày bắt đầu</Label>
                              <Input
                                    type="date"
                                    value={form.assignedDate}
                                    onChange={(event) =>
                                          updateForm({
                                                assignedDate: event.target.value,
                                                repeatEndDate:
                                                      form.repeatEndDate || event.target.value,
                                          })
                                    }
                                    className="rounded-2xl"
                              />
                        </label>

                        <label className="space-y-1.5">
                              <Label>Công tác</Label>
                              <select
                                    value={form.dutyConfigId}
                                    onChange={(event) => {
                                          const duty = dutyConfigs.find(
                                                (item: any) =>
                                                      String(item.id) === event.target.value
                                          );

                                          updateForm({
                                                dutyConfigId: event.target.value,
                                                startTime: formatTime(duty?.startTime),
                                                endTime: formatTime(duty?.endTime),
                                          });
                                    }}
                                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                              >
                                    <option value="">Chọn công tác</option>
                                    {dutyConfigs.map((duty: any) => (
                                          <option key={duty.id} value={duty.id}>
                                                {duty.dutyName}
                                          </option>
                                    ))}
                              </select>
                        </label>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                              <div>
                                    <Label>Chu kỳ thực hiện</Label>
                                    <p className="mt-1 text-xs text-slate-500">
                                          Chọn một ngày, theo tuần hoặc theo tháng để hệ thống tự tạo các ngày công tác phù hợp.
                                    </p>
                              </div>

                              <div className="mt-3 grid grid-cols-3 gap-2">
                                    {[
                                          { value: 'once', label: 'Một ngày' },
                                          { value: 'weekly', label: 'Theo tuần' },
                                          { value: 'monthly', label: 'Theo tháng' },
                                    ].map((item) => (
                                          <button
                                                key={item.value}
                                                type="button"
                                                onClick={() =>
                                                      updateForm({
                                                            repeatType: item.value as RepeatType,
                                                            assignWholeWeek: item.value !== 'once',
                                                            repeatEndDate:
                                                                  item.value === 'once'
                                                                        ? form.assignedDate
                                                                        : form.repeatEndDate || form.assignedDate,
                                                      })
                                                }
                                                className={[
                                                      'rounded-2xl border px-3 py-2 text-sm font-semibold transition',
                                                      form.repeatType === item.value
                                                            ? 'border-blue-200 bg-blue-600 text-white shadow-sm'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-white hover:text-slate-900',
                                                ].join(' ')}
                                          >
                                                {item.label}
                                          </button>
                                    ))}
                              </div>

                              {isRepeatAssignment && (
                                    <label className="mt-4 block space-y-1.5">
                                          <Label>Đến ngày</Label>
                                          <Input
                                                type="date"
                                                value={form.repeatEndDate || form.assignedDate}
                                                min={form.assignedDate || undefined}
                                                onChange={(event) =>
                                                      updateForm({ repeatEndDate: event.target.value })
                                                }
                                                className="rounded-2xl bg-white"
                                          />
                                    </label>
                              )}

                              {form.repeatType === 'weekly' && (
                                    <div className="mt-4 space-y-2">
                                          <Label>Ngày thực hiện trong tuần</Label>
                                          <div className="flex flex-wrap gap-2">
                                                {DAY_OPTIONS.map((day) => (
                                                      <SelectionPill
                                                            key={day.value}
                                                            active={form.weeklyDays.includes(day.value)}
                                                            onClick={() =>
                                                                  updateForm({
                                                                        weeklyDays: toggleValue(
                                                                              form.weeklyDays,
                                                                              day.value
                                                                        ),
                                                                  })
                                                            }
                                                      >
                                                            {day.label}
                                                      </SelectionPill>
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {form.repeatType === 'monthly' && (
                                    <div className="mt-4 space-y-4">
                                          <label className="space-y-1.5">
                                                <Label>Kiểu lặp tháng</Label>
                                                <select
                                                      value={form.monthlyMode}
                                                      onChange={(event) =>
                                                            updateForm({
                                                                  monthlyMode: event.target.value as MonthlyMode,
                                                            })
                                                      }
                                                      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                                                >
                                                      <option value="month_boundary">
                                                            Ngày đầu / cuối tháng
                                                      </option>
                                                      <option value="day_of_month">
                                                            Ngày cố định trong tháng
                                                      </option>
                                                      <option value="week_day">
                                                            Theo tuần / thứ trong tháng
                                                      </option>
                                                </select>
                                          </label>

                                          {form.monthlyMode === 'month_boundary' && (
                                                <div className="space-y-2">
                                                      <Label>Chọn ngày</Label>
                                                      <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() =>
                                                                        updateForm({
                                                                              monthBoundary: 'first_day',
                                                                        })
                                                                  }
                                                                  className={[
                                                                        'rounded-2xl border px-3 py-2 text-sm font-semibold',
                                                                        form.monthBoundary === 'first_day'
                                                                              ? 'border-blue-200 bg-blue-600 text-white'
                                                                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                                                  ].join(' ')}
                                                            >
                                                                  Ngày đầu tháng
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={() =>
                                                                        updateForm({
                                                                              monthBoundary: 'last_day',
                                                                        })
                                                                  }
                                                                  className={[
                                                                        'rounded-2xl border px-3 py-2 text-sm font-semibold',
                                                                        form.monthBoundary === 'last_day'
                                                                              ? 'border-blue-200 bg-blue-600 text-white'
                                                                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                                                  ].join(' ')}
                                                            >
                                                                  Ngày cuối tháng
                                                            </button>
                                                      </div>
                                                      <p className="text-xs leading-5 text-slate-500">
                                                            Ngày cuối tháng sẽ tự tính theo từng tháng: 28/29/30/31.
                                                      </p>
                                                </div>
                                          )}

                                          {form.monthlyMode === 'day_of_month' && (
                                                <div className="space-y-2">
                                                      <Label>Ngày cố định trong tháng</Label>
                                                      <div className="grid grid-cols-7 gap-2">
                                                            {MONTH_DAYS.map((day) => (
                                                                  <SelectionPill
                                                                        key={day}
                                                                        active={form.monthDays.includes(day)}
                                                                        onClick={() =>
                                                                              updateForm({
                                                                                    monthDays: toggleValue(
                                                                                          form.monthDays,
                                                                                          day
                                                                                    ),
                                                                              })
                                                                        }
                                                                  >
                                                                        {day}
                                                                  </SelectionPill>
                                                            ))}
                                                      </div>
                                                      <p className="text-xs leading-5 text-slate-500">
                                                            Nếu tháng không có ngày đã chọn, hệ thống sẽ bỏ qua tháng đó.
                                                      </p>
                                                </div>
                                          )}

                                          {form.monthlyMode === 'week_day' && (
                                                <div className="space-y-4">
                                                      <div className="space-y-2">
                                                            <Label>Tuần trong tháng</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                  {MONTH_WEEK_OPTIONS.map((week) => (
                                                                        <SelectionPill
                                                                              key={week.value}
                                                                              active={form.monthWeeks.includes(
                                                                                    week.value
                                                                              )}
                                                                              onClick={() =>
                                                                                    updateForm({
                                                                                          monthWeeks: toggleValue(
                                                                                                form.monthWeeks,
                                                                                                week.value
                                                                                          ),
                                                                                    })
                                                                              }
                                                                        >
                                                                              {week.label}
                                                                        </SelectionPill>
                                                                  ))}
                                                            </div>
                                                      </div>

                                                      <div className="space-y-2">
                                                            <Label>Thứ thực hiện</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                  {DAY_OPTIONS.map((day) => (
                                                                        <SelectionPill
                                                                              key={day.value}
                                                                              active={form.monthWeekDays.includes(
                                                                                    day.value
                                                                              )}
                                                                              onClick={() =>
                                                                                    updateForm({
                                                                                          monthWeekDays: toggleValue(
                                                                                                form.monthWeekDays,
                                                                                                day.value
                                                                                          ),
                                                                                    })
                                                                              }
                                                                        >
                                                                              {day.label}
                                                                        </SelectionPill>
                                                                  ))}
                                                            </div>
                                                      </div>
                                                </div>
                                          )}
                                    </div>
                              )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                              <label className="space-y-1.5">
                                    <Label>Giờ bắt đầu</Label>
                                    <Input
                                          type="time"
                                          value={form.startTime}
                                          onChange={(event) =>
                                                updateForm({ startTime: event.target.value })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>

                              <label className="space-y-1.5">
                                    <Label>Giờ kết thúc</Label>
                                    <Input
                                          type="time"
                                          value={form.endTime}
                                          onChange={(event) =>
                                                updateForm({ endTime: event.target.value })
                                          }
                                          className="rounded-2xl"
                                    />
                              </label>
                        </div>

                        <label className="space-y-1.5">
                              <Label>Giao cho</Label>
                              <select
                                    value={form.assignedToType}
                                    onChange={(event) =>
                                          updateForm({
                                                assignedToType: event.target.value as AssignToType,
                                                assignedToId: '',
                                          })
                                    }
                                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                              >
                                    <option value="resident">Học viên</option>
                                    <option value="team">Tổ</option>
                                    <option value="room">Phòng</option>
                                    <option value="committee">Ban</option>
                              </select>
                        </label>

                        <label className="space-y-1.5">
                              <Label>Đối tượng</Label>
                              <select
                                    value={form.assignedToId}
                                    onChange={(event) =>
                                          updateForm({ assignedToId: event.target.value })
                                    }
                                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                              >
                                    <option value="">Chọn đối tượng</option>
                                    {assigneeOptions.map((option) => (
                                          <option key={option.id} value={option.id}>
                                                {option.label}
                                          </option>
                                    ))}
                              </select>
                        </label>

                        <label className="space-y-1.5">
                              <Label>Ghi chú</Label>
                              <Textarea
                                    value={form.notes}
                                    onChange={(event) =>
                                          updateForm({ notes: event.target.value })
                                    }
                                    placeholder="Ghi chú thêm nếu cần"
                                    className="min-h-[80px] rounded-2xl"
                              />
                        </label>

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
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                              <Users className="h-4 w-4" />
                              {saveText}
                        </button>
                  </div>
            </div>
      );
}

export default DutyAssignmentForm;
