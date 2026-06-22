'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { trpc } from '@/lib/trpc';
import TemplateSelector from './TemplateSelector';
import { DEFAULT_TIME } from '@/lib/formDefaults';
import { DAY_OPTIONS, type DayOfWeek } from '@/lib/days';

type DutyType = 'daily' | 'weekly' | 'monthly' | 'event';
type StageType = 'normal' | 'preparation' | 'during' | 'after';
type MonthWeek = '1' | '2' | '3' | '4' | 'last';

interface ChecklistItem {
      id?: number;
      itemOrder: number;
      checklistItem: string;
      isRequired: boolean;
      description?: string;
      stageType?: StageType;
      minPersons?: number;
      maxPersons?: number;
      estimatedTimeMinutes?: number;
}

interface DutyTemplate {
      id: number;
      templateCode: string;
      templateName: string;
      dutyType: DutyType;
      startTime: string;
      endTime: string;
      minPersons: number;
      maxPersons: number;
      description: string;
      isActive: boolean;
}

interface DutyConfigFormProps {
      duty?: any;
      onSave: () => void;
      onCancel: () => void;
}

const DUTY_TYPE_OPTIONS: Array<{ value: DutyType; label: string; description: string }> = [
      {
            value: 'daily',
            label: 'Theo ngày',
            description: 'Đi chợ, nấu ăn, vệ sinh khu vực chung, phòng ngủ, trực cửa hàng.',
      },
      {
            value: 'weekly',
            label: 'Theo tuần',
            description: 'Tập hát, vệ sinh toàn lưu xá, các việc lặp 2-4 lần mỗi tuần.',
      },
      {
            value: 'monthly',
            label: 'Theo tháng',
            description: 'Tổng vệ sinh hoặc các việc lặp theo tuần 1, tuần 3, tuần cuối tháng.',
      },
      {
            value: 'event',
            label: 'Sự kiện / bất thường',
            description: 'Công tác phát sinh theo sự kiện, chia chuẩn bị / diễn ra / sau sự kiện.',
      },
];

const MONTH_WEEK_OPTIONS: Array<{ value: MonthWeek; label: string }> = [
      { value: '1', label: 'Tuần 1' },
      { value: '2', label: 'Tuần 2' },
      { value: '3', label: 'Tuần 3' },
      { value: '4', label: 'Tuần 4' },
      { value: 'last', label: 'Tuần cuối' },
];

const STAGE_OPTIONS: Array<{ value: StageType; label: string }> = [
      { value: 'normal', label: 'Thông thường' },
      { value: 'preparation', label: 'Chuẩn bị' },
      { value: 'during', label: 'Trong khi diễn ra' },
      { value: 'after', label: 'Sau khi diễn ra' },
];

function normalizeArrayValue<T extends string>(value: unknown): T[] {
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

function TogglePill({
      active,
      children,
      onClick,
}: {
      active: boolean;
      children: React.ReactNode;
      onClick: () => void;
}) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className={[
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                        active
                              ? 'border-amber-200 bg-amber-50 text-amber-900'
                              : 'border-amber-100 bg-white/90 text-slate-600 hover:bg-amber-50',
                  ].join(' ')}
            >
                  {children}
            </button>
      );
}

function toggleValue<T extends string>(list: T[], value: T) {
      return list.includes(value)
            ? list.filter((item) => item !== value)
            : [...list, value];
}

