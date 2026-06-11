'use client';

import { useState } from 'react';

import DutyAssignmentForm from './DutyAssignmentForm';
import DutyDayView from './DutyDayView';
import DutyMonthView from './DutyMonthView';
import DutyViewSwitcher from './DutyViewSwitcher';
import DutyWeekView from './DutyWeekView';

type DutyStatusFilter = 'all' | 'open' | 'overdue' | 'completed' | 'skipped' | 'cancelled';
type AssignToType = 'resident' | 'team' | 'room' | 'committee';
type DutyViewMode = 'day' | 'week' | 'month';

type AssignmentForm = {
      dutyConfigId: string;
      assignedDate: string;
      startTime: string;
      endTime: string;
      assignedToType: AssignToType;
      assignedToId: string;
      assignWholeWeek: boolean;
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
            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
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
                        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                              <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                          Lịch công tác
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Xem công tác theo ngày, tuần hoặc tháng.
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
