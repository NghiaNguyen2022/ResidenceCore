'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

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
};

type SmartAssigneeOption = {
      id: number | string;
      label: string;
      todayCount?: number;
      weekCount?: number;
      monthCount?: number;
      isBusyToday?: boolean;
      isOverloaded?: boolean;
      recommendScore?: number;
      recommendLabel?: string;
};

type DutiesTabProps = {
      assignmentForm: AssignmentForm;
      onAssignmentFormChange: (form: AssignmentForm) => void;

      dutyConfigs: any[];
      selectedDutyConfig?: any | null;
      assigneeOptions: SmartAssigneeOption[];

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
      onSaveAssignment: () => void;
      onOpenDutyTemplateDialog: () => void;

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
      const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

      const selectDateAndOpenDayView = (date: string) => {
            onDateChange(date);
            setViewMode('day');
      };

      const rangeAssignments = allAssignments || assignments;

      const handleSaveAssignment = async () => {
            await onSaveAssignment();
            setIsAssignmentModalOpen(false);
      };

      return (
            <div className="space-y-4">
                  <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-white/88 p-4 shadow-[0_6px_18px_rgba(120,53,15,0.035)] lg:flex-row lg:items-center lg:justify-between">
                        <div>
                              <h2 className="text-xl font-bold text-slate-900">Công tác</h2>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Theo dõi ngày/tuần/tháng. Phân công được mở riêng để đủ không gian xem tải việc, lịch học và preview.
                              </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                              <DutyViewSwitcher value={viewMode} onChange={setViewMode} />
                              <button
                                    type="button"
                                    onClick={() => setIsAssignmentModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                              >
                                    <Plus className="h-4 w-4" />
                                    Phân công công tác
                              </button>
                        </div>
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

                  {isAssignmentModalOpen && (
                        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/38 px-4 py-6 backdrop-blur-sm">
                              <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff8ef_100%)] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
                                    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-amber-100/70 bg-white/94 px-5 py-4 backdrop-blur">
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                                                      Phân công thông minh
                                                </p>
                                                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                                      Phân công công tác
                                                </h2>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                      Chọn công tác, ngày/chu kỳ và đối tượng. Danh sách sẽ hiển thị tải việc để phân công công bằng hơn.
                                                </p>
                                          </div>

                                          <button
                                                type="button"
                                                onClick={() => setIsAssignmentModalOpen(false)}
                                                className="rounded-xl border border-amber-100 bg-white px-2.5 py-2 text-slate-500 shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition hover:bg-amber-50"
                                          >
                                                <X className="h-4 w-4" />
                                          </button>
                                    </div>

                                    <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-5">
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
                                                onSave={handleSaveAssignment}
                                                onOpenDutyTemplateDialog={onOpenDutyTemplateDialog}
                                                fullScreen
                                          />
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}

export default DutiesTab;