export default function DutyConfigForm({ duty, onSave, onCancel }: DutyConfigFormProps) {
      const [activeTab, setActiveTab] = useState<'basic' | 'checklist'>('basic');
      const [loading, setLoading] = useState(false);
      const [showTemplateSelector, setShowTemplateSelector] = useState(false);
      const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
      const [newChecklistItem, setNewChecklistItem] = useState<ChecklistItem>({
            itemOrder: 0,
            checklistItem: '',
            isRequired: true,
            stageType: 'normal',
            minPersons: 1,
            maxPersons: 1,
      });

      const [formData, setFormData] = useState({
            dutyCode: '',
            dutyName: '',
            description: '',
            dutyType: 'daily' as DutyType,
            startTime: DEFAULT_TIME,
            endTime: DEFAULT_TIME,
            minPersons: 1,
            maxPersons: 5,
            frequency: 'daily' as DutyType,
            dayOfWeek: 0,
            frequencyPerWeek: 2,
            frequencyPerMonth: 1,
            weeklyDays: ['monday'] as DayOfWeek[],
            monthWeeks: ['last'] as MonthWeek[],
            monthWeekDays: ['saturday'] as DayOfWeek[],
            monthDays: [] as number[],
            eventName: '',
            eventStartDate: '',
            eventEndDate: '',
            requiresStudyScheduleCheck: true,
      });

      trpc.duties.listTemplates.useQuery();
      const getChecklistQuery = trpc.duties.getChecklist.useQuery(
            { dutyConfigId: duty?.id || 0 },
            { enabled: !!duty?.id }
      );
      const createConfigMutation = trpc.duties.createConfig.useMutation();
      const updateConfigMutation = trpc.duties.updateConfig.useMutation();
      const addChecklistItemMutation = trpc.duties.addChecklistItem.useMutation();
      const updateChecklistItemMutation = trpc.duties.updateChecklistItem.useMutation();
      const deleteChecklistItemMutation = trpc.duties.deleteChecklistItem.useMutation();

      useEffect(() => {
            if (duty) {
                  setFormData({
                        dutyCode: duty.dutyCode || '',
                        dutyName: duty.dutyName || '',
                        description: duty.description || '',
                        dutyType: duty.dutyType || 'daily',
                        startTime: duty.startTime || DEFAULT_TIME,
                        endTime: duty.endTime || DEFAULT_TIME,
                        minPersons: duty.minPersons || 1,
                        maxPersons: duty.maxPersons || 5,
                        frequency: duty.frequency || duty.dutyType || 'daily',
                        dayOfWeek: duty.dayOfWeek || 0,
                        frequencyPerWeek: duty.frequencyPerWeek || 2,
                        frequencyPerMonth: duty.frequencyPerMonth || 1,
                        weeklyDays: normalizeArrayValue<DayOfWeek>(duty.weeklyDaysJson),
                        monthWeeks: normalizeArrayValue<MonthWeek>(duty.monthWeeksJson),
                        monthWeekDays: normalizeArrayValue<DayOfWeek>(duty.monthWeekDaysJson),
                        monthDays: normalizeArrayValue<number>(duty.monthDaysJson),
                        eventName: duty.eventName || '',
                        eventStartDate: duty.eventStartDate || '',
                        eventEndDate: duty.eventEndDate || '',
                        requiresStudyScheduleCheck: duty.requiresStudyScheduleCheck !== false,
                  });
            }
      }, [duty]);

      useEffect(() => {
            if (getChecklistQuery.data) {
                  setChecklistItems(
                        (getChecklistQuery.data as ChecklistItem[]).map((item) => ({
                              ...item,
                              stageType: item.stageType || 'normal',
                              minPersons: item.minPersons || 1,
                              maxPersons: item.maxPersons || 1,
                        }))
                  );
            }
      }, [getChecklistQuery.data]);

      const selectedDutyType = useMemo(
            () => DUTY_TYPE_OPTIONS.find((item) => item.value === formData.dutyType),
            [formData.dutyType]
      );

      const handleSelectTemplate = (template: DutyTemplate) => {
            setFormData((current) => ({
                  ...current,
                  dutyCode: `${template.templateCode}_${Date.now()}`,
                  dutyName: template.templateName,
                  description: template.description,
                  startTime: template.startTime,
                  endTime: template.endTime,
                  minPersons: template.minPersons,
                  maxPersons: template.maxPersons,
                  dutyType: template.dutyType || 'daily',
                  frequency: template.dutyType || 'daily',
            }));
            setShowTemplateSelector(false);
      };

      const validateForm = () => {
            if (!formData.dutyCode.trim()) return 'Vui lòng nhập mã công tác.';
            if (!formData.dutyName.trim()) return 'Vui lòng nhập tên công tác.';

            if (formData.maxPersons < formData.minPersons) {
                  return 'Số người tối đa phải lớn hơn hoặc bằng số người tối thiểu.';
            }

            if (formData.dutyType === 'weekly') {
                  if (formData.frequencyPerWeek <= 0) return 'Vui lòng nhập tần suất theo tuần.';
                  if (formData.weeklyDays.length === 0) return 'Vui lòng chọn thứ thực hiện trong tuần.';
            }

            if (formData.dutyType === 'monthly') {
                  if (formData.frequencyPerMonth <= 0) return 'Vui lòng nhập tần suất theo tháng.';
                  if (formData.monthWeeks.length === 0 || formData.monthWeekDays.length === 0) {
                        return 'Vui lòng chọn tuần trong tháng và thứ thực hiện.';
                  }
            }

            if (formData.dutyType === 'event') {
                  if (!formData.eventName.trim()) return 'Vui lòng nhập tên sự kiện.';
                  if (!formData.eventStartDate || !formData.eventEndDate) {
                        return 'Vui lòng nhập ngày bắt đầu và kết thúc sự kiện.';
                  }
            }

            const invalidTask = checklistItems.find(
                  (item) => Number(item.maxPersons || 1) < Number(item.minPersons || 1)
            );

            if (invalidTask) {
                  return `Nhiệm vụ "${invalidTask.checklistItem}" có số người tối đa nhỏ hơn tối thiểu.`;
            }

            return '';
      };

      const persistChecklistItems = async (dutyConfigId: number) => {
            const originalItems = (getChecklistQuery.data || []) as ChecklistItem[];
            const originalIds = originalItems.map((item) => item.id).filter((id): id is number => Boolean(id));
            const currentIds = checklistItems.map((item) => item.id).filter((id): id is number => Boolean(id));
            const deletedIds = originalIds.filter((id) => !currentIds.includes(id));

            for (const id of deletedIds) {
                  await deleteChecklistItemMutation.mutateAsync({ id });
            }

            for (const [index, item] of checklistItems.entries()) {
                  const payload = {
                        checklistItem: item.checklistItem.trim(),
                        description: item.description || undefined,
                        isRequired: item.isRequired,
                        stageType: item.stageType || 'normal',
                        minPersons: Number(item.minPersons || 1),
                        maxPersons: Number(item.maxPersons || 1),
                        estimatedTimeMinutes: item.estimatedTimeMinutes,
                  };

                  if (!payload.checklistItem) continue;

                  if (item.id) {
                        await updateChecklistItemMutation.mutateAsync({
                              id: item.id,
                              ...payload,
                        } as any);
                  } else {
                        await addChecklistItemMutation.mutateAsync({
                              dutyConfigId,
                              itemOrder: index + 1,
                              ...payload,
                        } as any);
                  }
            }
      };

      const handleSave = async () => {
            const errorMessage = validateForm();

            if (errorMessage) {
                  alert(errorMessage);
                  return;
            }

            setLoading(true);

            try {
                  const payload = {
                        dutyCode: formData.dutyCode.trim(),
                        dutyName: formData.dutyName.trim(),
                        description: formData.description || undefined,
                        dutyType: formData.dutyType,
                        startTime: formData.startTime,
                        endTime: formData.endTime,
                        minPersons: Number(formData.minPersons),
                        maxPersons: Number(formData.maxPersons),
                        frequency: formData.dutyType,
                        dayOfWeek: formData.weeklyDays.length
                              ? DAY_OPTIONS.findIndex((day) => day.value === formData.weeklyDays[0])
                              : formData.dayOfWeek,
                        frequencyPerWeek:
                              formData.dutyType === 'weekly' ? Number(formData.frequencyPerWeek) : null,
                        frequencyPerMonth:
                              formData.dutyType === 'monthly' ? Number(formData.frequencyPerMonth) : null,
                        weeklyDaysJson: formData.dutyType === 'weekly' ? formData.weeklyDays : null,
                        monthWeeksJson: formData.dutyType === 'monthly' ? formData.monthWeeks : null,
                        monthWeekDaysJson:
                              formData.dutyType === 'monthly' ? formData.monthWeekDays : null,
                        monthDaysJson: formData.dutyType === 'monthly' ? formData.monthDays : null,
                        eventName: formData.dutyType === 'event' ? formData.eventName : null,
                        eventStartDate:
                              formData.dutyType === 'event' && formData.eventStartDate
                                    ? new Date(formData.eventStartDate)
                                    : null,
                        eventEndDate:
                              formData.dutyType === 'event' && formData.eventEndDate
                                    ? new Date(formData.eventEndDate)
                                    : null,
                        requiresStudyScheduleCheck: formData.requiresStudyScheduleCheck,
                        isActive: true,
                  };

                  let dutyConfigId = duty?.id;

                  if (duty?.id) {
                        await updateConfigMutation.mutateAsync({
                              id: duty.id,
                              ...payload,
                        } as any);
                  } else {
                        const result = await createConfigMutation.mutateAsync(payload as any);
                        dutyConfigId = (result as any)?.insertId || (result as any)?.id || dutyConfigId;
                  }

                  if (dutyConfigId) {
                        await persistChecklistItems(Number(dutyConfigId));
                  }

                  onSave();
            } catch (error) {
                  console.error('[DutyConfigForm] save error', error);
                  alert(error instanceof Error ? error.message : 'Không thể lưu công tác.');
            } finally {
                  setLoading(false);
            }
      };

      const handleAddChecklistItem = () => {
            const checklistItem = newChecklistItem.checklistItem.trim();

            if (!checklistItem) {
                  alert('Vui lòng nhập nội dung nhiệm vụ.');
                  return;
            }

            if (Number(newChecklistItem.maxPersons || 1) < Number(newChecklistItem.minPersons || 1)) {
                  alert('Số người tối đa phải lớn hơn hoặc bằng số người tối thiểu.');
                  return;
            }

            setChecklistItems((current) => [
                  ...current,
                  {
                        ...newChecklistItem,
                        checklistItem,
                        itemOrder: current.length + 1,
                        minPersons: Number(newChecklistItem.minPersons || 1),
                        maxPersons: Number(newChecklistItem.maxPersons || 1),
                  },
            ]);

            setNewChecklistItem({
                  itemOrder: 0,
                  checklistItem: '',
                  isRequired: true,
                  stageType: formData.dutyType === 'event' ? 'preparation' : 'normal',
                  minPersons: 1,
                  maxPersons: 1,
            });
      };

      const handleDeleteChecklistItem = (index: number) => {
            setChecklistItems((current) =>
                  current
                        .filter((_, itemIndex) => itemIndex !== index)
                        .map((item, itemIndex) => ({
                              ...item,
                              itemOrder: itemIndex + 1,
                        }))
            );
      };

      return (
            <div className="space-y-4 text-slate-800">
                  <div className="rounded-2xl border border-amber-100/75 bg-white/88 p-1 shadow-[0_6px_18px_rgba(120,53,15,0.035)]">
                        <div className="grid gap-1 sm:grid-cols-2">
                              {[
                                    { key: 'basic', label: 'Công tác' },
                                    { key: 'checklist', label: 'Công đoạn / nhiệm vụ' },
                              ].map((tab) => (
                                    <button
                                          key={tab.key}
                                          type="button"
                                          onClick={() => setActiveTab(tab.key as 'basic' | 'checklist')}
                                          className={[
                                                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                                                activeTab === tab.key
                                                      ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'
                                                      : 'text-slate-500 hover:bg-amber-50/70 hover:text-slate-800',
                                          ].join(' ')}
                                    >
                                          {tab.label}
                                    </button>
                              ))}
                        </div>
                  </div>

                  {activeTab === 'basic' && (
                        <div className="space-y-4">
                              {!duty && (
                                    <div className="flex flex-col gap-2 rounded-2xl border border-amber-100/75 bg-white/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                          <p className="text-sm leading-6 text-slate-500">
                                                Có thể chọn mẫu trước, sau đó chỉnh lại loại công tác, lịch lặp và nhiệm vụ nhỏ.
                                          </p>
                                          <button
                                                type="button"
                                                onClick={() => setShowTemplateSelector(true)}
                                                className="shrink-0 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                                          >
                                                Chọn công tác mẫu
                                          </button>
                                    </div>
                              )}

                              <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="space-y-1.5">
                                          <span className="text-sm font-medium text-slate-700">Mã công tác *</span>
                                          <input
                                                type="text"
                                                value={formData.dutyCode}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, dutyCode: event.target.value })
                                                }
                                                disabled={!!duty}
                                                className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80 disabled:bg-slate-50"
                                                placeholder="VD: DI_CHO"
                                          />
                                    </label>

                                    <label className="space-y-1.5">
                                          <span className="text-sm font-medium text-slate-700">Tên công tác *</span>
                                          <input
                                                type="text"
                                                value={formData.dutyName}
                                                onChange={(event) =>
                                                      setFormData({ ...formData, dutyName: event.target.value })
                                                }
                                                className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                placeholder="VD: Đi chợ, Tập hát, Tổng vệ sinh"
                                          />
                                    </label>
                              </div>

                              <label className="space-y-1.5">
                                    <span className="text-sm font-medium text-slate-700">Mô tả</span>
                                    <textarea
                                          value={formData.description}
                                          onChange={(event) =>
                                                setFormData({ ...formData, description: event.target.value })
                                          }
                                          className="min-h-[72px] w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                          placeholder="Mô tả ngắn mục đích công tác"
                                    />
                              </label>

                              <div className="rounded-2xl border border-amber-100/75 bg-white/72 p-3 shadow-[0_4px_14px_rgba(120,53,15,0.025)]">
                                    <p className="mb-2 text-sm font-semibold text-slate-800">Loại công tác</p>
                                    <div className="grid gap-2 lg:grid-cols-4">
                                          {DUTY_TYPE_OPTIONS.map((option) => (
                                                <button
                                                      key={option.value}
                                                      type="button"
                                                      onClick={() =>
                                                            setFormData({
                                                                  ...formData,
                                                                  dutyType: option.value,
                                                                  frequency: option.value,
                                                            })
                                                      }
                                                      className={[
                                                            'rounded-xl border px-3 py-3 text-left transition',
                                                            formData.dutyType === option.value
                                                                  ? 'border-amber-200 bg-amber-50/75 text-amber-950 shadow-[0_4px_14px_rgba(120,53,15,0.035)]'
                                                                  : 'border-amber-100/75 bg-white/88 text-slate-600 hover:bg-amber-50/65 hover:text-slate-800',
                                                      ].join(' ')}
                                                >
                                                      <p className="text-sm font-bold">{option.label}</p>
                                                      <p className="mt-1 text-xs leading-5 opacity-80">
                                                            {option.description}
                                                      </p>
                                                </button>
                                          ))}
                                    </div>
                              </div>

                              <div className="rounded-2xl border border-amber-100/75 bg-white/72 p-3 shadow-[0_4px_14px_rgba(120,53,15,0.025)]">
                                    <p className="text-sm font-semibold text-slate-800">
                                          Thiết lập lịch — {selectedDutyType?.label}
                                    </p>

                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">Giờ bắt đầu</span>
                                                <input
                                                      type="time"
                                                      value={formData.startTime}
                                                      onChange={(event) =>
                                                            setFormData({ ...formData, startTime: event.target.value })
                                                      }
                                                      className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                />
                                          </label>

                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">Giờ kết thúc</span>
                                                <input
                                                      type="time"
                                                      value={formData.endTime}
                                                      onChange={(event) =>
                                                            setFormData({ ...formData, endTime: event.target.value })
                                                      }
                                                      className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                />
                                          </label>
                                    </div>

                                    {formData.dutyType === 'weekly' && (
                                          <div className="mt-3 space-y-3">
                                                <label className="block max-w-xs space-y-1.5">
                                                      <span className="text-sm font-medium text-slate-700">
                                                            Tần suất / tuần
                                                      </span>
                                                      <input
                                                            type="number"
                                                            min={1}
                                                            max={7}
                                                            value={formData.frequencyPerWeek}
                                                            onChange={(event) =>
                                                                  setFormData({
                                                                        ...formData,
                                                                        frequencyPerWeek: Number(event.target.value || 1),
                                                                  })
                                                            }
                                                            className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                      />
                                                </label>

                                                <div>
                                                      <p className="mb-2 text-sm font-medium text-slate-700">
                                                            Thứ thực hiện
                                                      </p>
                                                      <div className="flex flex-wrap gap-2">
                                                            {DAY_OPTIONS.map((day) => (
                                                                  <TogglePill
                                                                        key={day.value}
                                                                        active={formData.weeklyDays.includes(day.value)}
                                                                        onClick={() =>
                                                                              setFormData({
                                                                                    ...formData,
                                                                                    weeklyDays: toggleValue(
                                                                                          formData.weeklyDays,
                                                                                          day.value
                                                                                    ),
                                                                              })
                                                                        }
                                                                  >
                                                                        {day.label}
                                                                  </TogglePill>
                                                            ))}
                                                      </div>
                                                </div>
                                          </div>
                                    )}

                                    {formData.dutyType === 'monthly' && (
                                          <div className="mt-3 space-y-3">
                                                <label className="block max-w-xs space-y-1.5">
                                                      <span className="text-sm font-medium text-slate-700">
                                                            Tần suất / tháng
                                                      </span>
                                                      <input
                                                            type="number"
                                                            min={1}
                                                            max={10}
                                                            value={formData.frequencyPerMonth}
                                                            onChange={(event) =>
                                                                  setFormData({
                                                                        ...formData,
                                                                        frequencyPerMonth: Number(event.target.value || 1),
                                                                  })
                                                            }
                                                            className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                      />
                                                </label>

                                                <div>
                                                      <p className="mb-2 text-sm font-medium text-slate-700">
                                                            Tuần trong tháng
                                                      </p>
                                                      <div className="flex flex-wrap gap-2">
                                                            {MONTH_WEEK_OPTIONS.map((week) => (
                                                                  <TogglePill
                                                                        key={week.value}
                                                                        active={formData.monthWeeks.includes(week.value)}
                                                                        onClick={() =>
                                                                              setFormData({
                                                                                    ...formData,
                                                                                    monthWeeks: toggleValue(
                                                                                          formData.monthWeeks,
                                                                                          week.value
                                                                                    ),
                                                                              })
                                                                        }
                                                                  >
                                                                        {week.label}
                                                                  </TogglePill>
                                                            ))}
                                                      </div>
                                                </div>

                                                <div>
                                                      <p className="mb-2 text-sm font-medium text-slate-700">
                                                            Thứ trong tuần đã chọn
                                                      </p>
                                                      <div className="flex flex-wrap gap-2">
                                                            {DAY_OPTIONS.map((day) => (
                                                                  <TogglePill
                                                                        key={day.value}
                                                                        active={formData.monthWeekDays.includes(day.value)}
                                                                        onClick={() =>
                                                                              setFormData({
                                                                                    ...formData,
                                                                                    monthWeekDays: toggleValue(
                                                                                          formData.monthWeekDays,
                                                                                          day.value
                                                                                    ),
                                                                              })
                                                                        }
                                                                  >
                                                                        {day.label}
                                                                  </TogglePill>
                                                            ))}
                                                      </div>
                                                </div>
                                          </div>
                                    )}

                                    {formData.dutyType === 'event' && (
                                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-medium text-slate-700">Tên sự kiện</span>
                                                      <input
                                                            type="text"
                                                            value={formData.eventName}
                                                            onChange={(event) =>
                                                                  setFormData({
                                                                        ...formData,
                                                                        eventName: event.target.value,
                                                                  })
                                                            }
                                                            className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                            placeholder="VD: Lễ bổn mạng"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-medium text-slate-700">Từ ngày</span>
                                                      <input
                                                            type="date"
                                                            value={formData.eventStartDate}
                                                            onChange={(event) =>
                                                                  setFormData({
                                                                        ...formData,
                                                                        eventStartDate: event.target.value,
                                                                  })
                                                            }
                                                            className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <span className="text-sm font-medium text-slate-700">Đến ngày</span>
                                                      <input
                                                            type="date"
                                                            value={formData.eventEndDate}
                                                            onChange={(event) =>
                                                                  setFormData({
                                                                        ...formData,
                                                                        eventEndDate: event.target.value,
                                                                  })
                                                            }
                                                            className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                      />
                                                </label>
                                          </div>
                                    )}
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="space-y-1.5">
                                          <span className="text-sm font-medium text-slate-700">Số người tối thiểu</span>
                                          <input
                                                type="number"
                                                min={1}
                                                value={formData.minPersons}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            minPersons: Number(event.target.value || 1),
                                                      })
                                                }
                                                className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                          />
                                    </label>

                                    <label className="space-y-1.5">
                                          <span className="text-sm font-medium text-slate-700">Số người tối đa</span>
                                          <input
                                                type="number"
                                                min={1}
                                                value={formData.maxPersons}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            maxPersons: Number(event.target.value || 1),
                                                      })
                                                }
                                                className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                          />
                                    </label>
                              </div>

                              <label className="flex items-center gap-2 rounded-xl border border-amber-100 bg-white/80 px-3 py-2">
                                    <input
                                          type="checkbox"
                                          checked={formData.requiresStudyScheduleCheck}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      requiresStudyScheduleCheck: event.target.checked,
                                                })
                                          }
                                          className="h-4 w-4 rounded border-amber-100"
                                    />
                                    <span className="text-sm font-medium text-slate-700">
                                          Kiểm tra xung đột với lịch học khi phân công học viên
                                    </span>
                              </label>
                        </div>
                  )}

                  {activeTab === 'checklist' && (
                        <div className="space-y-4">
                              <div className="rounded-2xl border border-amber-100 bg-amber-50/55 p-3 text-sm leading-6 text-amber-900">
                                    Mỗi công đoạn/nhiệm vụ có số người tối thiểu và tối đa riêng. Với công tác sự kiện,
                                    hãy chia theo giai đoạn: chuẩn bị, trong khi diễn ra, sau khi diễn ra.
                              </div>

                              {checklistItems.length > 0 && (
                                    <div className="space-y-2">
                                          {checklistItems.map((item, index) => (
                                                <div
                                                      key={item.id || index}
                                                      className="rounded-2xl border border-amber-100 bg-white/85 p-3"
                                                >
                                                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                            <div>
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="font-bold text-slate-900">
                                                                              {item.checklistItem}
                                                                        </p>
                                                                        <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                                                              {
                                                                                    STAGE_OPTIONS.find(
                                                                                          (stage) => stage.value === item.stageType
                                                                                    )?.label
                                                                              }
                                                                        </span>
                                                                        <span className="rounded-full border border-slate-100 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                                              {item.minPersons || 1}-{item.maxPersons || 1} người
                                                                        </span>
                                                                  </div>
                                                                  {item.description && (
                                                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                              {item.description}
                                                                        </p>
                                                                  )}
                                                            </div>

                                                            <button
                                                                  type="button"
                                                                  onClick={() => handleDeleteChecklistItem(index)}
                                                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                            >
                                                                  <Trash2 className="h-3.5 w-3.5" />
                                                                  Xóa
                                                            </button>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              )}

                              <div className="space-y-3 rounded-2xl border border-amber-100/75 bg-white/72 p-3 shadow-[0_4px_14px_rgba(120,53,15,0.025)]">
                                    <p className="font-bold text-slate-900">Thêm công đoạn / nhiệm vụ</p>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                          <label className="space-y-1.5 sm:col-span-2">
                                                <span className="text-sm font-medium text-slate-700">
                                                      Nội dung nhiệm vụ *
                                                </span>
                                                <input
                                                      type="text"
                                                      value={newChecklistItem.checklistItem}
                                                      onChange={(event) =>
                                                            setNewChecklistItem({
                                                                  ...newChecklistItem,
                                                                  checklistItem: event.target.value,
                                                            })
                                                      }
                                                      className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                      placeholder="VD: Lau bàn ăn, kiểm tra bếp, chuẩn bị ghế"
                                                />
                                          </label>

                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">Giai đoạn</span>
                                                <select
                                                      value={newChecklistItem.stageType || 'normal'}
                                                      onChange={(event) =>
                                                            setNewChecklistItem({
                                                                  ...newChecklistItem,
                                                                  stageType: event.target.value as StageType,
                                                            })
                                                      }
                                                      className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                >
                                                      {STAGE_OPTIONS.map((stage) => (
                                                            <option key={stage.value} value={stage.value}>
                                                                  {stage.label}
                                                            </option>
                                                      ))}
                                                </select>
                                          </label>

                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">
                                                      Thời gian ước tính (phút)
                                                </span>
                                                <input
                                                      type="number"
                                                      min={0}
                                                      value={newChecklistItem.estimatedTimeMinutes || ''}
                                                      onChange={(event) =>
                                                            setNewChecklistItem({
                                                                  ...newChecklistItem,
                                                                  estimatedTimeMinutes: event.target.value
                                                                        ? Number(event.target.value)
                                                                        : undefined,
                                                            })
                                                      }
                                                      className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                />
                                          </label>

                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">
                                                      Số người tối thiểu
                                                </span>
                                                <input
                                                      type="number"
                                                      min={1}
                                                      value={newChecklistItem.minPersons || 1}
                                                      onChange={(event) =>
                                                            setNewChecklistItem({
                                                                  ...newChecklistItem,
                                                                  minPersons: Number(event.target.value || 1),
                                                            })
                                                      }
                                                      className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                />
                                          </label>

                                          <label className="space-y-1.5">
                                                <span className="text-sm font-medium text-slate-700">
                                                      Số người tối đa
                                                </span>
                                                <input
                                                      type="number"
                                                      min={1}
                                                      value={newChecklistItem.maxPersons || 1}
                                                      onChange={(event) =>
                                                            setNewChecklistItem({
                                                                  ...newChecklistItem,
                                                                  maxPersons: Number(event.target.value || 1),
                                                            })
                                                      }
                                                      className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                />
                                          </label>

                                          <label className="space-y-1.5 sm:col-span-2">
                                                <span className="text-sm font-medium text-slate-700">Mô tả</span>
                                                <input
                                                      type="text"
                                                      value={newChecklistItem.description || ''}
                                                      onChange={(event) =>
                                                            setNewChecklistItem({
                                                                  ...newChecklistItem,
                                                                  description: event.target.value,
                                                            })
                                                      }
                                                      className="w-full rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100/80"
                                                      placeholder="Ghi chú ngắn nếu cần"
                                                />
                                          </label>
                                    </div>

                                    <button
                                          type="button"
                                          onClick={handleAddChecklistItem}
                                          className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm nhiệm vụ
                                    </button>
                              </div>
                        </div>
                  )}

                  <div className="flex gap-3 border-t border-amber-100 pt-4">
                        <button
                              type="button"
                              onClick={onCancel}
                              className="flex-1 rounded-xl border border-amber-100 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50"
                        >
                              Hủy
                        </button>
                        <button
                              type="button"
                              onClick={handleSave}
                              disabled={loading}
                              className="flex-1 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                              {loading ? 'Đang lưu...' : duty ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                  </div>

                  {showTemplateSelector && (
                        <TemplateSelector
                              onSelect={handleSelectTemplate}
                              onCancel={() => setShowTemplateSelector(false)}
                        />
                  )}
            </div>
      );
}
