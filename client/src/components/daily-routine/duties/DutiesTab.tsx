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

      const selectDateAndOpenDayView = (date: string) => {
            onDateChange(date);
            setViewMode('day');
      };

      const rangeAssignments = allAssignments || assignments;

      return (
            <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
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
                        <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-white/88 p-4 shadow-[0_6px_18px_rgba(120,53,15,0.035)] md:flex-row md:items-center md:justify-between">
                              <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                          Công tác
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Theo dõi công tác theo ngày, tuần hoặc tháng.
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
      );
}

export default DutiesTab;
