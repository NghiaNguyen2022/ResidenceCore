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

const MONTH_WEEK_OPTIONS: Array<{ value: MonthWeek; label: string }> = [
      { value: '1', label: 'Tuần 1' },
      { value: '2', label: 'Tuần 2' },
      { value: '3', label: 'Tuần 3' },
      { value: '4', label: 'Tuần 4' },
      { value: 'last', label: 'Tuần cuối' },
];

const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

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
      assigneeOptions,
      previewEnabled,
      previewLoading,
      preview,
      isSaving,
      onSave,
      onOpenDutyTemplateDialog,
}: DutyAssignmentFormProps) {
      const [showRepeatOptions, setShowRepeatOptions] = useState(form.repeatType !== 'once');

      const updateForm = (patch: Partial<AssignmentForm>) => {
            onChange({
                  ...form,
                  ...patch,
            });
      };

      const saveText = isSaving
            ? 'Đang lưu...'
            : preview?.canCreateCount
                  ? `Lưu ${preview.canCreateCount} phân công`
                  : 'Lưu phân công';

      return (
            <div className="rounded-xl border border-amber-100 bg-white/88 p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)]">
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
                                    className="h-10 w-full rounded-xl border border-amber-100 bg-white/88 px-3 text-sm"
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
                              <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-1.5 text-xs leading-5 text-amber-800">
                                    <p className="font-bold text-amber-900">Mẫu công tác liên kết</p>
                                    <p>
                                          Công tác này có thể có các nhiệm vụ nhỏ/checklist ở phần mẫu. Phần bên dưới chỉ dùng để phân công: ngày, nơi làm và đối tượng thực hiện.
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
                                    <Input
                                          type="time"
                                          value={form.startTime}
                                          onChange={(event) =>
                                                updateForm({ startTime: event.target.value })
                                          }
                                          className="rounded-xl"
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
                                                })
                                          }
                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/88 px-3 text-sm"
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
                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/88 px-3 text-sm"
                                    >
                                          <option value="">Chọn đối tượng</option>
                                          {assigneeOptions.map((option) => (
                                                <option key={option.id} value={option.id}>
                                                      {option.label}
                                                </option>
                                          ))}
                                    </select>
                              </label>
                        </div>

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

                        <div className="rounded-xl border border-amber-100 bg-amber-50/60/70 p-3">
                              <button
                                    type="button"
                                    onClick={() => setShowRepeatOptions((current) => !current)}
                                    className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-slate-700"
                              >
                                    <span>Tùy chọn lặp lại</span>
                                    {showRepeatOptions ? (
                                          <ChevronUp className="h-4 w-4" />
                                    ) : (
                                          <ChevronDown className="h-4 w-4" />
                                    )}
                              </button>

                              {!showRepeatOptions && (
                                    <p className="mt-1 text-xs text-slate-500">
                                          Mặc định chỉ tạo công tác cho một ngày đã chọn.
                                    </p>
                              )}

                              {showRepeatOptions && (
                                    <div className="mt-3 space-y-4">
                                          <div className="grid grid-cols-3 gap-2">
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
                                                                        weeklyDays:
                                                                              item.value === 'weekly' && !form.weeklyDays?.length
                                                                                    ? ['monday']
                                                                                    : form.weeklyDays,
                                                                        monthDays:
                                                                              item.value === 'monthly' && !form.monthDays?.length
                                                                                    ? [1]
                                                                                    : form.monthDays,
                                                                  })
                                                            }
                                                            className={[
                                                                  'rounded-xl border px-3 py-1.5 text-sm font-semibold transition',
                                                                  form.repeatType === item.value
                                                                        ? 'border-amber-100 bg-amber-100 text-amber-900 shadow-[0_4px_12px_rgba(120,53,15,0.035)]'
                                                                        : 'border-amber-100 bg-white/88 text-slate-600 hover:bg-white hover:text-slate-900',
                                                            ].join(' ')}
                                                      >
                                                            {item.label}
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

                                          {form.repeatType === 'weekly' && (
                                                <div className="space-y-2">
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
                                                <div className="space-y-4">
                                                      <label className="space-y-1.5">
                                                            <Label>Kiểu lặp tháng</Label>
                                                            <select
                                                                  value={form.monthlyMode}
                                                                  onChange={(event) =>
                                                                        updateForm({
                                                                              monthlyMode: event.target.value as MonthlyMode,
                                                                        })
                                                                  }
                                                                  className="h-10 w-full rounded-xl border border-amber-100 bg-white/88 px-3 text-sm"
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
                                                            <div className="grid grid-cols-2 gap-2">
                                                                  <SelectionPill
                                                                        active={form.monthBoundary === 'first_day'}
                                                                        onClick={() => updateForm({ monthBoundary: 'first_day' })}
                                                                  >
                                                                        Ngày đầu tháng
                                                                  </SelectionPill>
                                                                  <SelectionPill
                                                                        active={form.monthBoundary === 'last_day'}
                                                                        onClick={() => updateForm({ monthBoundary: 'last_day' })}
                                                                  >
                                                                        Ngày cuối tháng
                                                                  </SelectionPill>
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
