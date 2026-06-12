'use client';

import { useState } from 'react';

import { trpc } from '@/lib/trpc';
import {
      AppMessageBox,
      type AppMessageBoxState,
} from '@/components/common/AppMessageBox';

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
      onSaveAssignment: () => void | Promise<void>;
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

function normalizeTimeForPayload(value?: string | null) {
      if (!value) return '';

      const text = String(value).trim();

      if (!text) return '';

      const normalMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (normalMatch) {
            return `${normalMatch[1].padStart(2, '0')}:${normalMatch[2]}`;
      }

      const amPmMatch = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (amPmMatch) {
            let hour = Number(amPmMatch[1]);
            const minute = amPmMatch[2];
            const meridiem = amPmMatch[3].toUpperCase();

            if (meridiem === 'PM' && hour < 12) hour += 12;
            if (meridiem === 'AM' && hour === 12) hour = 0;

            return `${String(hour).padStart(2, '0')}:${minute}`;
      }

      if (text.includes('T')) {
            const date = new Date(text);

            if (!Number.isNaN(date.getTime())) {
                  const hour = String(date.getUTCHours()).padStart(2, '0');
                  const minute = String(date.getUTCMinutes()).padStart(2, '0');

                  return `${hour}:${minute}`;
            }
      }

      return text.slice(0, 5);
}

function formatTimeOnly(value?: string | null) {
      return normalizeTimeForPayload(value);
}

function getStudyConflictMessage(conflicts: any[]) {
      if (!conflicts || conflicts.length === 0) {
            return 'Học viên này có lịch học trùng với giờ công tác.';
      }

      const lines = conflicts.map((item) => {
            const busyStartTime = formatTimeOnly(item.busyStartTime || item.startTime);
            const busyEndTime = formatTimeOnly(item.busyEndTime || item.endTime);
            const studyStartTime = formatTimeOnly(item.startTime);
            const studyEndTime = formatTimeOnly(item.endTime);
            const subjectName = item.subjectName ? ` - ${item.subjectName}` : '';

            return `- ${busyStartTime} - ${busyEndTime} (lịch học ${studyStartTime} - ${studyEndTime}${subjectName})`;
      });

      return [
            'Học viên này có lịch học trùng với giờ công tác.',
            '',
            'Khoảng thời gian bận đã tính thêm 60 phút đi/về:',
            ...lines,
            '',
            'Vui lòng chọn khung giờ khác hoặc phân công cho học viên khác.',
      ].join('\n');
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
      const [isCheckingStudyConflict, setIsCheckingStudyConflict] = useState(false);
      const [messageBox, setMessageBox] = useState<AppMessageBoxState>({
            open: false,
            title: '',
            message: '',
            variant: 'info',
            actions: [],
      });

      const selectedResidentId =
            assignmentForm.assignedToType === 'resident'
                  ? Number(assignmentForm.assignedToId || 0)
                  : 0;

      const normalizedStartTime = normalizeTimeForPayload(assignmentForm.startTime);
      const normalizedEndTime = normalizeTimeForPayload(assignmentForm.endTime);

      const studyConflictQuery = trpc.members.checkStudyScheduleConflict.useQuery(
            {
                  residentId: selectedResidentId || 1,
                  assignmentDate: assignmentForm.assignedDate || selectedDate,
                  startTime: normalizedStartTime || '00:00',
                  endTime: normalizedEndTime || '00:01',
                  travelMinutes: 60,
            },
            {
                  enabled: false,
                  retry: false,
                  refetchOnWindowFocus: false,
            }
      );

      const selectDateAndOpenDayView = (date: string) => {
            onDateChange(date);
            setViewMode('day');
      };

      const handleSaveAssignment = async () => {
            const shouldCheckStudySchedule =
                  assignmentForm.assignedToType === 'resident' &&
                  selectedResidentId > 0 &&
                  Boolean(assignmentForm.assignedDate || selectedDate) &&
                  Boolean(normalizedStartTime) &&
                  Boolean(normalizedEndTime);

            if (shouldCheckStudySchedule) {
                  setIsCheckingStudyConflict(true);

                  try {
                        const result = await studyConflictQuery.refetch();

                        if (result.error) {
                              console.error(
                                    '[DutiesTab] Error checking study schedule conflict:',
                                    result.error
                              );
                        }

                        const conflictData = result.data;

                        if (conflictData?.hasConflict) {
                              setMessageBox({
                                    open: true,
                                    title: 'Trùng lịch học',
                                    message: getStudyConflictMessage(conflictData.conflicts || []),
                                    variant: 'warning',
                                    cancelText: 'Đã hiểu',
                                    actions: [],
                              });

                              return;
                        }
                  } finally {
                        setIsCheckingStudyConflict(false);
                  }
            }

            await onSaveAssignment();
      };

      const rangeAssignments = allAssignments || assignments;

      const closeMessageBox = () => {
            setMessageBox({
                  open: false,
                  title: '',
                  message: '',
                  variant: 'info',
                  actions: [],
            });
      };

      const handleMessageBoxConfirm = async () => {
            closeMessageBox();
      };

      return (
            <>
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
                        isSaving={isSaving || isCheckingStudyConflict}
                        onSave={handleSaveAssignment}
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

            <AppMessageBox
                  state={messageBox}
                  onCancel={closeMessageBox}
                  onConfirm={handleMessageBoxConfirm}
                  isProcessing={isSaving || isCheckingStudyConflict}
            />
            </>
      );
}

export default DutiesTab;
