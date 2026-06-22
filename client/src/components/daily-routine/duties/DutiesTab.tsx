'use client';

import { useState } from 'react';

import DutyAssignmentForm from './DutyAssignmentForm';
import DutyDayView from './DutyDayView';
import DutyMonthView from './DutyMonthView';
import DutyViewSwitcher from './DutyViewSwitcher';
import DutyWeekView from './DutyWeekView';

type DutyStatusFilter = 'all' | 'open' | 'overdue' | 'completed' | 'skipped' | 'absent' | 'cancelled';
type AssignToType = 'resident' | 'team' | 'room' | 'committee';
type DutyViewMode = 'day' | 'week' | 'month';

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

type DutiesTabProps = {
      assignmentForm: AssignmentForm;
      onAssignmentFormChange: (form: AssignmentForm) => void;

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
      onSaveAssignment: () => void;
      onOpenDutyTemplateDialog: () => void;
      onOpenToday?: () => void;
      onOpenRoutine?: () => void;

      selectedDate: string;
      onDateChange: (value: string) => void;
      statusFilter: DutyStatusFilter;
      onStatusFilterChange: (value: DutyStatusFilter) => void;

      assignments: any[];
      allAssignments?: any[];

      isLoadingAssignments?: boolean;
      onCompleteDuty: (assignment: any) => void;
      onSkipDuty: (assignment: any) => void;
      onCancelDuty: (assignment: any) => void;
};


function DutyFlowGuide({
      onOpenDutyTemplateDialog,
      onOpenRoutine,
      onOpenToday,
}: {
      onOpenDutyTemplateDialog: () => void;
      onOpenRoutine?: () => void;
      onOpenToday?: () => void;
}) {
      const steps = [
            {
                  title: 'Sinh hoạt',
                  description: 'Khung giờ chung trong ngày: học, ăn, cầu nguyện, sinh hoạt chung.',
                  actionText: 'Mở lịch sinh hoạt',
                  onClick: onOpenRoutine,
            },
            {
                  title: 'Công tác',
                  description: 'Mẫu việc cần làm, ví dụ trực nhà ăn, vệ sinh sảnh, đi chợ.',
                  actionText: 'Mẫu công tác',
                  onClick: onOpenDutyTemplateDialog,
            },
            {
                  title: 'Nhiệm vụ',
                  description: 'Checklist nhỏ bên trong công tác: lau bàn, đổ rác, kiểm tra khu vực.',
                  actionText: 'Sửa nhiệm vụ',
                  onClick: onOpenDutyTemplateDialog,
            },
            {
                  title: 'Phân công',
                  description: 'Gán công tác cho học viên, Tổ, Ban hoặc Phòng theo ngày và nơi làm.',
                  actionText: 'Theo dõi hôm nay',
                  onClick: onOpenToday,
            },
      ];

      return (
            <div className="rounded-xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff7ed_100%)] p-3 shadow-[0_10px_26px_rgba(120,53,15,0.055)]">
                  <div className="mb-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                              Liên kết vận hành
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-slate-900">
                              Sinh hoạt → Công tác → Nhiệm vụ → Phân công
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                              Dùng như một luồng duy nhất: có lịch sinh hoạt chung, tạo mẫu công tác, khai báo nhiệm vụ nhỏ, rồi phân công theo ngày/nơi làm.
                        </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {steps.map((step, index) => (
                              <div
                                    key={step.title}
                                    className="rounded-xl border border-amber-100/75 bg-white/78 p-3 shadow-[0_6px_16px_rgba(120,53,15,0.035)]"
                              >
                                    <div className="mb-2 flex items-center gap-2">
                                          <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-amber-100 text-xs font-bold text-amber-900">
                                                {index + 1}
                                          </span>
                                          <p className="font-bold text-slate-900">{step.title}</p>
                                    </div>
                                    <p className="min-h-[44px] text-xs leading-5 text-slate-500">
                                          {step.description}
                                    </p>
                                    {step.onClick && (
                                          <button
                                                type="button"
                                                onClick={step.onClick}
                                                className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                                          >
                                                {step.actionText}
                                          </button>
                                    )}
                              </div>
                        ))}
                  </div>
            </div>
      );
}


export function DutiesTab({
      assignmentForm,
      onAssignmentFormChange,
      dutyConfigs,
      selectedDutyConfig,
      assigneeOptions,
      previewEnabled,
      previewLoading,
      preview,
      isSaving,
      onSaveAssignment,
      onOpenDutyTemplateDialog,
      onOpenToday,
      onOpenRoutine,
      selectedDate,
      onDateChange,
      statusFilter,
      onStatusFilterChange,
      assignments,
      allAssignments,
      isLoadingAssignments,
      onCompleteDuty,
      onSkipDuty,
      onCancelDuty,
}: DutiesTabProps) {
      const [viewMode, setViewMode] = useState<DutyViewMode>('day');

      const selectDateAndOpenDayView = (date: string) => {
            onDateChange(date);
            setViewMode('day');
      };

      const rangeAssignments = allAssignments || assignments;

      return (
            <div className="space-y-5">
                  <DutyFlowGuide
                        onOpenDutyTemplateDialog={onOpenDutyTemplateDialog}
                        onOpenRoutine={onOpenRoutine}
                        onOpenToday={onOpenToday}
                  />

                  <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
                  <DutyAssignmentForm
                        form={assignmentForm}
                        onChange={onAssignmentFormChange}
                        dutyConfigs={dutyConfigs}
                        selectedDutyConfig={selectedDutyConfig}
                        assigneeOptions={assigneeOptions}
                        previewEnabled={previewEnabled}
                        previewLoading={previewLoading}
                        preview={preview}
                        isSaving={isSaving}
                        onSave={onSaveAssignment}
                        onOpenDutyTemplateDialog={onOpenDutyTemplateDialog}
                  />

                  <div className="space-y-4">
                        <div className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-white/88 p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)] md:flex-row md:items-center md:justify-between">
                              <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                          Công tác
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Theo dõi chính theo ngày: ngày, nơi làm, hoàn thành/chưa hoàn thành.
                                    </p>
                              </div>

                              <DutyViewSwitcher
                                    value={viewMode}
                                    onChange={setViewMode}
                              />
                        </div>

                        {viewMode === 'day' && (
                              <DutyDayView
                                    selectedDate={selectedDate}
                                    onDateChange={onDateChange}
                                    statusFilter={statusFilter}
                                    onStatusFilterChange={onStatusFilterChange}
                                    assignments={assignments}
                                    isLoading={isLoadingAssignments}
                                    onCompleteDuty={onCompleteDuty}
                                    onSkipDuty={onSkipDuty}
                                    onCancelDuty={onCancelDuty}
                              />
                        )}

                        {viewMode === 'week' && (
                              <DutyWeekView
                                    selectedDate={selectedDate}
                                    assignments={rangeAssignments}
                                    onSelectDate={selectDateAndOpenDayView}
                              />
                        )}

                        {viewMode === 'month' && (
                              <DutyMonthView
                                    selectedDate={selectedDate}
                                    assignments={rangeAssignments}
                                    onSelectDate={selectDateAndOpenDayView}
                              />
                        )}
                  </div>
            </div>
            </div>
      );
}

export default DutiesTab;
